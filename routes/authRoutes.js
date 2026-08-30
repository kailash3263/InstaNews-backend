const express = require('express');

const router = express.Router();

const authController = require('../controllers/authController')
const {signupValidator} = require('../validators/signupValidator')
const {loginValidator} = require('../validators/signupValidator')
const {handleValidation} = require('../validators/handleValidation')
// const authenticate = require('../controllers/authController')

router.post('/signUp', signupValidator, handleValidation, authController.handleSignUp);
router.post('/login',loginValidator, handleValidation, authController.handleLogin);
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({
    message: "Logged out successfully",
  });
});
router.get("/me", authController.authenticate, (req, res) => {
  res.json({
    user: req.user
  });
});

module.exports = router;