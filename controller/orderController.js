const catchAsync = require('../utils/catchAsync');
const User = require('../model/userModel');
const Order = require('../model/orderModel');
const Address = require('../model/addressModel');
const crypto = require('crypto')




exports.getCheckout = catchAsync(async (req,res)=>{
    const user = await User.findOne({_id:req.user._id}).populate(['cart.product','defaultAddress'])
    console.log(user)
    res.render('./users/checkout',{
        user
    })
})
exports.checkout = catchAsync(async (req,res)=>{
    if(!req.body.paymentMethod){
      req.flash('error','Please choose a payment method');
      res.redirect('/cart/checkout')
    }
    const orderId = crypto.randomUUID();
    console.log("Default Address",req.user.defaultAddress);
    const order = await Order.create({
        orderId,
        customer:req.user._id,
        products: req.user.cart,
        totalPrice : req.user.totalCartValue,
        deliveryAddress:req.user.defaultAddress,
        paymentMethod: req.body.paymentMethod
    });
    await User.updateOne({_id:req.user._id},{$set:{cart:[],totalCartValue:0}});
    req.flash('success','Order Placed Successfully')
    res.redirect('/account/orders');
})

exports.getAllOrders = catchAsync(async(req,res)=>{
    const orders = await Order.aggregate([
        {
          $unwind: "$products" 
        },
        {
          $lookup: {
            from: "products", 
            localField: "products.product", 
            foreignField: "_id", 
            as: "products.product" 
          }
        },
        {
          $unwind: "$customer" 
        },
        {
            $lookup: {
              from: "users", 
              localField: "customer", 
              foreignField: "_id", 
              as: "customer" 
            }
        },
        {
          $lookup: {
            from: "addresses", 
            localField: "deliveryAddress", 
            foreignField: "_id", 
            as: "deliveryAddress" 
          }
        },
        
        
      ]);
    
    orders.forEach((order)=>{
        order.customer.password = undefined;
        order.deliveryAddress.userId = undefined
        order.deliveryAddress._id = undefined,
        order.deliveryAddress[0]._id = undefined
    })
    console.log(orders[0].deliveryAddress)
    res.render('./admin/order/order',{orders});
})

exports.getMyOrders = catchAsync(async(req,res)=>{
    const myOrders = await Order.aggregate([
        {
            $match:{
              customer: req.user._id
            }
        },
        {
          $sort: { orderDate: -1 }
        },
        {
          $unwind: "$products" 
        },
        {
          $lookup: {
            from: "products", 
            localField: "products.product", 
            foreignField: "_id", 
            as: "products.product" 
          }
        },
        {
          $lookup: {
            from: "addresses", 
            localField: "deliveryAddress", 
            foreignField: "_id", 
            as: "deliveryAddress" 
          }
        }
      ]);
    console.log(myOrders);
    res.render('./users/account/order',{
        orders:myOrders
    });
})

exports.updateOrderStatus = catchAsync(async(req,res) => {
    const status = req.body.status;
    const orderId = req.body.orderId
    const updated = await Order.findByIdAndUpdate(orderId,{$set:{status:status}});
    res.redirect(req.previousUrl);
})

