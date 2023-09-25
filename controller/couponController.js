const catchAsync = require('../utils/catchAsync');
const Coupon = require('../model/couponModel');
const User = require('../model/userModel');

exports.createCoupon = catchAsync(async(req,res) => {
    const {code , discountType , minimumSpend, expirationDate, discount} = req.body;
    const selectedDate = new Date(expirationDate);
    const currentDate = new Date();
    console.log(expirationDate);
    if(selectedDate < currentDate) {
        req.flash('error','Choose a Valid Date');
        return res.redirect('/admin/coupons/addCoupon');
    }
    const UpperCode = code.toUpperCase();
    console.log(UpperCode);
    const coupon = await Coupon.find({code:UpperCode});
    console.log(coupon)
    if(coupon.length){
        req.flash('error','Coupon With this code already Exist try Another one');
        return res.redirect('/admin/coupons/addCoupon');
    }
    const newCoupon = await Coupon.create({
        code:UpperCode,
        discountType,
        minimumSpend,
        discount,
        expirationDate
    });

    if(!newCoupon){
        req.flash('error','Something Went Wrong try Again!');
        res.redirect('/admin/coupons');
    }
    req.flash('success','Coupon Created Successfully');
    res.redirect('/admin/coupons');
})

exports.applyCoupon = catchAsync(async (req,res)=>{
    const {code , orderTotal} = req.body;
    console.log(req.body)
    const coupon = await Coupon.findOne({code});
    if(!coupon){
        return res.status(200).json({
            status:'fail',
            error:'Coupon is invalid'
        })
    }
    if(coupon.expirationDate && coupon.expirationDate < new Date()){
        return res.status(200).json({
            status:'fail',
            error:'Coupon has Expired'
        })
    }

    if(orderTotal < coupon.minimumSpend){
        return res.status(200).json({
            status:'fail',
            error:'Minimum Purchase amount not met'
        })
    }
    
    const user = await User.findById(req.user._id);
    console.log(user.usedCoupons);
    if(user.usedCoupons.includes(code)){
        return res.status(200).json({
            status:'fail',
            error:'You already used this coupon'
        })
    }
    


    let discount = 0;
    if(coupon.discountType == 'percentage'){
        discount = (coupon.discount/100) * orderTotal*1;
    }else if(coupon.discountType == 'fixed'){
        discount = coupon.discount;
    }
    console.log(discount);
    res.status(200).json({
        status:'success',
        data:{
            discount
        }
    })
})

exports.getAddCoupon = catchAsync(async(req,res) => {
    res.render('./admin/coupon/addCoupon');
})


exports.deleteCoupon = catchAsync(async(req,res) => {
    console.log(req.params)
    const deletedCoupon = await Coupon.deleteOne({_id:req.params.id});
    if(!deletedCoupon){
        req.flash('error','Something went Wrong try to delete Again');
        res.redirect('/admin/coupons');  
    }
    req.flash('success','Coupon deleted Successfully !');
    res.redirect('/admin/coupons')
})

exports.getEditCoupon = catchAsync(async(req,res) => {
    const code = req.params.code
    const coupon = await Coupon.findOne({code});
    res.render('./admin/coupon/editCoupon',{coupon});
})

exports.editCoupon = catchAsync(async(req,res) => {
    const data = req.body;
    console.log(data)
    const coupon = await Coupon.updateOne({code:req.params.code},data,{new:true});
    if(!coupon){
        req.flash('error','Something went Wrong try again');
        res.redirect('/admin/coupons')
    }
    req.flash('success','Coupon updated Successfully');
    res.redirect('/admin/coupons');
})


exports.getAllCoupons = catchAsync(async(req,res) => {
    const coupons = await Coupon.find();
    res.render('./admin/coupon/coupons',{coupons});
})