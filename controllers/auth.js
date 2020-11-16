const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

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

            if (!results || await bcrypt.compare(password, results[0].password))
                res.status(200).render('login', {
                    message: '이메일 또는 비밀번호가 틀렸습니다.'
                })
            else {
                const id = results[0].id;
                //토큰에 id 값 넣기
                //토큰은 1일후 만료
                const token = jwt.sign({ id }, process.env.JWT_SECRET, {
                    expiresIn: '1d'
                });
                console.log('The token is: ' + token);

                const cookie = {
                    expires: new Date(Date.now() + 60 * 60 * 1000 * 24 * 7),
                    httpOnly: true,
                };
                res.cookie('jwt', token, cookie);
                res.status(200).redirect('/');
            }
        })
    } catch (error) {
        console.log(error);
    }
}

exports.register = (req, res) => {
    console.log(req.body);

    const { email, name, password, passwordConfirm } = req.body;

    db.query('SELECT email FROM users WHERE email = ?', [email], async (error, results) => {
        if (error) {
            console.log(error);
        }
        if (results.length > 0) {
            return res.render('register', {
                message: '이미 가입된 회원입니다.'
            })
        } else if (password !== passwordConfirm) {
            return res.render('register', {
                message: '비밀 번호가 다릅니다.'
            });
        }
        //비밀번호 암호화 hash 길이 10 지정.
        let hashPassword = await bcrypt.hash(password, 10);
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
    console.log(req.cookies);
    if (req.cookies.jwt) {
        try {
            //토큰 확인
            //인증 미들웨어
            // 인코딩에서 디코딩으로변환 시키기
            const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

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
exports.logout = async (req, res) => {
    res.cookie('jwt', 'logout', {
        expires: new Date(Date.now() + 2 * 1000),
        httpOnly: true
    });
    res.status(200).redirect('/');
}

