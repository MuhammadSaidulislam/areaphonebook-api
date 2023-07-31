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
    var data = req.body;
    db.query("Insert into shop set ? ", [data], function (err, rows) {
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
// shop update
const updateShop = async (req, res, next) => {
  try {
    const db = req.db;
    const shopId = req.params.id;
    const data = req.body;

    db.query(
      "UPDATE shop SET ? WHERE shop_id = ?",
      [data, shopId],
      function (err, rows) {
        if (err) {
          console.error("Error updating shop:", err);
          res.status(500).send({ message: "Error updating shop" });
          return;
        }

        if (rows.affectedRows === 0) {
          res.status(404).send({ message: "Shop not found" });
        } else {
          res.status(200).send({ message: "Shop updated successfully" });
        }
      }
    );
  } catch (error) {
    console.error("Error updating shop:", error);
    res.status(500).send({ message: "Error updating shop" });
  }
};
// category
const createCategory = async (req, res, next) => {
  try {
    var db = req.db;
    var data = {
      category_name: req.body.category_name,
      category_image: req.file.filename,
      serial_no: req.body.serial_no,
    };

    db.query(
      "Insert into category set ? ",
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
// delete category
const deleteCategory = async (req, res, next) => {
  var db = req.db;
  const category_name = req.params.category_name;

  const query = 'DELETE FROM category WHERE category_name = ?';

  db.query(query, [category_name], (error, result) => {
    if (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({ error: 'Error deleting category' });
      return;
    }

    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    res.json({ message: 'Category deleted successfully' });
  });
}

// category list
const categoryList = async (req, res, next) => {
  try {
    var db = req.db;
    let results = await db.query("SELECT * FROM category ORDER BY CAST(serial_no AS SIGNED) ASC", function (error, rows) {
      if (error) {
        console.log("Error fetching data from database");
        res.send({
          status: 0,
          message: "Error fetching data from database",
        });
      } else {
        res.send({
          status: 1,
          message: "Successfully fetched list",
          data: rows,
        });
      }
    });
  } catch (error) {
    console.log("Error:", error);
    res.send({
      status: 0,
      message: "An error occurred",
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
    var data = {
      category_name: req.body.category_name,
      sub_category_name: req.body.sub_category_name,
      sub_category_image: req.file.filename,
    };

    db.query(
      "Insert into subcategory set ? ",
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
// get subcategory and shop
const getSubCategory = async (req, res, next) => {
  try {
    var db = req.db;
    // const category_Id = req.params.categoryId;
    const { category_name } = req.body;
    // Fetch subcategories under the specified category
    const query = "SELECT * FROM subcategory WHERE category_name = ?";
    db.query(query, [category_name], (err, results) => {
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
    const { subcategory_name } = req.body;

    // Fetch subcategories under the specified category
    const query = "SELECT * FROM shop WHERE sub_category = ?";
    db.query(query, [subcategory_name], (err, results) => {
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
    const db = req.db;
    const { userMobile } = req.body;

    // Query to fetch data from the shop table
    const shopQuery = `
      SELECT *
      FROM shop
      WHERE mobile = ? AND post_id = ''
    `;
    db.query(shopQuery, userMobile, (shopErr, shopResults) => {
      if (shopErr) {
        console.error("Error fetching user profile:", shopErr);
        res.status(500).json({ error: "Error fetching user profile" });
        return;
      }

      if (shopResults.length === 0) {
        res.status(404).json({
          message: "User does not exist",
        });
        return;
      }

      const shopIds = shopResults.map((shop) => shop.shop_id);

      // Query to fetch time data from the shop_time table using shop_id
      const shopTimeQuery = `
        SELECT *
        FROM shop_time
        WHERE shop_id IN (?)
      `;
      db.query(shopTimeQuery, [shopIds], (timeErr, timeResults) => {
        if (timeErr) {
          console.error("Error fetching shop_time data:", timeErr);
          res.status(500).json({ error: "Error fetching shop_time data" });
          return;
        }

        // Merge the shop and shop_time data based on shop_id
        const userProfileData = shopResults.map((shop) => {
          const shopTimeData = timeResults.filter((time) => time.shop_id === shop.shop_id);
          return {
            ...shop,
            shop_time: shopTimeData,
          };
        });

        res.status(200).json(userProfileData);
      });
    });
  } catch (error) {
    console.error("Error in userProfile:", error);
    res.status(500).json({ error: "Error in userProfile" });
  }
};
// create pending shop
const pendingShop = async (req, res, next) => {
  var db = req.db;

  const { weeklyDays } = req.body;
  const {shop_id}= req.body;
  var data = {
    shop_image: req.file.filename,
    category: req.body.category,
    sub_category: req.body.sub_category,
    title: req.body.title,
    number: req.body.number,
    address: req.body.address,
    service: req.body.service,
    shop_id: req.body.shop_id,
    post_id: req.body.post_id,
    mobile: req.body.mobile,
    tags: req.body.tags,
    phone_show: req.body.phone_show
  };
  const weeklyDaysData = JSON.parse(weeklyDays);

  db.beginTransaction((err) => {
    if (err) {
      console.error('Error starting transaction:', err);
      return res.status(500).json({ error: 'Error starting transaction' });
    }
    // Insert data into the "pending" table
    db.query(
      "Insert into pending_shop set ? ",
      [data],
      (err, result) => {
        if (err) {
          console.log('err', err);
          // Rollback the transaction if there's an error
          db.rollback(() => {
            res.status(500).json({ error: 'Error inserting data into pending table' });
          });
        } else {
          // Check if there is any data in weeklyDaysData
          if (Array.isArray(weeklyDaysData) && weeklyDaysData.length > 0) {
            // Insert the "shop_time" data in a loop
            const insertShopTimeQuery = 'INSERT INTO shop_time (shop_id, day, start_time, end_time) VALUES (?, ?, ?, ?)';

            weeklyDaysData.forEach((dayData, index) => {
              const { day, start_time, end_time } = dayData;
              db.query(
                insertShopTimeQuery,
                [shop_id, day, start_time, end_time],
                (err, result) => {
                  if (err) {
                    // Rollback the transaction if there's an error
                    db.rollback(() => {
                      res.status(500).json({ error: `Error inserting data for ${day} in shop_time table` });
                    });
                  } else {
                    // If all "shop_time" data is inserted successfully, commit the transaction
                    if (index === weeklyDaysData.length - 1) {
                      db.commit((err) => {
                        if (err) {
                          // Rollback the transaction if there's an error
                          db.rollback(() => {
                            res.status(500).json({ error: 'Error committing transaction' });
                          });
                        } else {
                          res.status(200).json({ message: 'Form submitted successfully' });
                        }
                      });
                    }
                  }
                }
              );
            });
          } else {
            // If no shop_time data is provided, directly commit the transaction
            db.commit((err) => {
              if (err) {
                // Rollback the transaction if there's an error
                db.rollback(() => {
                  res.status(500).json({ error: 'Error committing transaction' });
                });
              } else {
                res.status(200).json({ message: 'Form submitted successfully' });
              }
            });
          }
        }
      }
    );
  });
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
// delete pending list
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
    db.query(query, [data], (err, result) => {
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
    db.query("Select * from report", function (error, rows) {
      if (error) {
        console.log("Error db");
      } else {
        res.send({
          status: 1,
          message: "successfully get report list",
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
const dashboardList = async (req, res, next) => {
  var db = req.db;
  const query = `SELECT serial_no, category_name, category_image FROM category ORDER BY CAST(serial_no AS SIGNED) ASC`;

  db.query(query, (err, results) => {
    if (err) throw err;

    const categories = results.map((result) => {
      return {
        serial_no: result.serial_no,
        category_name: result.category_name,
        categoryImage: result.category_image || "",
        subCategory: [],
      };
    });

    const subQuery = `SELECT category_name, sub_category_name, sub_category_image FROM subcategory`;

    db.query(subQuery, (err, subResults) => {
      if (err) throw err;

      subResults.forEach((subResult) => {
        const categoryIndex = categories.findIndex(
          (category) => category.category_name === subResult.category_name
        );

        if (categoryIndex !== -1) {
          categories[categoryIndex].subCategory.push({
            category_name: subResult.category_name,
            sub_category_name: subResult.sub_category_name,
            sub_category_image: subResult.sub_category_image || "",
          });
        }
      });

      res.json(categories);
    });
  });
};
// create filter data
const createTags = async (req, res, next) => {
  var db = req.db;
  const { category_name, sub_category_name, tags, filter_id } = req.body;

  // Perform validation if required (e.g., check for required fields)

  const selectQuery = 'SELECT * FROM filter_tags WHERE category_name = ? AND sub_category_name = ?';
  const selectValues = [category_name, sub_category_name];

  db.query(selectQuery, selectValues, (error, results) => {
    if (error) {
      console.error('Error checking existing data:', error);
      res.status(500).json({ error: 'Error checking existing data' });
      return;
    }

    if (results.length === 0) {
      // If the category and sub-category combination does not exist, insert a new record.
      const insertQuery = 'INSERT INTO filter_tags (category_name, sub_category_name, tags, filter_id) VALUES (?, ?, ?, ?)';
      const insertValues = [category_name, sub_category_name, JSON.stringify([tags]), filter_id];

      db.query(insertQuery, insertValues, (error, result) => {
        if (error) {
          console.error('Error inserting data:', error);
          res.status(500).json({ error: 'Error inserting data' });
          return;
        }

        res.json({ message: 'Data inserted successfully' });
      });
    } else {
      // If the category and sub-category combination already exists, update the tags array.
      const existingTags = JSON.parse(results[0].tags);
      existingTags.push(tags);

      const updateQuery = 'UPDATE filter_tags SET tags = ? WHERE category_name = ? AND sub_category_name = ?';
      const updateValues = [JSON.stringify(existingTags), category_name, sub_category_name];

      db.query(updateQuery, updateValues, (error, result) => {
        if (error) {
          console.error('Error updating data:', error);
          res.status(500).json({ error: 'Error updating data' });
          return;
        }

        res.json({ message: 'Data updated successfully' });
      });
    }
  });
};
// filter data
const showTags = async (req, res, next) => {
  var db = req.db;
  const { category_name, sub_category_name } = req.body;

  // Perform validation if required (e.g., check for required fields)

  const query = 'SELECT filter_id, tags FROM filter_tags WHERE category_name = ? AND sub_category_name = ?';
  const values = [category_name, sub_category_name];

  db.query(query, values, (error, results) => {
    if (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Error fetching data' });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({ error: 'Category or sub-category not found' });
      return;
    }

    const tagsArray = results.map((row) => ({
      filter_id: row.filter_id,
      tags: JSON.parse(row.tags),
    }));
    res.json(tagsArray);
  });
}
// filter tags list
const allFilter = async (req, res, next) => {
  try {
    var db = req.db;
    let results = await db.query(
      "Select * from filter_tags",
      function (error, rows) {
        if (error) {
          console.log("Error db");
        } else {
          res.send({
            status: 1,
            message: "successfully get list",
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
// filter tags list
const singleCategory = async (req, res, next) => {

  var db = req.db;
  const categoryId = req.params.id;

  // Write SQL query to fetch the category information
  const sql = 'SELECT * FROM category WHERE serial_no = ?';

  db.query(sql, [categoryId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error while fetching category information.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Category not found.' });
    }

    const category = results[0];
    res.json(category);
  });
};

// category update

const categoryUpdate = async (req, res, next) => {
  var db = req.db;
  const categoryId = req.params.id;
  var data = {
    category_name: req.body.category_name,
    serial_no: req.body.serial_no,
  };

  // Check if an image was uploaded
  if (req.file) {
    data.category_image = req.file.filename;
  }


  const sql = 'UPDATE category SET ? WHERE serial_no = ?';
  db.query(sql, [data, categoryId], (err, result) => {
    if (err) {
      return res.status(500).json({ status: 500, error: 'Error while updating category data.' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 404, error: 'Category not found.' });
    }

    res.json({ message: 'Category updated successfully.' });
  });
}

// delete sub category
const deleteSubCategory = async (req, res, next) => {
  var db = req.db;
  const sub_category_name = req.params.subcategory_name;
  const query = 'DELETE FROM subcategory WHERE sub_category_name = ?';

  db.query(query, [sub_category_name], (error, result) => {
    if (error) {
      console.error('Error deleting sub-category:', error);
      res.status(500).json({ error: 'Error deleting sub category' });
      return;
    }

    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Sub-Category not found' });
      return;
    }

    res.json({ message: 'Sub-Category deleted successfully' });
  });
}
// delete filter tags
const filterTagDelete = async (req, res, next) => {
  var db = req.db;
  const filterId = req.params.filter_id;
  const tagToRemove = req.params.tag_name;

  // Fetch the row from the table based on the filter_id
  const sqlSelect = 'SELECT tags FROM filter_tags WHERE filter_id = ?';
  db.query(sqlSelect, [filterId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error while fetching data.' });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: 'Filter ID not found.' });
    }

    const currentArray = JSON.parse(result[0].tags);
    const updatedArray = currentArray.filter((value) => value !== tagToRemove);

    if (currentArray.length === updatedArray.length) {
      return res.status(404).json({ error: 'Tag not found in the array for the given Filter ID.' });
    }

    // Update the row in the database with the modified array
    const sqlUpdate = 'UPDATE filter_tags SET tags = ? WHERE filter_id = ?';
    db.query(sqlUpdate, [JSON.stringify(updatedArray), filterId], (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: 'Error while updating data.' });
      }

      res.json({ message: 'Tag removed from the array for the given Filter ID.' });
    });
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
  createTags,
  showTags,
  deleteCategory,
  allFilter,
  singleCategory,
  categoryUpdate,
  deleteSubCategory,
  filterTagDelete
};
