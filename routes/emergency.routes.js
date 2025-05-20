const express = require('express');
const router = express.Router();
const {
  createEmergency,
  getAllEmergencies,
  donateToEmergency
} = require('../controllers/emergency.controller');

const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');


router.post('/', authenticateJWT, authorizeRoles('admin', 'orphanage'), createEmergency);



router.get('/', getAllEmergencies);


router.post('/:id/donate', authenticateJWT, donateToEmergency);

module.exports = router;
