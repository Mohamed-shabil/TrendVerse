const router = require('express').Router();
const userController = require('../controller/userController');
const middleware = require('../middleware/middleware');


router.get('/',userController.getHome);
router.get('/signup',userController.getSignUp)
router.post('/signup',userController.signup)
router.get('/varifyOtp',userController.getVarifyOtp);
router.post('/varifyOtp',userController.varifyOtp);

router.route('/login')
    .get(userController.getLogin)
    .post(userController.userLogin);

router.get('/shop/',userController.getProducts)
router.get('/shop/:id',userController.getProduct)








module.exports = router;
