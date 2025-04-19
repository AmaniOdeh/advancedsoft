const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/delivery.controller');

router.get('/tracking/:id', deliveryController.getDonationTracking);
router.put('/update/:id', deliveryController.updateDeliveryStatus);

module.exports = router;
