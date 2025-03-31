// 📁 routes/sponsorship.routes.js
const express = require("express");
const router = express.Router();
const sponsorshipController = require("../controllers/sponsorship.controller");
const { authenticateJWT, authorizeRoles } = require("../middleware/auth.middleware");

// إنشاء كفالة جديدة
router.post("/", authenticateJWT, authorizeRoles("sponsor"), sponsorshipController.createSponsorship);

// عرض الكفالات الخاصة بالمستخدم
router.get("/mine", authenticateJWT, authorizeRoles("sponsor"), sponsorshipController.getMySponsorships);

// تعديل كفالة
router.put("/:id", authenticateJWT, authorizeRoles("sponsor"), sponsorshipController.updateSponsorship);

// حذف كفالة
router.delete("/:id", authenticateJWT, authorizeRoles("sponsor"), sponsorshipController.deleteSponsorship);
router.get("/available-orphans", authenticateJWT, authorizeRoles("sponsor"), sponsorshipController.getAvailableOrphans);


module.exports = router;
