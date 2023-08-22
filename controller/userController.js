const catchAsync = require('../utils/catchAsync');
const User = require('../model/userModel');
const bcrypt = require('bcrypt');
exports.getHome = (req,res)=>{
    res.render('./users/home');
}

exports.getLogin = (req,res)=>{
    res.render('./users/Login');
}

exports.userLogin = (req,res)=>{
    console.log(req.body)
}

exports.getSignUp = (req,res)=>{
    res.render('./users/signup')
}
exports.signup = catchAsync(async(req,res)=>{
    const pass = await bcrypt.hash(req.body.password);
    const data = await User.create({
        name : req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        password : pass
    })
    
})
