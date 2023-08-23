const express = require('express');
const router = express.Router();
const adminController = require('../controller/adminController');

router.get('/login',adminController.getLogin);

router.get('/',adminController.getDashboard);



module.exports = router