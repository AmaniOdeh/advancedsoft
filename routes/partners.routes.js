const express = require('express');
const router = express.Router();
const partnerController = require('../controllers/partner.controller');
const { authenticateJWT, authorizeRoles } = require("../middleware/auth.middleware");

router.post('/',authenticateJWT, authorizeRoles("admin"), partnerController.addPartner);
router.get('/',authenticateJWT, authorizeRoles("admin"), partnerController.getAllPartners);

module.exports = router;
