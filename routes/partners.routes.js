const express = require('express');
const router = express.Router();
const partnerController = require('../controllers/partner.controller');
const { authenticateJWT, authorizeRoles } = require("../middleware/auth.middleware");
router.post('/',authenticateJWT, authorizeRoles("orphanage"), partnerController.addPartner);
router.get('/',authenticateJWT, authorizeRoles("orphanage"), partnerController.getAllPartners);
module.exports = router;