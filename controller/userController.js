const catchAsync = require('../utils/catchAsync');
const User = require('../model/userModel');
const Products = require('../model/productModel');
const Banner = require('../model/bannerModel')
const Category = require('../model/categoryModel');
const Order = require('../model/orderModel')
const bcrypt = require('bcrypt');
const randomString = require('randomstring');
const token = require('../utils/token')
const sendMail = require('../utils/email');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const dotenv = require('dotenv');
const passport = require('passport')
const crypto = require('crypto');
const twilio = require('twilio');


dotenv.config({path:'./config.env'});
const accountSid = process.env.TWILIO_SID; 
const authToken = process.env.TWILIO_TOKEN;
const client = new twilio(accountSid, authToken); 

passport.use(
    new GoogleStrategy(
        {

            clientID: process.env.OAUTH_ID,
            clientSecret: process.env.OAUTH_SECRET,
            callbackURL: '/oauth/google/trendverse'
        },
        async (accessToken, refreshToken, profile, done) => {
            console.log(profile)
            const existingUser = await User.findOne({ email: profile.emails[0].value});

            if (existingUser) {
                return done(null, existingUser);
            }

            const newUser = await User.create({
                name: profile.displayName,
                email: profile.emails[0].value,
                profile:profile.photos[0].value,
                varified:true
            });

            done(null, newUser);
        }
    )
);


  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id).then((user) => {
      done(null, user);
    });
  });

exports.getHome = catchAsync(async(req,res)=>{
    const banners = await Banner.find();
    // const products = await Products.find({visibility:true}).limit(8).sort()
    const products = await Order.aggregate([
        {
            $unwind: '$products'
        },
        {
            $group: {
              _id: '$products.product',
              totalQuantitySold: { $sum: '$products.quantity' }
            }
        },
        {
            $lookup: {
              from: 'products', 
              localField: '_id',
              foreignField: '_id',
              as: 'productInfo'
            }
        },
        {
            $unwind: '$productInfo'
        },
        {
            $sort: {
              totalQuantitySold: -1 
            }
        },
        {
            $limit: 8
        }
    ])
    const newArrivals = await Products.find().sort({_id:-1}).limit(8);
    console.log(newArrivals)
    return res.render('./users/home',{
        products,user:req.user,banners,newArrivals
    });
})


exports.getLogin = (req,res)=>{
    console.log(res.locals.errorMessage)
    return res.render('./users/login');
}


