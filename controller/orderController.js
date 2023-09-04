const catchAsync = require('../utils/catchAsync');
const User = require('../model/userModel');
const Order = require('../model/orderModel');
const crypto = require('crypto')
const randomString = require('randomstring');
const token = require('../utils/token');

exports.createOrder = catchAsync(async (req,res)=>{
    const user = req.user;
    const orderNumber = crypto.randomUUID();
    const order = await Order.create({
        orderNumber,
        customer:req.user._id,
        products: req.user.cart,
        totalPrice : req.user.totalCartValue
    })
    res.send("order-success")
})