const express = require('express');
const authController = require('../controllers/auth');
const router = express.Router();

//인증 미들웨어 정보를 가진다.
router.get('/', authController.isLoggedIn, (req, res) => {
    res.render('index', {
        user: req.user
    });
});
router.get('/register', (req, res) => {
    res.render('register');
});
router.get('/login', (req, res) => {
    res.render('login');
});
router.get('/board', authController.isLoggedIn, (req, res) => {
    if (req.user) {
        res.render('board');
    } else {
        res.redirect('/login');
    }
});

module.exports = router;


