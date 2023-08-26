const catchAsync = require('../utils/catchAsync');
const User = require('../model/userModel');
const Products = require('../model/productModel'); 
const bcrypt = require('bcrypt');
const randomString = require('randomstring');
const sendMail = require('../utils/email');


exports.getHome = catchAsync(async(req,res)=>{
    const products = await Products.find();
    res.render('./users/home',{
        products
    });
})


exports.getLogin = (req,res)=>{
    res.render('./users/Login');
}


exports.userLogin = catchAsync( async (req,res)=>{
    const {password, email} = req.body;

    const user = await User.findOne({email});
    if(!user){
        req.flash('error','invalid password or email')
        res.locals.errorMessage = req.flash('error');
        res.render('./users/login');
    }else{
        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            req.flash('error','invalid password or email')
            res.locals.errorMessage = req.flash('error');
            return res.render('./users/login');
        }
        if(!user.varified){
            req.flash('error','your email is not varified')
            res.locals.errorMessage = req.flash('error');
            return res.redirect('/varitfyOtp');
        }
        return res.redirect('/');
    }

})


exports.getSignUp = (req,res)=>{
    res.render('./users/signup')
}

exports.signup = catchAsync( async (req,res)=>{
    const oldUser = await User.findOne({email:req.body.email});
    
    if(oldUser){
        req.flash('error','User already exists, please login')
        res.locals.errorMessage = req.flash('error');
        return res.redirect('/login');
    }

    const pass = await bcrypt.hash(req.body.password,10);
    const otp = randomString.generate({
        length:4,
        charset:'numeric',
    })

    const data = await User.create({
        name : req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        password : pass,
        otp:otp,
    })
    
    const options = {
        from:process.env.EMAIL,
        to:req.body.email,
        subject: 'Trendverse varification OTP',
        html:`<center> <h2>Varify Your Email </h2> <br> <h5>OTP :${otp} </h5><br><p>This otp is only valid for 5 minutes only</p></center>`
    }
    await sendMail(options);
    res.redirect('/varifyOtp')
})

exports.getVarifyOtp =(req,res)=>{
    res.render('./users/validateOtp')
}

exports.varifyOtp = catchAsync(async(req,res)=>{
    const otp = req.body.otp
    const user = await User.findOne({otp});
    if(!user){
        req.flash('error','invalid')
        res.redirect('/varifyOtp')
    }else{
        const isVarified = await User.findOneAndUpdate({_id:user._id},{$set:{varified:true}},{new:true});
        console.log(isVarified.varified);
        if(isVarified.varified){
            req.flash('success','You are varified')
            res.redirect('/')
        }else{
            req.flash('error','invalid')
            res.redirect('/varifyOtp')
        }
    }
})

exports.getProducts = catchAsync(async(req,res)=>{
    const product = await Products.findOne({_id:req.params.id});
    console.log(product);
    res.render('./users/productsDetails',{
        product
    });
})

