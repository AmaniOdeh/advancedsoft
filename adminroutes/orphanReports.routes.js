const express = require("express");
const router = express.Router();
const reportController = require("../admincontroller/orphanReports.controller");
const { authenticateJWT, authorizeRoles } = require("../middleware/auth.middleware");

// 🔒 فقط الأدمن يمكنه إدارة التقارير
router.post("/", authenticateJWT, authorizeRoles("admin"), reportController.createReport);
router.get("/:orphan_id", authenticateJWT, authorizeRoles("admin"), reportController.getReportsByOrphan);
router.get("/", authenticateJWT, authorizeRoles("admin"), reportController.getAllReports);
router.put("/:id", authenticateJWT, authorizeRoles("admin"), reportController.updateReport);
router.delete("/:id", authenticateJWT, authorizeRoles("admin"), reportController.deleteReport);

module.exports = router;