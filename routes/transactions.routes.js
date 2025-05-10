const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');
const { authenticateJWT, authorizeRoles } = require("../middleware/auth.middleware");

router.post('/:donationId', authenticateJWT, authorizeRoles("admin"), transactionController.processTransaction);
router.get('/',authenticateJWT,  authorizeRoles("admin"), transactionController.getAllTransactions);

module.exports = router;
