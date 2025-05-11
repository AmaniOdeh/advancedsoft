const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');
const { authenticateJWT, authorizeRoles } = require("../middleware/auth.middleware");

router.post('/:donationId', authenticateJWT, authorizeRoles("orphanage"), transactionController.processTransaction);
router.get('/',authenticateJWT,  authorizeRoles("orphanage"), transactionController.getAllTransactions);

module.exports = router;
