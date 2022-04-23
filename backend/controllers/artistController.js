const Artist = require("../models/artistModel");
const errorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail.js");
const crypto = require("crypto");

// Register Artist
exports.registerArtist = catchAsyncErrors(async (req, res, next) => {
  const { fname, lname, email, password } = req.body;

  const artist = await Artist.create({
    fname,
    lname,
    email,
    password,
  });
  sendToken(artist, 201, res);
});

// Login Artist
exports.loginArtist = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  // checking if user has given password and email both
  if (!email || !password) {
    return next(new errorHandler("Please enter Email & Password", 400));
  }
  const artist = await Artist.findOne({ email }).select("+password");
  if (!artist) {
    return next(new errorHandler("Invalid email or password", 401));
  }
  const isPasswordMatched = await artist.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new errorHandler("Invalid email or password", 401));
  }
  sendToken(artist, 200, res);
});

// Logout Artist
exports.logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});

// Forgot password
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const artist = await Artist.findOne({ email: req.body.email });

  if (!artist) {
    return next(new errorHandler("User not found", 404));
  }
  // Get resetPassword Token
  const resetToken = artist.getResetPasswordToken();
  await artist.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${resetToken}`;

  const message = `Your password reset token is: \n\n${resetPasswordUrl}\n\nIf you have not requested this email, then please ignore.`;

  try {
    await sendEmail({
      email: artist.email,
      subject: `FMM Password Recovery`,
      message,
    });
    res.status(200).json({
      success: true,
      message: `Email sent to ${artist.email} successfully`,
    });
  } catch (error) {
    artist.resetPasswordToken = undefined;
    artist.resetPasswordExpire = undefined;

    await artist.save({ validateBeforeSave: false });

    return next(new errorHandler(error.message, 500));
  }
});

// Reset Password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  // creating token hash
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const artist = await Artist.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!artist) {
    return next(
      new errorHandler(
        "Reset Password token is invalid or has been expired",
        400
      )
    );
  }
  if (req.body.password !== req.body.confirmPassword) {
    return next(new errorHandler("Password does not match", 400));
  }

  artist.password = req.body.password;
  artist.resetPasswordToken = undefined;
  artist.resetPasswordExpire = undefined;
  await artist.save();
  sendToken(artist, 200, res);
});

// Get Artist details
exports.getArtistDetails = catchAsyncErrors(async (req, res, next) => {
  const artist = await Artist.findById(req.artist.id);
  res.status(200).json({
    success: true,
    artist,
  });
});

// Update Artist password
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  const artist = await Artist.findById(req.user.id).select("+password");

  const isPasswordMatched = await artist.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return next(new errorHandler("Old password is incorrect", 400));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new errorHandler("Password does not match", 400));
  }
  artist.password = req.body.newPassword;

  await artist.save();
  sendToken(artist, 200, res);
});
// Update Artist profile
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
  const newArtistData = {
    fname: req.body.fname,
    lname: req.body.lname,
    email: req.body.email,
    avatar: req.body.avatar,
    bio: req.body.bio,
    contactNo: req.body.contactNo,
    location: req.body.location,
    locationServed: req.body.locationServed,
    experience: req.body.experience,
    specialisation: req.body.specialisation,
    certifiedBy: req.body.certifiedBy,
    images: req.body.images,
  };

  const artist = await Artist.findByIdAndUpdate(req.artist.id, newArtistData, {
    new: true,
    runValidators: true,
    userFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    newArtistData,
  });
});
