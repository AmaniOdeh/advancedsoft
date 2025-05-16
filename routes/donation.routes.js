// 📁 routes/donation.routes.js
const express = require("express");
const router = express.Router();
const donationController = require("../controllers/donation.controller");
const { authenticateJWT, authorizeRoles } = require("../middleware/auth.middleware");

// 🔒 donor routes
router.post("/", authenticateJWT, authorizeRoles("donor"), donationController.createDonation);
router.get("/mine", authenticateJWT, authorizeRoles("donor"), donationController.getMyDonations);
router.put("/:id", authenticateJWT, authorizeRoles("donor"), donationController.updateDonation);
router.delete("/:id", authenticateJWT, authorizeRoles("donor"), donationController.deleteDonation);
router.get("/my/stats", authenticateJWT, authorizeRoles("donor"), donationController.getMyDonationStats);

// 🔒 orphanage routes
router.get("/orphanage/all", authenticateJWT, authorizeRoles("orphanage"), donationController.getOrphanageDonations);
router.patch("/orphanage/update-status/:id", authenticateJWT, authorizeRoles("orphanage"), donationController.updateDonationStatus);

module.exports = router;
