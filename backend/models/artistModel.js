const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const artistSchema = new mongoose.Schema({
  fname: {
    type: String,
    required: [true, "please Enter your First Name"],
    maxLength: [30, "Name cannot exceed 30 characters"],
    minLength: [4, "Name cannot be less than 4 characters"],
  },
  lname: {
    type: String,
    required: [true, "please Enter your Last Name"],
    maxLength: [30, "Name cannot exceed 30 characters"],
    minLength: [4, "Name cannot be less than 4 characters"],
  },
  email: {
    type: String,
    required: [true, "Please Enter Your Email"],
    unique: true,
    validate: [validator.isEmail, "Please Enter a valid Email"],
  },
  password: {
    type: String,
    required: [true, "Please Enter Your Password"],
    minLength: [8, "Password cannot be less than 8 characters"],
    select: false,
  },
  avatar: {
    public_id: {
      type: String,
    },
    url: {
      type: String,
    },
  },
  bio: {
    type: String,
    default: "MUA",
  },
  contactNo: {
    type: Number,
    unique: true,
    maxLength: [10, "10-digit phone number"],
    minLength: [10, "10-digit phone number"],
  },
  location: {
    type: String,
  },
  locationServed: {
    type: String,
  },
  experience: {
    type: String,
  },
  specialisation: {
    type: String,
  },
  certifiedBy: {
    type: String,
  },
  images: [
    {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
  ],
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

artistSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});
// Compare password
artistSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
// JWT Token
artistSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};
// Generating Password reset Token
artistSchema.methods.getResetPasswordToken = function () {
  // Generating token
  const resetToken = crypto.randomBytes(20).toString("hex");
  // Hashing and adding to user Schema
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  return resetToken;
};
module.exports = mongoose.model("Artist", artistSchema);
