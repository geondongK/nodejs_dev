// const { static } = require('express');
const express = require('express');
const path = require('path');
const mysql = require('mysql');
const dotenv = require('dotenv');
const hbs = require('express-handlebars');
// const ejs = require('ejs');
const cookieParser = require('cookie-parser');

dotenv.config({ path: './.env' });

const app = express()

const db = mysql.createConnection({
    host: process.env.Database_Host,
    user: process.env.Database_User,
    password: process.env.Database_Password,
    database: process.env.Database,
    port: 3306
});

// app.engine(
//     "hbs",
//     hbs({
//         extname: "hbs",
//         defaultLayout: "default", // 기본레이아웃 설정
//         // 레이아웃 디렉토리 설정.. 리액트에서 레이아웃 따로 정하면 필요없단다?...
//         layoutsDir: __dirname + "/views/layouts",
//         // 반복적인 html코드가 있다면 아래 지정경로에서 가져다 쓸수 있다.
//         partialsDir: __dirname + "/view/partials"
//     })
// );
app.engine("handlebars", hbs());
app.set('view engine', 'hbs');
// app.set('view engine', 'ejs');

//CSS or JavaScript 프런트 엔트 자료 추가 
const publicDirectory = path.join(__dirname, './public');
console.log(__dirname);

app.use(express.static(publicDirectory));

//클라이언트 오는 형식이 json 일수도있다
app.use(express.json());
//json 형식이 아닌 post 올때 urlencoded 사용
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());




//경로 정의
app.use('/', require('./routes/pages'));
//로그인 로그아웃
app.use('/auth', require('./routes/auth'));


db.connect((err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('Database is connected!');
    }
})

const port = process.env.port || 3300;
app.listen(port, () => console.log(`app listening on port ${port}!`))
