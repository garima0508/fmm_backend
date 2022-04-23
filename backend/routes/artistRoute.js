const express = require("express");
const router = express.Router();

const {
  registerArtist,
  loginArtist,
  forgotPassword,
  resetPassword,
  logout,
  updateProfile,
  getArtistDetails,
  updatePassword,
} = require("../controllers/artistController");

const {
  isAuthenticatedArtist,
  authorizedRoles,
} = require("../middleware/auth");

router.route("/registerArtist").post(registerArtist);

router.route("/loginArtist").post(loginArtist);

router.route("/artistPassword/forgot").post(forgotPassword);

router.route("/artistPassword/reset/:token").put(resetPassword);

router.route("/logoutArtist").get(logout);

router.route("/artist").get(isAuthenticatedArtist, getArtistDetails);

router
  .route("/artistPassword/update")
  .put(isAuthenticatedArtist, updatePassword);

router.route("/artist/update").put(isAuthenticatedArtist, updateProfile);

module.exports = router;
