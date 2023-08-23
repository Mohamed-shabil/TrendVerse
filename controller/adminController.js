const catchAsync = require('../utils/catchAsync');
const Admin = require('../model/adminModel');
const bcrypt = require('bcrypt')
exports.getLogin = (req,res) =>{
    res.render('./admin/login')
}

exports.login = catchAsync(async (req,res)=>{
    const { password , name} = req.body
    const admin = await Admin.findOne({name});
    if(!admin){
        req.flash('error','invalid password or email')
        res.locals.errorMessage = req.flash('error');
        res.render('./admin/login');
    }
    const isAdmin = await bcrypt.compare(password,admin.password);
    
    if(!isAdmin){
        req.flash('error','invalid password or email')
        res.locals.errorMessage = req.flash('error');
        res.render('./admin/login');
    }else{
        res.redirect('/admin');
    }
}) 
exports.getDashboard = (req,res) =>{
    res.render('./admin/dashboard');
}