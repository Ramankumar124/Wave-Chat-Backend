const express = require('express');
const { registerUser, loginUser, logoutUser, googleLogin } = require('../controllers/authController')
const router = express.Router();
const isLogin = require('../middlewares/isLogin')

router.post('/register', registerUser);
router.post('/login', loginUser)
router.get('/logout',logoutUser )
router.post('/googleLogin',googleLogin)
module.exports = router;  