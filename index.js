const express = require('express');
const cors = require("cors");
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());


const routes = require('./routes/routes')


var mysql = require('mysql');
var db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "areaphonebook"
});
db.connect(function (err) {
    if (err) {
        console.log('db disconnect');
    }
    else {
        console.log('db connect');
    }
})
app.listen(8000, () => console.log("Listening port 8000"));

app.use(function (req, res, next) {
    req.db = db;
    next()
})
app.use("/", routes);
module.exports = app;