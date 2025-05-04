const express = require("express");
const router = express.Router();
const stripeController = require("../controllers/stripe.controller");

router.post("/create-session", stripeController.createCheckoutSession);

module.exports = router;
