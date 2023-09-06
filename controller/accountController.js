const catchAsync = require('../utils/catchAsync');
const User = require('../model/userModel');
const bcrypt = require('bcrypt');
const randomString = require('randomstring');
const token = require('../utils/token')


exports.getAccount = catchAsync(async(req,res)=>{
    res.render('./users/account/account',{
        user:req.user
    });
})

exports.getAccountInformation = catchAsync(async(req,res)=>{
    res.render('./users/accountInformation',{
        user:req.user
    })
})

exports.getUpdateProfile = catchAsync(async(req,res)=>{
    res.render('./users/account/updateAccount',{user:req.user})
})


exports.updateProfile = catchAsync(async (req,res)=>{
    const data = {
        name: req.body.name,
        phone:req.body.phone,
        profile:req.body.profile
    }
    await User.findByIdAndUpdate({_id:req.user._id},data);
    res.redirect('/account');
})
