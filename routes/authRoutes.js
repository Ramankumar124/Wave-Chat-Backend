const express = require('express');
const { registerUser, loginUser, logoutUser, googleLogin, createProfile } = require('../controllers/authController')
const router = express.Router();

router.post('/register', registerUser);
router.post('/createProfile', createProfile);
router.post('/login', loginUser)
router.get('/logout',logoutUser )
router.post('/googleLogin',googleLogin)

module.exports = router;  