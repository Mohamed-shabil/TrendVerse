const catchAsync = require('../utils/catchAsync');
const Coupon = require('../model/couponModel');

exports.createCoupon = catchAsync(async(req,res) => {
    const {code , discountType , minimumSpend, expirationDate, discount} = req.body;
    const selectedDate = new Date(expirationDate);
    const currentDate = new Date();

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


exports.getAddCoupon = catchAsync(async(req,res) => {
    res.render('./admin/coupon/addCoupon');
})


exports.deleteCoupon = catchAsync(async(req,res) => {
    const deletedCoupon = await Coupon.deleteOne({_id:req.body.id});
    if(!deletedCoupon){
        req.flash('error','Something went Wrong try to delete Again');
        res.redirect('/admin/coupons');  
    }
    req.flash('success','Coupon deleted Successfully !');
})

exports.editCoupon = catchAsync(async(req,res) => {
    const coupon = await Coupon.updateOne({_id:req.body.id},data,{new:true});
    if(!coupon){
        req.flash('error','Something went Wrong try again');
        res.redirect('/admin/coupons')
    }
    req.flash('success','Coupon updated Successfully');
    res.redirect('/admin/coupons');
})

exports.getEditCoupon = catchAsync(async(req,res) => {

})

exports.getAllCoupons = catchAsync(async(req,res) => {
    const coupons = await Coupon.find();
    res.render('./admin/coupon/coupons',{coupons});
})