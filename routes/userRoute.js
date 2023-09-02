const router = require('express').Router();
const userController = require('../controller/userController');
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








module.exports = router;
