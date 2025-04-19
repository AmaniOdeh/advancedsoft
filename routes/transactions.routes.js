const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');

router.post('/:donationId', transactionController.processTransaction);
router.get('/', transactionController.getAllTransactions);

module.exports = router;
