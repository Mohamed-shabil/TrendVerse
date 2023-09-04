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