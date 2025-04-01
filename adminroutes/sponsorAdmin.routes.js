// 📁 routes/adminroutes/sponsorAdmin.routes.js
const express = require("express");
const router = express.Router();
const sponsorAdminController = require("../admincontroller/sponsorAdmin.controller");
const { authenticateJWT, authorizeRoles } = require("../middleware/auth.middleware");

// 🔐 جميع العمليات للأدمن فقط
router.get("/", authenticateJWT, authorizeRoles("admin"), sponsorAdminController.getAllSponsorships);
router.post("/", authenticateJWT, authorizeRoles("admin"), sponsorAdminController.createSponsorship);
router.put("/:id", authenticateJWT, authorizeRoles("admin"), sponsorAdminController.updateSponsorship);
router.delete("/:id", authenticateJWT, authorizeRoles("admin"), sponsorAdminController.deleteSponsorship);

module.exports = router;
