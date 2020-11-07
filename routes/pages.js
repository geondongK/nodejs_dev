const express = require('express');
const authController = require('../controllers/auth');
const router = express.Router();

// });
// router.get('/', (req, res) => {
//     res.render('index');
// });

// router.get('/', authController.isLoggedIn, (req, res) => {
//     res.render('index', {
//         user: req.user
//     });
// });

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
    // console.log(req.message);
    if (req.user) {
        res.render('board');
    } else {
        res.redirect('/login');
    }
});
// router.get('/board', authController.isLoggedIn, (req, res) => {
//     if (req.user) {
//         res.render('board');
//     }
//     res.redirect('login');
// });

// router.get('/board', (req, res) => {
//     res.render('board');
// });
// router.get('/about', (req, res) => {
//     res.render('about');
// });


module.exports = router;


