const router = require('express').Router();
const userController = require('../controller/userController');
const email = require('../utils/email');

router.get('/',userController.getHome);
router.get('/signup',userController.getSignUp)
router.post('/signup',userController.signup)
router.get('/login',userController.getLogin)
router.post('/login',userController.userLogin);
router.get('/send',email);






module.exports = router;
