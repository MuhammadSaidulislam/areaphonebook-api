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
const upload = multer({
    storage: storage
})


// Multer middleware
// app.use(upload.single('fieldname'));
// routes api
router.post('/userCreate', upload.single('image'), controller.registration)
router.put('/user/:mobile', controller.userPassword)
router.post('/login', controller.userLogin)
router.post('/userDashboard', controller.userProfile)
router.post('/category', upload.single('category_image'), controller.createCategory)
router.get('/categoryList', controller.categoryList)
router.get('/allSubcategoryList', controller.allSubcategoryList)
router.post('/subcategory', controller.createSubCategory)
router.put('/subcategory/:id', controller.subCategoryUpdate)
router.post('/subcategorylist', controller.getSubCategory)
router.post('/AllShopList', controller.shopList)
router.post('/singleShopShow/:id', controller.singleShop)
router.get('/showAll', controller.displayData);
router.post('/create', controller.createShop);
router.put('/update/:id', upload.single('shop_image'), controller.updateShop);
router.post('/pendingShop', upload.single('shop_image'), controller.pendingShop);
router.get('/pending', controller.pendingList)
router.delete('/pendingDelete/:id', controller.deletePending)
router.post('/adminSignup', controller.adminRegistration)
router.post('/admin', controller.adminLogin)
router.post('/mobileCheck', controller.mobileNumberCheck)
router.post('/allPost', controller.postList)
router.post('/addReport', controller.reportAdd)
router.get('/allReport', controller.reportList)
router.delete('/shopDelete/:id', controller.deleteShop)
router.get('/listCard', controller.dashboardList)
router.post('/filterAdd', controller.createTags)
router.post('/filterList', controller.showTags)
router.delete('/categoryDelete/:category_name', controller.deleteCategory)
router.get('/allFilter', controller.allFilter)
router.get('/singleCategory/:id', controller.singleCategory)
router.get('/singleSubCategory/:id', controller.singleSubCategory)
router.put('/categoryUpdate/:id',upload.single('category_image'), controller.categoryUpdate)
router.delete('/subcategoryDelete/:subcategory_name', controller.deleteSubCategory)
router.delete('/filterTagDelete/:filter_id/:tag_name', controller.filterTagDelete)
router.get('/related_shop/:id', controller.relatedShop)
router.get('/newsFeed', controller.postNews)
router.get('/postTags/:id', controller.postTags)
router.get('/categoryPost/:category', controller.categoryPost)
router.post('/reviewAdd', controller.reviewAdd)
router.get('/getReview/:id', controller.getReview)
router.post('/filterTags', controller.filterTags)

// new
router.get('/allShopList', controller.allShopList)
router.get('/shopTime/:id', controller.shopTime)
router.get('/tagsList', controller.tagsList)
router.get('/checkShop', controller.checkShop)
// category
// router.get('/category/:tag', controller.categoryLists)
// sub category
// router.get('/subCategory/:tag', controller.subCategoryLists)
// filter
router.get('/filterTagsList/:tag', controller.filterTagsList)
router.post('/save', controller.saveList)
router.get('/sidebar', controller.sidebar)
router.get('/profile/:mobile', controller.profile)
router.get('/saveList/:mobile', controller.AllSave)
router.post('/saveCheck/:mobile', controller.saveCheck)
router.post('/deleteSave/:mobile', controller.deleteSave)
module.exports = router;