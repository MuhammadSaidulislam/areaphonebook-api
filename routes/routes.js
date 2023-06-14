const express = require('express');
const router = express.Router();
const multer = require("multer");
const controller = require("../controller/controller");

// image path
const storage = multer.diskStorage({
    destination: './image',
    filename: (req, file, cb) => {
        return cb(null, `${file.originalname}`)
    }
});
const upload=multer({
    storage:storage
})
// formdata api
router.get('/getData', controller.displayData);
router.post('/postData', upload.single('image'), controller.createData);
module.exports = router;