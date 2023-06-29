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
// routes api
router.post('/userCreate', controller.registration)
router.post('/login', controller.userLogin)
router.post('/userDashboard', controller.userProfile)
router.post('/category', upload.single('image'), controller.createCategory)
router.get('/categoryList', controller.categoryList)
router.get('/allSubcategoryList', controller.allSubcategoryList)
router.post('/subcategory', controller.createSubCategory)
router.post('/subcategorylist', controller.getSubCategory)
router.post('/AllShopList', controller.shopList)
router.post('/singleShopShow/:id', controller.singleShop)
router.get('/showAll', controller.displayData);
router.post('/create', controller.createShop);
router.post('/pendingShop', controller.pendingShop);
router.get('/pending', controller.pendingList)
router.delete('/pendingDelete/:id', controller.deletePending)
router.post('/adminSignup', controller.adminRegistration)
router.post('/admin', controller.adminLogin)
router.post('/mobileCheck', controller.mobileNumberCheck)
router.post('/allPost', controller.postList)
router.post('/addReport', controller.reportAdd)
router.get('/allReport', controller.reportList)
router.delete('/shopDelete/:id', controller.deleteShop)
module.exports = router;