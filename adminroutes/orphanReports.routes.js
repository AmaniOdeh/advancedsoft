const express = require("express");
const router = express.Router();
const reportController = require("../admincontroller/orphanReports.controller");
const { authenticateJWT, authorizeRoles } = require("../middleware/auth.middleware");

// 🔒 فقط الأدمن يمكنه إدارة التقارير
router.post("/", authenticateJWT, authorizeRoles("orphanage"), reportController.createReport);
router.get("/:orphan_id", authenticateJWT, authorizeRoles("orphanage"), reportController.getReportsByOrphan);
router.get("/", authenticateJWT, authorizeRoles("orphanage"), reportController.getAllReports);
router.put("/:id", authenticateJWT, authorizeRoles("orphanage"), reportController.updateReport);
router.delete("/:id", authenticateJWT, authorizeRoles("orphanage"), reportController.deleteReport);

module.exports = router;