const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/delivery.controller');


router.post('/delivery-requests', deliveryController.createDeliveryRequest);
router.put('/delivery-requests/:id/status', deliveryController.updateDeliveryRequestStatus);
router.put('/delivery-requests/:id/location', deliveryController.updateCurrentLocation);
router.get('/delivery-requests/:id', deliveryController.trackDeliveryRequest);
router.get('/donations/:id/tracking', deliveryController.getDonationTracking);
router.put('/donations/:id/status', deliveryController.updateDonationStatus);

module.exports = router;
