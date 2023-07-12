const express = require('express');
const cors = require("cors");
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const http = require('http');
var mysql = require('mysql');
require("dotenv").config();
const path = require('path');
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());
app.use(express.static(path.join(__dirname, 'image')));
const routes = require('./routes/routes')



var db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});
db.connect(function (err) {
    if (err) {
        console.log('db disconnect');
    }
    else {
        console.log('db connect');
    }
})
const port = process.env.PORT || 8888;
app.listen(port, () => console.log("Listening port 8888"));

app.use(function (req, res, next) {
    req.db = db;
    next()
})
app.use("/", routes);
module.exports = app;