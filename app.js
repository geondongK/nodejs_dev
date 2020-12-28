// const { static } = require('express');
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
        console.log('Database is connected!');
    }
})

//CSS or JavaScript 자료 추가 
app.use(express.static(path.join(__dirname, './public')));
//json 형식이 아닌 post 올때 urlencoded 사용
app.use(express.urlencoded({ extended: false }));
//클라이언트 오는 형식이 json 일수도있다
app.use(express.json());
app.use(cookieParser());

app.engine("handlebars", hbs());
app.set('view engine', 'hbs');

//routes를 통해 미들웨어 경로를 사용 
app.use('/', require('./routes/pages'));

app.use('/auth', require('./routes/auth'));

const port = process.env.port || 5502;
app.listen(port, () => console.log(`app listening on port ${port}!`))
