const express = require("express");
const router = express.Router();

const {
  createReport,
  updateReport,
  deleteReport,
} = require("../controllers/orphanReports.controller");

const upload = require("../middleware/upload");
const { verifyOrphanage } = require("../middleware/auth.middleware");

// 📥 إنشاء تقرير جديد مع رفع صورة وتوليد PDF
router.post("/", verifyOrphanage, upload.single("photo"), createReport);

router.put("/:id", verifyOrphanage, updateReport);
router.delete("/:id", verifyOrphanage, deleteReport);


module.exports = router;
