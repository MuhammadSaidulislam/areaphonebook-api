const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SECRET_KEY = "areaphonebook";
const Joi = require("joi");

// registration
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
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      db.query(
        "INSERT INTO user (mobile, password) VALUES (?, ?)",
        [mobile, hashedPassword],
        (err, result) => {
          if (err) {
            console.error("Error executing query: ", err);
            res.status(500).json({ error: "Internal server error" });
            return;
          }
          res.status(200).json({ mobile });
        }
      );
    });
  });
};
// login
const userLogin = async (req, res, next) => {
  // Validate request body using Joi
  var db = req.db;
  const { mobile, password } = req.body;
  // Retrieve the user from the database based on the username
  db.query("SELECT * FROM user WHERE mobile = ?", [mobile], (err, rows) => {
    if (err) {
      console.log("Error executing query: ", err);
      res.status(500).json({ error: "Internal server error" });
      return err;
    }

    if (rows.length === 0) {
      res.status(401).json({ error: "Authentication failed" });
      return;
    }

    const user = rows[0];

    // Compare the provided password with the stored hash
    bcrypt.compare(password, user.password, (err, result) => {
      if (err) {
        console.error("Error comparing passwords: ", err);
        res.status(500).json({ error: "Internal server error" });
        return;
      }

      if (!result) {
        res.status(401).json({ error: "Authentication failed" });
        return;
      }
      const token = jwt.sign({ mobile }, SECRET_KEY);
      //    res.status(200).json(result);
      if (result) {
        const { mobile } = rows[0];
        res.status(200).json({ mobile });
      } else {
        res.status(404).json({
          message: "User does not exist",
        });
      }
    });
  });
};
// login mobile number check
const mobileNumberCheck = async (req, res, next) => {
  var db = req.db;
  const { mobileNumber } = req.body;
  db.query(
    "SELECT * FROM user WHERE mobile = ?",
    [mobileNumber],
    (error, results) => {
      if (error) {
        // Handle any database error
        console.error("Error executing query:", error);
        return res.status(500).json({ message: "Internal server error" });
      }

      if (results.length > 0) {
        // Mobile number exists
        return res.json({ exists: true });
      } else {
        // Mobile number does not exist
        return res.json({ exists: false });
      }
    }
  );
};
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
const createShop = async (req, res, next) => {
  try {
    var db = req.db;
    var data= req.body;
     db.query(
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
// shop update
const updateShop = async (req, res, next) => {
  try {
    const db = req.db;
    const shopId = req.params.id;
    const data = req.body;

    db.query('UPDATE shop SET ? WHERE shop_id = ?', [data, shopId], function (err, rows) {
      if (err) {
        console.error('Error updating shop:', err);
        res.status(500).send({ message: 'Error updating shop' });
        return;
      }

      if (rows.affectedRows === 0) {
        res.status(404).send({ message: 'Shop not found' });
      } else {
        res.status(200).send({ message: 'Shop updated successfully' });
      }
    });
  } catch (error) {
    console.error('Error updating shop:', error);
    res.status(500).send({ message: 'Error updating shop' });
  }
};
// category
const createCategory = async (req, res, next) => {
  try {
    var db = req.db;
    console.log('req',red.body,req.file.filename);
    var data = {
      category_name: red.body.category_name,
      image: req.file.filename,
    };
    const filename = req.file.filename;
    console.log("image", data);
    db.query("Insert into category set ? ", [data], function (err, rows) {
      if (err) {
        res.send({
          message: "error",
        });
      } else {
        res.send({
          message: "Success",
        });
      }
    });
  } catch (error) {
    res.send({
      message: "error",
    });
  }
};
// category list
const categoryList = async (req, res, next) => {
  try {
    var db = req.db;
    let results = await db.query(
      "Select * from category",
      function (error, rows) {
        if (error) {
          console.log("Error db");
        } else {
          res.send({
            status: 1,
            message: "succesfully get list",
            data: rows,
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
// all category list
const allSubcategoryList = async (req, res, next) => {
  try {
    var db = req.db;
    let results = await db.query(
      "Select * from subcategory",
      function (error, rows) {
        if (error) {
          console.log("Error db");
        } else {
          res.send({
            status: 1,
            message: "succesfully get list",
            data: rows,
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
// subcategory
const createSubCategory = async (req, res, next) => {
  try {
    var db = req.db;
    const { categoryName, subCategoryName,tags } = req.body;

    // Insert the subcategory into the database
    const query = `INSERT INTO subcategory (category_name, sub_category_name, tags) VALUES ('${categoryName}', '${subCategoryName}', '${tags}')`;
    db.query(query, (err, result) => {
      if (err) {
        console.error("Error creating subcategory: ", err);
        res.status(500).json({ error: "Error creating subcategory" });
        return;
      }
      res.status(200).json({ message: "Subcategory created successfully" });
    });
  } catch (error) {
    res.send({
      message: "error",
    });
  }
};
// get subcategory and shop
const getSubCategory = async (req, res, next) => {
  try {
    var db = req.db;
    // const category_Id = req.params.categoryId;
    const { categoryName } = req.body;
    // Fetch subcategories under the specified category
    const query = "SELECT * FROM subcategory WHERE category_name = ?";
    db.query(query, [categoryName], (err, results) => {
      if (err) {
        console.error("Error fetching subcategory:", err);
        return;
      }

      res.status(200).json(results);
    });
  } catch (error) {
    res.send({
      message: "error",
    });
  }
};
// get category and subcategory
const shopList = async (req, res, next) => {
  try {
    var db = req.db;
    // const category_Id = req.params.categoryId;
    const { subCategoryName } = req.body;

    // Fetch subcategories under the specified category
    const query = "SELECT * FROM shop WHERE sub_category = ?";
    db.query(query, [subCategoryName], (err, results) => {
      if (err) {
        console.error("Error fetching subcategory:", err);
        return;
      }
      res.status(200).json(results);
    });
  } catch (error) {
    res.send({
      message: "error",
    });
  }
};
// admin
// registration
const adminRegistration = async (req, res, next) => {
  // Validate request body using Joi
  var db = req.db;
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
    password: Joi.string().min(6).required(),
  });
  const { error, value } = schema.validate(req.body);
  if (error) {
    res.status(400).json({ error: error.details[0].message });
    return;
  }
  const { name, password } = value;
  // Check if the username is already taken
  db.query("SELECT * FROM admin WHERE name = ?", [name], (err, rows) => {
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
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      db.query(
        "INSERT INTO admin (name, password) VALUES (?, ?)",
        [name, hashedPassword],
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
  });
};
// login
const adminLogin = async (req, res, next) => {
  // Validate request body using Joi
  var db = req.db;
  const { name, password } = req.body;

  // Retrieve the user from the database based on the username
  db.query("SELECT * FROM admin WHERE name = ?", [name], (err, rows) => {
    if (err) {
      console.error("Error executing query: ", err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }

    if (rows.length === 0) {
      res.status(401).json({ error: "Authentication failed" });
      return;
    }

    const admin = rows[0];

    // Compare the provided password with the stored hash
    bcrypt.compare(password, admin.password, (err, result) => {
      if (err) {
        console.error("Error comparing passwords: ", err);
        res.status(500).json({ error: "Internal server error" });
        return;
      }

      if (!result) {
        res.status(401).json({ error: "Authentication failed" });
        return;
      }

      res.status(200).json({ message: "Authentication successful!" });
    });
  });
};
// user profile
const userProfile = async (req, res, next) => {
  try {
    var db = req.db;
    const { userMobile } = req.body;
    const query = "SELECT * FROM shop WHERE mobile = ? AND post_id = ''";
    db.query(query, userMobile, (err, results) => {
      if (err) {
        console.error("Error fetching subcategory:", err);
        return;
      }

      if (results.length > 0) {
        res.status(401).json(results);
      } else {
        res.status(404).json({
          message: "User does not exist",
        });
      }
    });
  } catch (error) {
    res.send({
      message: "error",
    });
  }
};
// create pending shop
const pendingShop = async (req, res, next) => {
  try {
    var db = req.db;
    var data =req.body;
     db.query(
      "Insert into pending_shop set ? ",
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
// category list
const pendingList = async (req, res, next) => {
  try {
    var db = req.db;
    let results = await db.query(
      "Select * from pending_shop",
      function (error, rows) {
        if (error) {
          console.log("Error db");
        } else {
          res.send({
            status: 1,
            message: "succesfully get list",
            data: rows,
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
const deletePending = async (req, res, next) => {
  const shopId = req.params.id;
  var db = req.db;
  try {
    const deleteQuery = "DELETE FROM pending_shop WHERE shop_id = ?";
    db.query(deleteQuery, [shopId], (err, result) => {
      if (err) {
        console.error("Error deleting data from the database: ", err);
        res.status(500).send("Error deleting data.");
        return;
      }

      console.log("Data deleted successfully.");
      res.sendStatus(200);
    });
  } catch (err) {
    console.error("Error deleting data: ", err);
    res.status(500).send("Error deleting data.");
  }
};
//single shop
const singleShop = async (req, res, next) => {
  try {
    const db = req.db;
    const shopId = req.params.id;
    const query = "SELECT * FROM shop WHERE shop_id = ?";
    db.query(query, [shopId], (err, results) => {
      if (err) {
        console.error("Error fetching shop:", err);
        return;
      }

      if (results.length > 0) {
        res.status(200).json(results[0]); // Return the first shop found
      } else {
        res.status(404).json({
          message: "Shop not found",
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving shop",
    });
  }
};
// post list
const postList = async (req, res, next) => {
  try {
    var db = req.db;
    const { userMobile } = req.body;
    const query = `SELECT * FROM shop WHERE mobile = ? AND post_id != ''`;
    db.query(query, [userMobile], (err, results) => {
      if (err) {
        console.error("Error querying MySQL:", err);
        res.status(500).json({ error: "Internal server error" });
        return;
      }
      res.json(results);
    });
  } catch (error) {
    res.send({
      message: "error",
    });
  }
};
// report add
const reportAdd = async (req, res, next) => {
  try {
    var db = req.db;

    var data = {
      name: req.body.name,
      complain: req.body.complain,
    };
    // Insert the subcategory into the database
    const query = `INSERT INTO report SET ?`;
    db.query(query,[data], (err, result) => {
      if (err) {
        console.error("Error creating subcategory: ", err);
        res.status(500).json({ error: "Error creating report" });
        return;
      }
      res.status(200).json({ message: "report send successfully" });
    });
  } catch (error) {
    res.send({
      message: "error",
    });
  }
};
// report list
const reportList = async (req, res, next) => {
  try {
    var db = req.db;
    db.query(
      "Select * from report",
      function (error, rows) {
        if (error) {
          console.log("Error db");
        } else {
          res.send({
            status: 1,
            message: "successfully get report list",
            data: rows,
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
// delete shop
const deleteShop = async (req, res, next) => {
  const shopId = req.params.id;
  var db = req.db;
  try {
    const deleteQuery = "DELETE FROM shop WHERE shop_id = ?";
    db.query(deleteQuery, [shopId], (err, result) => {
      if (err) {
        console.error("Error deleting data from the database: ", err);
        res.status(500).send("Error deleting data.");
        return;
      }

      console.log("Data deleted successfully.");
      res.sendStatus(200);
    });
  } catch (err) {
    console.error("Error deleting data: ", err);
    res.status(500).send("Error deleting data.");
  }
};
// home page list
const dashboardList= async (req, res, next) => {
  var db = req.db;
  const query = `SELECT categoryName, category_image FROM category`;

  db.query(query, (err, results) => {
    if (err) throw err;

    const categories = results.map((result) => {
      return {
        categoryName: result.categoryName,
        categoryImage: result.category_image || "",
        subCategory: []
      };
    });

    const subQuery = `SELECT category_name, sub_category_name, tags FROM subcategory`;

    db.query(subQuery, (err, subResults) => {
      if (err) throw err;

      subResults.forEach((subResult) => {
        const categoryIndex = categories.findIndex((category) => category.categoryName === subResult.category_name);

        if (categoryIndex !== -1) {
          categories[categoryIndex].subCategory.push({
            category_name: subResult.category_name,
            sub_category_name: subResult.sub_category_name,
            tags: subResult.tags || ""
          });
        }
      });

      res.json(categories);
    });
  });
}
const example= async (req, res, next) => {
  var db = req.db;
  const { categoryName } = req.body;
  const category_image = req.file.filename;

  const query = 'INSERT INTO category (categoryName, category_image) VALUES (?, ?)';
  db.query(query, [categoryName, category_image], (err, result) => {
    if (err) {
      console.error('Error saving user:', err);
      res.status(500).json({ error: 'Failed to save user' });
    } else {
      res.json({ message: 'User saved successfully' });
    }
  });
}
module.exports = {
  displayData,
  createShop,
  registration,
  userLogin,
  createCategory,
  createSubCategory,
  getSubCategory,
  categoryList,
  allSubcategoryList,
  shopList,
  adminRegistration,
  adminLogin,
  userProfile,
  pendingShop,
  pendingList,
  deletePending,
  singleShop,
  mobileNumberCheck,
  postList,
  reportAdd,
  reportList,
  deleteShop,
  updateShop,
  dashboardList,
  example
};
