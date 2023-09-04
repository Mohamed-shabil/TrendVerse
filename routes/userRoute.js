const router = require('express').Router();
const userController = require('../controller/userController');
const accountController = require('../controller/accountController');
const addressController = require('../controller/addressController');
const middleware = require('../middleware/middleware');



router.use(middleware.previousRouteTracker,middleware.authChecker);
router.get('/',userController.getHome);

router.get('/signup',userController.getSignUp)
router.post('/signup',userController.signup)
router.get('/varifyOtp',userController.getVarifyOtp);
router.post('/varifyOtp',userController.varifyOtp);


router.route('/login')
    .get(userController.getLogin)
    .post(userController.userLogin);


router.get('/shop',userController.getProducts)

router.route('/shop/:id')
    .get(userController.getProduct)
    .put(middleware.isLoggedin,userController.addToCart);

router.route('/cart')
    .get(middleware.isLoggedin,userController.getCart)
    .patch(middleware.isLoggedin,userController.addToCart)
    .delete(middleware.isLoggedin,userController.removeCartItem)

router.route('/cart/:id')
    .patch(middleware.authChecker,userController.updateCartQuantity);


router.route('/account')
    .get(middleware.isLoggedin,middleware.authChecker,accountController.getAccount);

router.route('/account/address')
    .get(middleware.isLoggedin,middleware.authChecker,addressController.getAddress)
    .delete(middleware.isLoggedin,middleware.authChecker,addressController.deleteAddress)

router.route('/account/address/addAddress')
    .get(middleware.isLoggedin,middleware.authChecker,addressController.getAddAddress)
    .post(middleware.isLoggedin,middleware.authChecker,addressController.AddAddress)
    

router.route('/account/address/editAddress/:id')
    .get(middleware.isLoggedin,middleware.authChecker,addressController.getEditAddress)
    .put(middleware.isLoggedin,middleware.authChecker,addressController.editAddress)







module.exports = router;
