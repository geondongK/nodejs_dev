const express = require('express');
const authController = require('../controllers/auth');

const router = express.Router();

//authController module 호출하기.
router.post('/register', authController.register);

router.post('/login', authController.login);

router.get('/logout', authController.logout);

module.exports = router;