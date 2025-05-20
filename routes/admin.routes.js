const express = require('express');
const router = express.Router();

const { verifyOrphanage, getOrphanages } = require('../controllers/admin.controller');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');


router.patch('/orphanages/:id/verify', authenticateJWT, authorizeRoles('admin'), verifyOrphanage);


router.get('/orphanages', getOrphanages);

module.exports = router;
