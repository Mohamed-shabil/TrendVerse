const catchAsync = require('../utils/catchAsync');
const User = require('../model/userModel');
const Products = require('../model/productModel'); 
const bcrypt = require('bcrypt');
const randomString = require('randomstring');
const token = require('../utils/token')
const sendMail = require('../utils/email');


exports.getHome = catchAsync(async(req,res)=>{
    const products = await Products.find();
    res.render('./users/home',{
        products
    });
})


exports.getLogin = (req,res)=>{

    console.log(res.locals.errorMessage)
    return res.render('./users/Login');
}


exports.userLogin = catchAsync( async (req,res)=>{
    const {password, email} = req.body;

    const currentUser = await User.findOne({email});
    if(!currentUser){
        req.flash('error','invalid password or email')
        res.locals.errorMessage = req.flash('error');
        res.render('./users/login');
    }else{
        const isMatch = await bcrypt.compare(password, currentUser.password);

        if(!isMatch){
            req.flash('error','invalid password or email')
            res.locals.errorMessage = req.flash('error');
            return res.render('./users/login');
        }
        if(!currentUser.varified){
            req.flash('error','your email is not varified')
            res.locals.errorMessage = req.flash('error');
            return res.redirect('/varitfyOtp');
        }
        token.createSendToken(currentUser,res);
        req.session.user = currentUser 
        console.log(req.session.user)
        return res.redirect('/');
    }

})


exports.getSignUp = (req,res)=>{
    res.render('./users/signup')
}

exports.signup = catchAsync( async (req,res)=>{
    const oldUser = await User.findOne({email:req.body.email});
    const userdata = {
        name : req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        password : req.body.password
    }
    if(oldUser){
        req.flash('error','User already exists, please login')
        req.flash('data',userdata)
        return res.redirect('/signup');
    }
    if(req.body.password !== req.body.ConfirmPassword){
        console.log('Working')
        req.flash('error','Your Passwords are not matching, please try again');
        req.flash('data',userdata);
        return res.redirect('/signup');
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

exports.getProduct = catchAsync(async(req,res)=>{
    const user = req.user;
    const product = await Products.findOne({_id:req.params.id});
    res.render('./users/productsDetails',{
        product,user
    });
})
exports.getProducts = catchAsync(async(req,res)=>{

    const products = await Products.find();
    res.render('./users/products',{
        products
    });
})

exports.addToCart = catchAsync(async (req,res)=>{
    const previousPath = req.previousUrl;
    console.log(previousPath);
    const quantity = parseInt(req.body.quantity) || 1;
    const product = await Products.findById(req.body.id);
    const user = await User.findById({_id: req.user._id}).populate('cart.product');
    const totalAmount = product.price * quantity;
    
    
    let totalCartValue = 0;
    user.cart.forEach(item => {
        totalCartValue +=  item.totalAmount;
    })
    
    const existingCartItemIndex = user.cart.filter( item => item.product.equals(product._id));
    if(!existingCartItemIndex){
        user.cart[existingCartItemIndex].quantity += quantity;
        user.cart[existingCartItemIndex].totalAmount += totalAmount; 
        user.totalCartValue += (totalCartValue + totalAmount); 
    }else{
        user.cart.push({product:product._id,quantity,totalAmount});
        user.totalCartValue = (totalCartValue + totalAmount);
    }
    await user.save();
    return res.redirect(previousPath);
})

exports.getCart = catchAsync(async (req,res)=>{
    const user = await User.findById(req.user._id).populate('cart.product');
    const cart = user.cart;
    const totalCartValue = user.totalCartValue;
    console.log(user.cart);
    return res.render('./users/cart',{
        cart,totalCartValue
    });
})

exports.removeCartItem = catchAsync (async (req,res) => {
    const cartItemId = req.body.id
    const user = await User.findById(req.user._id);
    const cartItemIndex = user.cart.findIndex(item => item._id.equals(cartItemId));
    console.log(cartItemIndex);
    if (cartItemIndex !== -1) {
      user.totalCartValue = user.totalCartValue - user.cart[cartItemIndex].totalAmount
      user.cart.splice(cartItemIndex, 1);
      await user.save();
    }
    res.redirect('/cart');
})

exports.updateCartQuantity = catchAsync( async(req,res)=>{
    const product = req.params.id;
    const userId = req.user._id 
    const updateQuantity = req.body.quantity
    
    const user = await User.findById(userId).populate('cart.product');
    cartItemIndex = user.cart.findIndex(item => item.product.equals(product));
    if(cartItemIndex !=-1){
        user.cart[cartItemIndex].quantity = updateQuantity;
        user.cart[cartItemIndex].totalAmount = updateQuantity * user.cart[cartItemIndex].product.price;
        let totalCartValue = 0;
        user.cart.forEach(item => {
            totalCartValue +=  item.totalAmount;
        })
        user.totalCartValue = totalCartValue;
        user.save();
    }
    res.redirect(req.previousUrl);
})
