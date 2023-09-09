const router = require('express').Router();
const userController = require('../controller/userController');
const accountController = require('../controller/accountController');
const addressController = require('../controller/addressController');
const orderController = require('../controller/orderController');
const middleware = require('../middleware/middleware');



router.use(middleware.previousRouteTracker,middleware.authChecker);
router.get('/',userController.getHome);

router.get('/signup',middleware.isAlreadyLoggedIn,userController.getSignUp)
router.post('/signup',middleware.isAlreadyLoggedIn,userController.signup)
router.get('/varifyOtp',middleware.isAlreadyLoggedIn,userController.getVarifyOtp);
router.post('/varifyOtp',middleware.isAlreadyLoggedIn,userController.varifyOtp);


router.route('/login')
    .get(middleware.isAlreadyLoggedIn,userController.getLogin)
    .post(userController.userLogin);

// router.use(middleware.isBlocked);   

router.get('/shop',userController.getProducts)

router.route('/shop/:slug')
    .get(userController.getProduct)
    .put(middleware.isLoggedin,userController.addToCart);

router.route('/cart')
    .get(userController.getCart)
    .patch(userController.addToCart)
    .delete(userController.removeCartItem)

router.route('/cart/:id')
    .patch(middleware.authChecker,userController.updateCartQuantity);

router.route('/cart/checkout')
    .get(middleware.isLoggedin,middleware.authChecker,middleware.checkCart,orderController.getCheckout)
    .post(middleware.isLoggedin,middleware.authChecker,orderController.checkout);

router.route('/account')
    .get(middleware.isLoggedin,middleware.authChecker,accountController.getAccount);

router.route('/account/updateProfile')
    .get(middleware.isLoggedin,middleware.authChecker,accountController.getUpdateProfile)
    .patch(middleware.isLoggedin,middleware.authChecker,middleware.uploadProfileImage,middleware.resizeProfileImage,accountController.updateProfile)

router.route('/account/updatePassword')
    .get(middleware.isLoggedin,middleware.authChecker,userController.getUpdatePassword)
    .patch(middleware.isLoggedin,middleware.authChecker,userController.updatePassword)

router.route('/account/address')
    .get(middleware.isLoggedin,middleware.authChecker,addressController.getAddress)
    .patch(middleware.isLoggedin,middleware.authChecker,addressController.setDefaultAddress)
    .delete(middleware.isLoggedin,middleware.authChecker,addressController.deleteAddress)

router.route('/account/orders')
    .get(middleware.isLoggedin,middleware.authChecker,orderController.getMyOrders)
    .patch(middleware.isLoggedin,middleware.authChecker,orderController.updateOrderStatus)


router.route('/account/address/addAddress')
    .get(middleware.isLoggedin,middleware.authChecker,addressController.getAddAddress)
    .post(middleware.isLoggedin,middleware.authChecker,addressController.AddAddress)
    

router.route('/account/address/editAddress/:id')
    .get(middleware.isLoggedin,middleware.authChecker,addressController.getEditAddress)
    .put(middleware.isLoggedin,middleware.authChecker,addressController.editAddress)

router.route('/account/logout')
    .get(middleware.isLoggedin,middleware.authChecker,userController.logout);


module.exports = router;
