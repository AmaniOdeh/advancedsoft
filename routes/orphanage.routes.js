const express = require("express");
const router = express.Router();
const orphanageController = require("../controllers/orphanage.controller");

// إنشاء دار أيتام جديدة
router.post("/create", orphanageController.createOrphanage);

module.exports = router;