exports.userLogin = catchAsync( async (req,res)=>{
    const {password, email} = req.body;
    console.log(password,email)
    const currentUser = await User.findOne({email})
    
    if(!currentUser){
        req.flash('error','invalid password or email')
        res.render('./users/login');
    }else{
        const isMatch = await bcrypt.compare(password,currentUser.password);

        if(!isMatch){
            req.flash('error','invalid password or email')
            return res.render('./users/login');
        }
        if(!currentUser.varified){
            req.flash('error','your email is not varified')
            return res.redirect('/varitfyOtp');
        }
        currentUser.password = undefined;
        console.log(currentUser)
        token.createSendToken(currentUser,res);
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
    if(req.body.otpMethod == 'sms'){
        client.messages.create({
            body: `Your OTP for verification is : ${otp} . Please Enter this OTP to verify your account. Do not share this OTP with anyone for security reasons. Thank you for using our service`,
            to: `+91${data.phone}`, 
            from: process.env.TWILIO_NO 
        })
        .then((message) => console.log(message.sid));
    }
    if(req.body.otpMethod == 'email'){
        const options = {
            from:process.env.EMAIL,
            to:req.body.email,
            subject: 'Trendverse varification OTP',
            html:`<center> <h2>Varify Your Email </h2> <br> <h5>OTP :${otp} </h5><br><p>This otp is only valid for 5 minutes only</p></center>`
        }
        await sendMail(options);
    }
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

exports.getUpdatePassword = (req,res)=>{
    res.render('./users/account/changePassword');
}


exports.updatePassword = catchAsync(async(req,res)=>{
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;

    const user = await User.findById(req.user._id);
    console.log(user.password)
    const isOldPasswordValid = await bcrypt.compare(oldPassword,user.password);
    if(!isOldPasswordValid){
        req.flash('error','The Password that you given is wrong! , Please try again')
        res.redirect('/acount/changePassword');
    }
    const newPasswordHash = await bcrypt.hash(newPassword,10);
    user.password = newPasswordHash ;
    await user.save();
    res.redirect('/account')
})

exports.logout = catchAsync(async (req, res, next )=>{
    res.clearCookie('jwt');
    res.redirect('/')
})

exports.getForgotPassword = catchAsync(async (req, res,)=>{
    res.render('./users/forgot');
})

exports.forgotPassword = catchAsync(async (req, res, next)=>{
    const {email} = req.body;
    console.log(email)
    const user = await User.findOne({email});
    if(!user){
        return res.status(200).json({
            status:'fail',
            message:'No user found on this email'
        });
    }
    const token = await crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000
    await user.save();
    console.log(user)
    console.log('token aftrer saving',token);
    const resetLink = process.env.RESET_LINK + token
    console.log('linkl is : ',resetLink);
    const options = {
        from:process.env.EMAIL,
        to: user.email,
        subject: 'Trendverse Passsword Reset Link',
        html:`
        <center><h1>TrendVerse</h1></center>
        You are receiving this because you (or someone else) have requested the reset of the password for your account.
        Please click on the following Button, into your browser to complete the process.
        If you did not request this, please ignore this email and your password will remain unchanged.<br>
        <a href='${resetLink}'>${resetLink}</a>
        `
    }
    await sendMail(options);
    return res.json({
        status:'success',
        message:'Password reset instructions sent to your email , Please check it out and follow the instructions'
    })
})

exports.getResetPassword = catchAsync(async (req,res)=>{
    const {token} = req.params
    console.log(token)
    const user = await User.findOne({
        resetPasswordToken : token,
        resetPasswordExpires : {$gt:Date.now()},
    })
    console.log(user)
    if(!user){
        return res.render('./users/invalidToken');
    }
    return res.render('./users/resetPassword',{token:req.params.token});
})

exports.resetPassword = catchAsync(async(req,res)=>{
    const {token} = req.params
    const {password} = req.body
    const {passwordConfirm} = req.body
    if(password!=passwordConfirm){
        req.flash('error','Passwords are not matching, try  again!');
        res.redirect('/resetPassword/'+token);
    }
    const user = await User.findOne({
        resetPasswordToken : token,
        resetPasswordExpires : {$gt:Date.now()},
    })
    console.log(user);
    if(!user){
        return res.render('./user/invalidToken');
    }
    const hashedPassword = await bcrypt.hash(password,10);
    user.password = hashedPassword
    user.resetPasswordExpires = undefined;
    user.resetPasswordToken = undefined;
    user.save();
    return res.redirect('/login');
})


exports.getProduct = catchAsync(async(req,res)=>{
    const user = req.user;
    const product = await Products.findOne({slug:req.params.slug,visibility:true});
    res.render('./users/productsDetails',{
        product,user
    });
})

exports.getProducts = catchAsync(async(req,res)=>{
    const page = parseInt(req.query.page) || 1; 
    const limit = 12;
    const skip = (page - 1) * limit
    const sort = parseInt(req.query.sort)
    const { category, minPrice, maxPrice} = req.query;
    const query = req.query.search;
    
    const filter = {visibility:true}

    const sortFilter = {}
    if(sort){
        sortFilter.price = sort
    }
    if(query){
        filter.$or = [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } }
        ]
    }
    if(category){
        filter.category = category
    }
    if(minPrice||maxPrice){
        filter.price = {}
    }
    if(minPrice){
        filter.price.$gte = minPrice
    }
    if(maxPrice){
        filter.price.$lte = maxPrice;
    }
    console.log(filter);
    const products = await Products.find(filter).skip(skip).limit(limit).sort(sortFilter);
    console.log(filter)
    if(filter){
        totalDocs = products.length
    }else{
        totalDoc = await Products.countDocuments();
        console.log(totalDoc);
    }
    const categories = await Category.find();
    const totalPages= totalDocs/limit
    res.render('./users/products',{
        products,page,totalPages,categories,query,url:req.previousUrl,filter
    });
})

exports.addToCart = catchAsync(async (req, res) => {
    const previousPath = req.previousUrl;
    console.log(previousPath);
    const quantity = parseInt(req.body.quantity) || 1;
    const product = await Products.findById(req.body.id);
    const user = await User.findById({ _id: req.user._id }).populate('cart.product');
    const totalAmount = product.price * quantity;
    let totalCartValue = 0;

    const existingCartItemIndex = user.cart.findIndex(item => item.product.equals(product._id));
    console.log('Existing', existingCartItemIndex);
    if (existingCartItemIndex !== -1) {
        user.cart[existingCartItemIndex].quantity += quantity;
        user.cart[existingCartItemIndex].totalAmount = product.price * user.cart[existingCartItemIndex].quantity;
    } else {
        user.cart.push({ product: product._id, quantity, totalAmount });
    }
    user.cart.forEach(item => {
        totalCartValue += item.totalAmount;
    });
    user.totalCartValue = totalCartValue;
    await user.save();
    req.flash('success','Added to cart')
    return res.redirect(previousPath);
});






exports.getCart = catchAsync(async (req,res)=>{
    const user = await User.findById(req.user._id).populate('cart.product');
    const cart = user.cart;
    const totalCartValue = user.totalCartValue;
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
    req.flash('error','item Removed from Cart');
    res.redirect('/cart');
})

exports.updateCartQuantity = catchAsync(async (req, res) => {
    const product = req.params.id;
    console.log(product)
    const userId = req.user._id;

    let updateQuantity;
    if (req.body.quantityIncrement) {
        updateQuantity = parseInt(req.body.quantityIncrement);
        updateQuantity++;
        if (updateQuantity <= 0) {
            updateQuantity = 1;
        }
    }
    console.log('upodated Qunatity ',updateQuantity)
    if (req.body.quantityDecrement) {
        updateQuantity = parseInt(req.body.quantityDecrement);
        updateQuantity--;
        if (updateQuantity <= 0) {
            updateQuantity = 1;
        }
    }
    
    const productItem = await Products.findOne({_id:product});
    const user = await User.findById(userId).populate('cart.product');

    if(productItem.stock >= updateQuantity){
        let productTotal = 0
        const cartItemIndex = user.cart.findIndex(item => item.product.equals(product));
        if (cartItemIndex !== -1) {
            user.cart[cartItemIndex].quantity = updateQuantity;
            user.cart[cartItemIndex].totalAmount = updateQuantity * user.cart[cartItemIndex].product.price;
            productTotal = user.cart[cartItemIndex].totalAmount;
            let totalCartValue = 0;
            user.cart.forEach(item => {
                totalCartValue += item.totalAmount;
            });
            user.totalCartValue = totalCartValue;
            await user.save();
        }
        return res.status(200).json({
            status:'success',
            data:{
                totalCartValue : user.totalCartValue,
                quantity : updateQuantity,
                productTotal
            }
        })
    }
    const data = {
        totalCartValue : user.totalCartValue,
        quantity : updateQuantity, 
    }
    if(productItem.stock == 0){
        data.reason = 'this is product is not Available now'
    }
    if(productItem.stock < updateQuantity){
        data.reason = `Only ${productItem.stock} stock is available`
    }
    console.log(data);
    return res.status(200).json({
        status:'fail',
        data
    })
});


exports.getAccount = catchAsync(async (req,res)=>{
    res.render('./users/account',{
        user:req.user
    });
})