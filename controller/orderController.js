const catchAsync = require('../utils/catchAsync');
const User = require('../model/userModel');
const Order = require('../model/orderModel');
const Address = require('../model/addressModel');
const crypto = require('crypto')
const Razorpay = require('razorpay')
const dotenv = require('dotenv');
dotenv.config({path:'./config.env'});


exports.getCheckout = catchAsync(async (req,res)=>{
    const user = await User.findOne({_id:req.user._id}).populate(['cart.product','defaultAddress'])
    console.log(user)
    res.render('./users/checkout',{
        user
    })
})

var instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET,
});



exports.checkout = catchAsync(async (req,res)=>{
  if(!req.body.paymentMethod){
    req.flash('error','Please choose a payment method');
    res.redirect('/cart/checkout')
  }
  const orderId = crypto.randomUUID();

  console.log("Default Address",req.user.defaultAddress);
  // const order = await Order.create({
  //     orderId,
  //     customer:req.user._id,
  //     products: req.user.cart,
  //     totalPrice : req.user.totalCartValue,
  //     deliveryAddress:req.user.defaultAddress,
  //     paymentMethod: req.body.paymentMethod,
  // });
  if(req.body.paymentMethod =='Online'){
    
    var options = {
      amount: parseInt(req.user.totalCartValue) * 100,
      currency: "INR",
      receipt: orderId.toString()
    };
    // await User.updateOne({_id:req.user._id},{$set:{cart:[],totalCartValue:0}});
    instance.orders.create(options, function(err, order) {
      if(err){
        console.log(err)
      }
      res.send(order);
    });
  }else{
    await User.updateOne({_id:req.user._id},{$set:{cart:[],totalCartValue:0}});
    req.flash('success','Order Placed Successfully')
    res.status(201).json({
      status:"success"
    })
  }
})

exports.verifyPayment = catchAsync(async (req,res)=>{
  console.log(req.body);
  const order = req.body.order
  const signature = req.body.payment.razorpay_signature
  const paymentId = req.body.payment.razorpay_payment_id
  console.log('order',order.receipt);
  console.log('signature', signature)
  let hmac = await crypto.createHmac('sha256',process.env.RAZORPAY_SECRET)
  hmac.update(order.id+'|'+paymentId)
  hmac = hmac.digest('hex')
  console.log(hmac)
  if (hmac == signature) {
    const placeOrder = await Order.create({
      orderId:order.receipt,
      customer:req.user._id,
      products: req.user.cart,
      totalPrice : req.user.totalCartValue,
      deliveryAddress:req.user.defaultAddress,
      paymentMethod: 'Online',
      paymentStatus:'Done'
  });
    await User.updateOne({_id:req.user._id},{$set:{cart:[],totalCartValue:0}});
    // const updatedOrder = await Order.findOneAndUpdate({orderId:order.receipt},{$set:{paymentStatus:'Done'}},{new:true});
    res.status(201).json({
      status:'success'
    })
  }else{
    await Order.deleteOne({orderId:order.receipt});
    res.status(201).json({
      status:'fail'
    })
  }
})




exports.getAllOrders = catchAsync(async(req,res)=>{
    const orders = await Order.aggregate([
        {
          $sort: { orderDate: -1 }
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
    
    orders.forEach((order)=>{
        order.customer.password = undefined;
        order.deliveryAddress.userId = undefined
        order.deliveryAddress._id = undefined,
        order.deliveryAddress[0]._id = undefined
    })
    console.log(orders[0].deliveryAddress)
    res.render('./admin/order/order',{orders});
})

exports.getOrderDetailsForAdmin = catchAsync(async (req,res)=>{
  const orderId = req.params.orderId
  const orders = await Order.aggregate([
    {
        $match:{
          orderId: orderId
        }
    },
    {
      $unwind: "$products"
    },
    {
      $sort: { orderDate: -1 }
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
  console.log(orders)
  res.render('./admin/order/orderDetails',{
    orders
  })
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

exports.getOrderDatails = catchAsync(async (req, res) => {
  const orderId = req.params.orderId
  const orders = await Order.aggregate([
    {
        $match:{
          orderId: orderId
        }
    },
    {
      $unwind: "$products"
    },
    {
      $sort: { orderDate: -1 }
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
  console.log(orders)
  res.render('./users/account/orderDetails',{
    orders
  })
});

exports.updateOrderStatus = catchAsync(async(req,res) => {
    const status = req.body.status;
    const orderId = req.body.orderId
    const updated = await Order.findByIdAndUpdate(orderId,{$set:{status:status}});
    res.redirect(req.previousUrl);
})

