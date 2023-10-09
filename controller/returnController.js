const Return = require('../model/returnModel')
const Order = require('../model/orderModel')
const User = require('../model/userModel')
const sendMail = require('../utils/email');
const catchAsync = require('../utils/catchAsync')


exports.getReturnOrderForm = catchAsync(async(req,res)=>{
    const orderId = req.params.id
    console.log(orderId)
    const order = await Order.findOne({orderId}).populate('products.product').sort({createdAt:-1})
    console.log(order.products)
    res.render('./users/returnOrderForm',{
        order
    })
})

exports.createReturn = catchAsync(async(req,res)=>{
    const {order, reason,message} = req.body
    console.log(req.body)
    const user = req.user._id
    await Order.findOneAndUpdate({_id:order},{status:'Return'});
    const newReturn = await Return.create({
        order,
        user,
        reason,
        message
    })

    res.redirect('/account/orders')
})

exports.updateStatus = catchAsync(async (req,res)=>{
    const status = req.body.status;
    if(status!='Completed'){
        const updateStatus = await Return.findOneAndUpdate({order:req.body.id},{$set:{status:req.body.status}},{new:true});
        console.log('Hello world',updateStatus)
        return res.redirect(req.previousUrl)
    }
    const currentReturn = await Return.findOne({order:req.body.id}).populate(['order','user']);
    const user = await User.findOne({_id:currentReturn.user._id})
    user.wallet.balance += currentReturn.order.totalPrice
    const transaction ={
        amount:currentReturn.order.totalPrice,
        operation:'credit',
        message:'Refund Amount of order ' + req.body.id,
        OrderId : currentReturn.order._id,
        date: new Date(),
        timeStamp: new Date().toLocaleTimeString()
    }

    user.wallet.transactionHistory.push(transaction);
    currentReturn.status = 'Completed'
    await currentReturn.save();
    const options = {
        from:process.env.EMAIL,
        to:user.email,
        subject: 'Refund amount has been Credited!',
        html:`<h3 style="color:red;">Your Amount of order returned lately added to you TrendVerse Wallet ₹${currentReturn.order.totalPrice}/-</h3><br>
        <p style="color:grey;">Check your account profile of ${user.email} and verify!</p><br><i>Enjoy you future journey with <b style="color:red;">TrendVerse</b></i>`
    }
    await user.save();
    await sendMail(options);
    return res.redirect(req.previousUrl);
})

exports.getAllReturnOrder = catchAsync(async (req,res)=>{
    const returnOrder = await Return.find().populate('order').sort({createdAt:-1});
    console.log(returnOrder);
    res.render('./admin/order/returnOrder',{returnOrder})
})