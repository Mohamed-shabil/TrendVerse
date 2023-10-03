const catchAsync = require('../utils/catchAsync');
const User = require('../model/userModel');
const Order = require('../model/orderModel');
const Products = require('../model/productModel');
const Address = require('../model/addressModel');
const Return = require('../model/returnModel')
const Coupon = require('../model/couponModel')
const crypto = require('crypto')
const Razorpay = require('razorpay')
const dotenv = require('dotenv');
dotenv.config({path:'./config.env'});


exports.getCheckout = catchAsync(async (req,res)=>{
    const coupons = await Coupon.find();
    const user = await User.findOne({_id:req.user._id}).populate(['cart.product','defaultAddress'])
    res.render('./users/checkout',{
        user,coupons
    })
})

var instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET,
});


exports.applyWallet = catchAsync(async(req,res)=>{
  console.log(req.body);
  const balance = parseInt(req.body.balance);
  const totalAmount = parseInt(req.body.totalAmount);
  let updatedWallet;
  let updatedTotal;
  let discounted;
  if(balance >= totalAmount){
    updatedWallet = balance - totalAmount
    updatedTotal = 0;
    discounted = totalAmount
  }else{
    updatedTotal = totalAmount - balance
    updatedWallet = 0;
    discounted = balance
  }
  res.status(200).json({
    status:'success',
    data:{
      balance: updatedWallet,
      totalAmount : updatedTotal,
      discounted
    }
  })
});

exports.checkout = catchAsync(async (req,res)=>{
  console.log(req.user.defaultAddress);
  if(!req.user.defaultAddress){
    console.log('iam working')
    return res.json({
      status:'fail',
      reason : 'Please Provide Address'
    })
  }
  if(req.body.paymentMethod===undefined){
    req.flash('error','Please choose a payment method');
    return res.json({
      status:'fail',
      reason:'Please Select an Payment Method'
    })
  }

  const orderId = crypto.randomUUID();
  if(req.body.paymentMethod ==='Online'){
    console.log(req.body);
    let amountPayable = parseInt(req.body.payableAmount);
    var options = {
      amount: amountPayable * 100,
      currency: "INR",
      receipt: orderId.toString()
    };
    instance.orders.create(options, function(err, order) {
      if(err){
        console.log(err)
      }
      return res.send(order);
    });
  }else if(req.body.paymentMethod=='Wallet'){
    const user = await User.findById(req.user._id);
    const currentBalance = parseInt(req.body.currentWalletBalance)
    const debitedAmount = parseInt(req.user.wallet.balance) - currentBalance
    const order = await Order.create({
      orderId,
      customer:req.user._id,
      products: req.user.cart,
      totalPrice : req.body.payableAmount,
      deliveryAddress:req.user.defaultAddress,
      paymentMethod: 'Wallet',
    });
    user.wallet.transactionHistory.push({
      amount:debitedAmount,
      operation:'debit',
      message:`Used in Purchase`,
      OrderId:orderId
    })
    if(req.body.couponUsed){
      user.usedCoupons.push(req.body.couponUsed);
    }
    user.wallet.balance = currentBalance
    
    user.cart = [];
    user.totalCartValue = 0;
    await user.save();
    req.flash('success','Order Placed Successfully')
    return res.status(200).json({
      status:'success',
      payment:'Wallet'
    })  
  }
  else{
    console.log("COD")
    const order = await Order.create({
      orderId,
      customer:req.user._id,
      products: req.user.cart,
      totalPrice : req.body.payableAmount,
      deliveryAddress:req.user.defaultAddress,
      paymentMethod: req.body.paymentMethod,
    });
    req.user.cart.forEach(async (product)=>{
      const productDetails = await Products.findOne(product.product);
      productDetails.stock = productDetails.stock - product.quantity;
      productDetails.save();
    })
    const user = await User.findById(req.user._id);
    const currentBalance = parseInt(req.body.currentWalletBalance)
    const debitedAmount = parseInt(req.user.wallet.balance) - currentBalance
    user.wallet.transactionHistory.push({
      amount:debitedAmount,
      operation:'debit',
      message:`Used in Purchase`,
      OrderId:orderId
    });
    user.wallet.balance = currentBalance
    user.cart = [];
    if(req.body.couponUsed){
      user.usedCoupons.push(req.body.couponUsed);
    }
    user.totalCartValue = 0;
    await user.save();

    

    req.flash('success','Order Placed Successfully')
    return res.status(201).json({
      status:"success"
    })
  }
})

exports.verifyPayment = catchAsync(async (req,res)=>{
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
  req.user.cart.forEach(async (product)=>{
    const productDetails = await Products.findOne(product.product);
    productDetails.stock = productDetails.stock - product.quantity;
    productDetails.save();
  })
    await User.updateOne({_id:req.user._id},{$set:{cart:[],totalCartValue:0}});
    
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
  
  res.render('./admin/order/orderDetails',{
    orders
  })
})

exports.getMyOrders = catchAsync(async(req,res)=>{
  const returns = await Return.find({user:req.user._id});
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
  if(!returns){
    return res.render('./users/account/order',{
        orders:myOrders
    });
  }
  
  console.log(returns);
  console.log(myOrders)
  return res.render('./users/account/order',{
    orders:myOrders,returns
  })
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
  console.log('ahello',orders);
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



exports.getInvoice = catchAsync(async(req,res)=>{
  console.log(req.params.orderId)
  const orders = await Order.aggregate([
      {
        $match: { orderId:req.params.orderId }
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

    console.log(orders[0])
  res.render('./users/invoice',{orders});
})
