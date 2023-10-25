const router = require('express').Router();
const userController = require('../controller/userController');
const accountController = require('../controller/accountController');
const addressController = require('../controller/addressController');
const orderController = require('../controller/orderController');
const returnController = require('../controller/returnController');
const walletController = require('../controller/walletController');
const wishlistController = require('../controller/wishlistController');
const couponController = require('../controller/couponController')
const middleware = require('../middleware/middleware');
const passport = require('passport');
const token = require('../utils/token')

router.use(middleware.previousRouteTracker,middleware.authChecker);
router.get('/',userController.getHome);

router.get('/signup',middleware.isAlreadyLoggedIn,userController.getSignUp)
router.post('/signup',middleware.isAlreadyLoggedIn,userController.signup)



router.get('/oauth/google', passport.authenticate('google', { scope: ['profile','email','phone'] }))

router.get('/oauth/google/trendverse', passport.authenticate('google',{ failureRedirect: '/login' }), (req, res) => {
    token.createSendToken(req.user,res)
    res.redirect('/account');
});



router.get('/varifyOtp',middleware.isAlreadyLoggedIn,userController.getVarifyOtp);
router.post('/varifyOtp',middleware.isAlreadyLoggedIn,userController.varifyOtp);


router.route('/login')
    .get(middleware.isAlreadyLoggedIn,userController.getLogin)
    .post(userController.userLogin);

    
router.get('/shop',userController.getProducts)
router.route('/shop/:slug')
    .get(userController.getProduct)
    .put(middleware.isLoggedin,userController.addToCart);
    
router.use(middleware.isBlocked);

router.route('/forgotPassword')
    .get(middleware.isAlreadyLoggedIn,userController.getForgotPassword)
    .post(middleware.isAlreadyLoggedIn,userController.forgotPassword)
router.route('/resetPassword/:token')
    .get(middleware.isAlreadyLoggedIn,userController.getResetPassword)
    .post(middleware.isAlreadyLoggedIn,userController.resetPassword)

router.route('/cart')
    .get(middleware.authChecker,middleware.isLoggedin,userController.getCart)
    .patch(middleware.authChecker,middleware.isLoggedin,userController.addToCart)
    .delete(middleware.authChecker,middleware.isLoggedin,userController.removeCartItem)

router.route('/cart/:id')
    .patch(middleware.authChecker,userController.updateCartQuantity);

router.route('/referals')
    .get(middleware.authChecker,userController.getMyReferal)

router.route('/cart/checkout')
    .get(middleware.isLoggedin,middleware.authChecker,middleware.checkCart,orderController.getCheckout)
    .post(middleware.isLoggedin,middleware.authChecker,orderController.checkout)
    .put(middleware.isLoggedin,middleware.authChecker,orderController.applyWallet)

router.route('/wishlist')
    .get(middleware.isLoggedin,middleware.authChecker,wishlistController.getWhishList)
    .patch(middleware.isLoggedin,middleware.authChecker,wishlistController.addToWishlist)
    .delete(middleware.isLoggedin,middleware.authChecker,wishlistController.removeFromWishlist);
    
router.route('/cart/checkout/applyCoupon')
    .post(middleware.isLoggedin,middleware.authChecker,couponController.applyCoupon)

router.route('/verifyPayment')
    .post(middleware.isLoggedin,middleware.authChecker,orderController.verifyPayment)
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


router.route('/account/myWallet')
    .get(middleware.isLoggedin,middleware.authChecker,walletController.getWallet)
    
router.route('/account/orders')
    .get(middleware.isLoggedin,middleware.authChecker,orderController.getMyOrders)
    .patch(middleware.isLoggedin,middleware.authChecker,orderController.updateOrderStatus)

router.route('/account/orders/:orderId')
    .get(middleware.isLoggedin,middleware.authChecker,orderController.getOrderDatails)


router.route('/account/orders/getInvoice/:orderId')
    .get(middleware.isLoggedin,middleware.authChecker,orderController.getInvoice)
    
router.route('/account/address/addAddress')
    .get(middleware.isLoggedin,middleware.authChecker,addressController.getAddAddress)
    .post(middleware.isLoggedin,middleware.authChecker,addressController.AddAddress)


router.route('/account/address/editAddress/:id')
    .get(middleware.isLoggedin,middleware.authChecker,addressController.getEditAddress)
    .put(middleware.isLoggedin,middleware.authChecker,addressController.editAddress)


router.route('/account/orders/returnOrderForm/:id')
    .get(middleware.isLoggedin,middleware.authChecker,returnController.getReturnOrderForm)
    .post(middleware.isLoggedin,middleware.authChecker,returnController.createReturn);


router.route('/account/logout')
    .get(middleware.isLoggedin,middleware.authChecker,userController.logout);


module.exports = router;
