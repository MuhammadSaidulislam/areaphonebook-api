const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SECRET_KEY = "areaphonebook";
const Joi = require('joi');
// all shop data
const displayData = async (req, res, next) => {
  try {
    var db = req.db;
    let results = await db.query("Select * from shop", function (error, rows) {
      if (error) {
        console.log("Error db");
      } else {
        res.send({
          status: 1,
          message: "succesfully get list",
          data: rows,
        });
      }
    });
  } catch (error) {
    res.send({
      message: "error",
    });
  }
};
// create shop
const createData = async (req, res, next) => {
  try {
    var db = req.db;
    var id = Math.floor(Math.random() * 90000) + 100;
    var data = {
      id: id,
      name: req.body.name,
      password: req.body.pass,
      image: req.file.filename,
    };
    console.log(data);
    let result = await db.query(
      "Insert into shop set ? ",
      [data],
      function (err, rows) {
        if (err) {
          res.send({
            message: "error",
          });
        } else {
          res.send({
            message: "Success",
          });
        }
      }
    );
  } catch (error) {
    res.send({
      message: "error",
    });
  }
};
// registration
// post data
const registration = async (req, res, next) => {
  // Validate request body using Joi
  var db = req.db;
  const schema = Joi.object({
    mobile: Joi.string().min(3).required(),
    password: Joi.string().min(6).required(),
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    res.status(400).json({ error: error.details[0].message });
    return;
  }

  const { mobile, password } = value;

  // Check if the username is already taken
  db.query("SELECT * FROM user WHERE mobile = ?", [mobile], (err, rows) => {
    if (err) {
      console.error("Error executing query: ", err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }

    if (rows.length > 0) {
      res.status(409).json({ error: "mobile already exists" });
      return;
    }

    // Insert the user into the database
    db.query(
      "INSERT INTO user (mobile, password) VALUES (?, ?)",
      [mobile, password],
      (err, result) => {
        if (err) {
          console.error("Error executing query: ", err);
          res.status(500).json({ error: "Internal server error" });
          return;
        }

        res.status(201).json({ message: "Registration successful!" });
      }
    );
  });
};

module.exports = { displayData, createData, registration };
