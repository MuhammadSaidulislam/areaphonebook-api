const displayData = async (req, res, next) => {
  try {
    var db = req.db;
    let results = await db.query("Select * from user", function (error, rows) {
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
// post data
const createData = async (req, res, next) => {
  try {
    var db = req.db;
    var id = Math.floor(Math.random() * 90000) + 100;
    var data = {
      id: id,
      name: req.body.name,
      pass: req.body.pass,
      image: req.file.filename,
    };
    console.log(data);
    let result = await db.query(
      "Insert into user set ? ",
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

module.exports = { displayData, createData };
