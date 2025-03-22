const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profile.controller");
const { authenticateJWT } = require("../middleware/auth.middleware");

router.get("/", authenticateJWT, profileController.getProfile);
router.put("/", authenticateJWT, profileController.updateProfile);
router.delete("/", authenticateJWT, profileController.deleteProfile);

module.exports = router;
