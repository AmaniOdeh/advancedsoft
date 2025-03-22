const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profile.controller");
const { authenticateJWT } = require("../middleware/auth.middleware");

router.get("/me", authenticateJWT, profileController.getProfile);

module.exports = router;
