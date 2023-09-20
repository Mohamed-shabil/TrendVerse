const Return = require('../model/returnModel')
const Order = require('../model/orderModel')
const catchAsync = require('../utils/catchAsync')


exports.getReturnOrderForm = catchAsync(async(req,res)=>{
    const orderId = req.params.id
    console.log(orderId)
    const order = await Order.findOne({orderId}).populate('products.product');
    console.log(order.products)
    res.render('./users/returnOrderForm',{
        order
    })
})

exports.createReturn = catchAsync(async(req,res)=>{
    const {order, reason} = req.body
    console.log(req.body)
    const user = req.user._id
    await Order.findOneAndUpdate({_id:order},{status:'Return'});
    const newReturn = await Return.create({
        order,
        user,
        reason
    })

    res.redirect('/account/orders')
})

exports.updateStatus = catchAsync(async (req,res)=>{
    console.log('Hello worlds',req.body.id)
    console.log('Hello worlds',req.body.status)
    
    const updateStatus = await Return.findOneAndUpdate({order:req.body.id},{$set:{status:req.body.status}},{new:true});
    console.log('Hello world',updateStatus)
    res.redirect(req.previousUrl)
})

exports.getAllReturnOrder = catchAsync(async (req,res)=>{
    const returnOrder = await Return.find().populate('order');
    
    res.render('./admin/order/returnOrder',{returnOrder})
})