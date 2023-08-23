const router = require('express').Router();
const userController = require('../controller/userController');


router.get('/',userController.getHome);
router.get('/signup',userController.getSignUp)
router.post('/signup',userController.signup)
router.get('/varifyOtp',userController.getVarifyOtp);
router.post('/varifyOtp',userController.varifyOtp);
router.get('/login',userController.getLogin)
router.post('/login',userController.userLogin);







module.exports = router;
