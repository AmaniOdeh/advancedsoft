const express = require("express");
const router = express.Router();

const { createReport } = require("../controllers/orphanReports.controller");
const upload = require("../middleware/upload"); // تأكدي إنه موجود فعلاً
const { verifyOrphanage } = require("../middleware/auth.middleware");

// 📥 إنشاء تقرير جديد من دار الأيتام مع رفع صورة وتوليد PDF
router.post("/", verifyOrphanage, upload.single("photo"), createReport);

module.exports = router;
