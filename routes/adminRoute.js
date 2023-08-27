const express = require('express');
const router = express.Router();
const adminController = require('../controller/adminController');
const middleware = require('../middleware/middleware')

router.get('/login',adminController.getLogin)
      .post('/login',adminController.login);

router.use(middleware.isAdminLoggedIn);

router.get('/',adminController.getDashboard);

router.get('/products',adminController.getProducts)
router.route('/products/addProducts')
      .get(adminController.getAddProducts)
      .post(middleware.uploadProductImages,middleware.resizeProductImages,adminController.addProducts);

router.route('/products/editProduct/:id')
      .get(adminController.getEditProduct)
      .put(middleware.uploadProductImages,middleware.resizeProductImages,adminController.editProduct)
      .delete(adminController.deleteProduct);

router.route('/category')
      .get(adminController.getCategory);

router.route('/category/addCategory')
      .get(adminController.getAddCategory)
      .post(middleware.uploadCategoryImage,middleware.resizeCategoryImage,adminController.addCategory);

router.route('/category/editCategory/:id')
      .get(adminController.getEditCategory)
      .put(middleware.uploadCategoryImage,middleware.resizeCategoryImage,adminController.editCategory)
      .delete(adminController.deleteCategory)

router.route('/users').get(adminController.getUsers)

router.route('/users/:id').put(adminController.blockUsers)

router.route('/logout')
      .get(adminController.logout)

module.exports = router