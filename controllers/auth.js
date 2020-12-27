const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
// const session = require('express-session');
const { promisify } = require('util');

// const db = require('../lib/db');
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB,
    port: 3306
});

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // const secret = req.app.get('jwt-secret')
        if (!email || !password) {
            return res.status(400).render('login', {
                message: '이메일 또는 비밀번호를 입력하세요.'
            })
        }
        db.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
            if (results.length == 0) {
                return res.status(401).render('login', {
                    message: '유요한 이메일 또는 비밀번호를 입력하세요.'
                });
            } else if (!(await bcrypt.compare(password, results[0].password))) {
                return res.status(401).render('login', {
                    message: '유요한 이메일 또는 비밀번호를 입력하세요.'
                });
            }
            const id = results[0].id;

            const maxAge = 3 * 24 * 60 * 60;
            const token = jwt.sign({ id }, 'jwtsecret', {
                expiresIn: maxAge
            });
            console.log('The token is: ' + token);

            res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
            res.status(200).redirect('/');
        })
    } catch (error) {
        console.log(error);
    }
}

exports.register = (req, res) => {
    //javascript 구조화
    const { email, name, password, passwordConfirm } = req.body;

    console.log(req.body);
    // ? 쓴 이유는 보안때문이다.
    // results 결과값 받기.
    // error , results callback 함수
    db.query('SELECT email FROM users WHERE email = ?', [email], async (error, results) => {
        if (error) {
            console.log(error);
        }
        // (email)results 결과값이 0보다 크면 이미 해당값이 있는 이메일을 뜻함.
        if (results.length > 0) {
            return res.render('register', {
                message: '이미 가입된 회원입니다.'
            })
        } else if (password !== passwordConfirm) {
            return res.render('register', {
                message: '비밀 번호가 다릅니다.'
            });
        }
        //비밀번호 암호화 hash 길이 8 지정.
        const hashPassword = await bcrypt.hash(password, 8);
        console.log(hashPassword);
        db.query('INSERT INTO users SET ?', { name: name, email: email, password: hashPassword }, (error, results) => {
            if (error) {
                console.log(error);
            } else {
                console.log(results);
                return res.render('register', {
                    message: '회원 가입 되었습니다.'
                });
            }
        })
    });
}

exports.isLoggedIn = async (req, res, next) => {
    // req.message = "inside middleware";
    // next();
    // console.log(req.cookies);
    if (req.cookies.jwt) {
        try {
            //토큰 확인
            //인증 미들웨어
            // 인코딩에서 디코딩으로변환 시키기
            const decoded = await promisify(jwt.verify)(req.cookies.jwt, 'jwtsecret');

            console.log(decoded);
            //사용자가 여전히 존재하는지 확인
            db.query('SELECT * FROM users WHERE id = ?', [decoded.id], (error, result) => {
                console.log(result);
                if (!result) {
                    return next();
                }
                req.user = result[0];
                return next();
            });
        } catch (error) {
            console.log(error);
            return next();
        }
    } else {
        next();
    }
}
exports.logout = (req, res) => {
    res.cookie('jwt', 'logout', { maxAge: 1 });
    res.redirect('/');
}
