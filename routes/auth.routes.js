const express = require("express");
const router = express.Router();

const signupController = require("../controllers/auth.controller");
const signinController = require("../controllers/signin.controller");

router.post("/signup", signupController.signup);
router.post("/signin", signinController.signin); // ← لازم تكون موجودة

module.exports = router;
