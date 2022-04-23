const catchAsyncErrors = require("./catchAsyncErrors");
const errorHandler = require("../utils/errorHandler");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Artist = require("../models/artistModel");

exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new errorHandler("Please Login to access this resource", 401));
  }
  const decodedData = jwt.verify(token, process.env.JWT_SECRET);

  req.user = await User.findById(decodedData.id);
  next();
});
exports.isAuthenticatedArtist = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new errorHandler("Please Login to access this resource", 401));
  }
  const decodedData = jwt.verify(token, process.env.JWT_SECRET);

  req.artist = await Artist.findById(decodedData.id);
  next();
});
exports.authorizedRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new errorHandler(
          `Role: ${
            req.user ? req.user.role : "undefined"
          } is not allowed to access this resource`,
          403
        )
      );
    }
    next();
  };
};
