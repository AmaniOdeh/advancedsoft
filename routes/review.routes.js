const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');


const middleware = require('../middleware/auth.middleware');
console.log("📦 middleware loaded:", middleware);

const authenticateJWT = middleware.authenticateJWT;
const authorizeRoles = middleware.authorizeRoles;


console.log("🧪 reviewController.addReview:", reviewController.addReview);


router.post('/orphanage/:id', authenticateJWT, authorizeRoles('donor'), reviewController.addReview);
router.get('/orphanage/:id', reviewController.getReviews);

module.exports = router;
