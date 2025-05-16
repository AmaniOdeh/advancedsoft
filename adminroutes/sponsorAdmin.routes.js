// 📁 routes/adminroutes/sponsorAdmin.routes.js
const express = require("express");
const router = express.Router();
const sponsorAdminController = require("../admincontroller/sponsorAdmin.controller");
const { authenticateJWT, authorizeRoles } = require("../middleware/auth.middleware");

// 🔐 جميع العمليات للأدمن فقط
router.get("/", authenticateJWT, authorizeRoles("orphanage"), sponsorAdminController.getAllSponsorships);
router.post("/", authenticateJWT, authorizeRoles("orphanage"), sponsorAdminController.createSponsorship);
router.put("/:id", authenticateJWT, authorizeRoles("orphanage"), sponsorAdminController.updateSponsorship);
router.delete("/:id", authenticateJWT, authorizeRoles("orphanage"), sponsorAdminController.deleteSponsorship);
router.get("/ending-soon", authenticateJWT, authorizeRoles("orphanage"), sponsorAdminController.getEndingSoonSponsorships);
module.exports = router;
