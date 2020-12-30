const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const util = require('util');

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB,
    port: 3306
});
//로그인
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).render('login', {
                message: '이메일 또는 비밀번호를 입력하세요.'
            })
        }
        db.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
            if (results.length == 0) {
                return res.status(401).render('login', {
                    message: '유효한 이메일 또는 비밀번호를 입력하세요.'
                });
                //요청된 이메일이 데이터 베이스에 있다면 맞는 비밀번호 인지 확인하는 방법.  
            } else if (!(await bcrypt.compare(password, results[0].password))) {
                return res.status(401).render('login', {
                    message: '유효한 이메일 또는 비밀번호를 입력하세요.'
                });
            }
            const id = results[0].id; //db아이디 가져오기
            const maxAge = 3 * 24 * 60 * 60; //3일로 지정
            //jwt를 이용해 토큰 생성
            const token = jwt.sign({ id }, 'jwtsecret', {
                expiresIn: maxAge
            });
            console.log('The token is: ' + token);
            //쿠키에 토큰을 저장하기
            res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 }); //3일 지정
            res.status(200).redirect('/');
        })
    } catch (error) {
        console.log(error);
    }
}
//회원가입
exports.register = (req, res) => {
    const { email, name, password, passwordConfirm } = req.body;

    console.log(req.body);
    // ? 쓴 이유는 보안때문이다.
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
        //bcrypt를 이용하여 비밀번호 hash하기
        const hashPassword = await bcrypt.hash(password, 10);
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
//인증 미들웨어
exports.isLoggedIn = async (req, res, next) => {
    //쿠키 가져오기
    if (req.cookies.jwt) {
        try {
            //token이 인코드에서 디코드으로변환 시켜 id값 나오게 하기
            //token을 디코드하기 위해 verify를 사용
            const decoded = await util.promisify(jwt.verify)(req.cookies.jwt, 'jwtsecret');
            //util.promisify 함수를 사용하여 프로미스 코드를 사용하지 않고 프로미스로 만는 방법.
            console.log(decoded);
            //클라이언트 token과 db에 보관된 토큰이 일치하는지 확인.
            db.query('SELECT * FROM users WHERE id = ?', [decoded.id], (error, result) => {
                console.log(result);
                if (!result) {
                    return next();
                }
                //req.user를 사용하여 routes/pages에 유저 정보를 가지게한다. 
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
//logout 버튼을 클릭하여 유효기간이 1초로 변경되어 로그아웃 된다.
exports.logout = (req, res) => {
    res.cookie('jwt', 'logout', { maxAge: 1 }); //1초 
    res.redirect('/');
}
