const express = require('express');
const router = express.Router();
const partnerController = require('../controllers/partner.controller');

router.post('/', partnerController.addPartner);
router.get('/', partnerController.getAllPartners);

module.exports = router;
