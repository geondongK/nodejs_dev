const express = require('express');
const mysql = require('mysql');
const path = require('path');
const dotenv = require('dotenv');
const hbs = require('express-handlebars');
const cookieParser = require('cookie-parser');

//DB 정보 보호
dotenv.config({ path: './.env' });

const app = express()

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB,
    port: 3306
});

db.connect((err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('Database is connected!!');
    }
})

//CSS or JavaScript 자료 추가 
app.use(express.static(path.join(__dirname, './public')));
// express 4버전 이상부터 body-parser 기능이 내장되어있다.
//URL-encoded 주소 형식으로 데이터를 보내는 방식
app.use(express.urlencoded({ extended: false }));
//JSON 형식으로 데이터 전달방식
app.use(express.json());
// cookieParser 미들웨어
app.use(cookieParser());

//템플릿 엔진 hbs 사용
app.engine("handlebars", hbs());
app.set('view engine', 'hbs');

//routes를 통해 미들웨어 경로를 사용 
app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));

const port = process.env.port || 5502;
app.listen(port, () => console.log(`app listening on port ${port}!`))
