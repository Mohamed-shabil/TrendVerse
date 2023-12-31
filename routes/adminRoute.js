const express = require('express');
const router = express.Router();
const adminController = require('../controller/adminController');
const orderController = require('../controller/orderController');
const returnController = require('../controller/returnController')
const middleware = require('../middleware/middleware');
const bannerController = require('../controller/bannerController');
const couponController = require('../controller/couponController');
const offerController = require('../controller/offerController')

router.get('/login',middleware.checkAdmin,adminController.getLogin)
.post('/login',adminController.login);

router.use(middleware.isAdminLoggedIn);

router.get('/',adminController.getDashboard);

router.route('/products')
      .get(adminController.getProducts)

router.route('/products/addProducts')
      .get(adminController.getAddProducts)
      .post(middleware.uploadProductImages,middleware.resizeProductImages,adminController.addProducts);

router.route('/products/editProduct/:id')
      .get(adminController.getEditProduct)
      .patch(adminController.editProduct)
      .delete(adminController.deleteProduct);


router.route('/products/editProduct/:id/uploadImage')
      .patch(middleware.uploadProductImages,middleware.resizeProductImages,adminController.addProductImage)

router.route('/products/editProduct/:id/:image')
      .delete(adminController.deleteProductImage)

router.route('/category')
      .get(adminController.getCategory);

router.route('/category/addCategory')
      .get(adminController.getAddCategory)
      .post(middleware.uploadCategoryImage,middleware.resizeCategoryImage,adminController.addCategory);

router.route('/category/editCategory/:id')
      .get(adminController.getEditCategory)
      .put(middleware.uploadCategoryImage,middleware.resizeCategoryImage,adminController.editCategory)
      .delete(adminController.deleteCategory)

router.route('/banner')
      .get(bannerController.getBanner)

router.route('/banner/addBanner')
      .get(bannerController.getAddBanner)
      .post(middleware.uploadBannerImage,middleware.resizeBannerImages,bannerController.addBanner)

router.route('/banner/editBanner/:id')
      .get(bannerController.getEditBanner)

router.route('/banner/deleteBanner/:id')
      .delete(bannerController.deleteBanner)

router.route('/orders')
      .get(orderController.getAllOrders)
      .patch(orderController.updateOrderStatus)

router.route('/orders/:orderId')
      .get(orderController.getOrderDetailsForAdmin)


router.route('/order/getInvoice/:orderId')
      .get(orderController.getInvoice)

router.route('/returnOrder')
      .get(returnController.getAllReturnOrder)
      .patch(returnController.updateStatus)

router.route('/users')
      .get(adminController.getUsers)

router.route('/users/:id')
      .put(adminController.blockUsers)

router.route('/salesReport')
      .get(adminController.getSalesReport)
      .post(adminController.downloadSalesReport)

router.route('/offers')
      .get(offerController.getOffers)

router.route('/offers/addOffer')
      .get(offerController.getAddOffers)
      .post(offerController.createOffer);

router.route('/offers/editOffer/:id')
      .get(offerController.getEditOffer)
      .post(offerController.editOffer);

router.route('/offers/deleteOffer/:id')
      .delete(offerController.deleteOffer)
router.route('/coupons')
      .get(couponController.getAllCoupons)

router.route('/coupons/addCoupon')
      .get(couponController.getAddCoupon)
      .post(couponController.createCoupon)
      
router.route('/coupons/deleteCoupon/:id')
      .delete(couponController.deleteCoupon);

router.route('/coupons/editCoupon/:code')
      .get(couponController.getEditCoupon)
      .put(couponController.editCoupon)

router.route('/stockAlert')
      .get(adminController.getStockAlert)

router.route('/stockAlert/:id')
      .patch(adminController.updateVisibility);

router.route('/returnOrders')
      .get(returnController.getAllReturnOrder)

router.route('/logout')
      .get(adminController.logout)

module.exports = router