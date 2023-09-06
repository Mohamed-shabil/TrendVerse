const multer = require('multer');
const sharp = require('sharp');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const Admin = require('../model/adminModel');
const User = require('../model/userModel');
const {promisify}  = require('util');

const multerStorage = multer.memoryStorage();

const multerFilter = (req,file,cb)=>{
  if(file.mimetype.startsWith('image')){
    cb(null, true);
  }else{
    cb(err,false)
  }
}

const upload = multer({
  storage :multerStorage,
  fileFilter:multerFilter,
}); 

exports.uploadProductImages = upload.fields([
  {name:'images',maxCount:4},
])


exports.resizeProductImages = catchAsync(async(req, res, next)=>{
    console.log(req.files);
    if(!req.files.images) return next()

      req.body.images = [];
      await Promise.all( 

        req.files.images.map( async ( file, i ) =>{
        const filename = `-${Date.now()}test-${i+1}.jpeg`;
       
        await sharp(file.buffer)
          .resize(640,640)
          .toFormat('jpeg')
          .jpeg( { quality:90 } )
          .toFile(`public/products/${filename}`);

          req.body.images.push(filename); 
      })
    );
    next(); 
})

exports.uploadCategoryImage = upload.single('photo');

exports.resizeCategoryImage = catchAsync(async(req, res, next)=>{

  if(!req.file) return next();
  req.file.originalname = `category-${Date.now()}.png`;
  
  req.body.profile = req.file.originalname
 await sharp(req.file.buffer)
  .resize(500,500)
  .toFormat('png')
  .png({quality:90}).toFile(`public/category/${req.file.originalname}`);
  next();
})

exports.uploadProfileImage = upload.single('profile');

exports.resizeProfileImage = catchAsync(async (req,res,next) => {
  if(!req.file) return next();
  req.file.originalname = `userProfile-${Date.now()}.png`;
  console.log('Working me...')
  req.body.profile = req.file.originalname
  await sharp(req.file.buffer)
  .resize(300,300)
  .toFormat('jpeg')
  .png({quality:90}).toFile(`public/profile/${req.file.originalname}`);
  next();
})



exports.isAdminLoggedIn = async(req,res,next)=>{
  if(req.cookies.jwt){
    try{
      // the second parenthesis is to initialise the jwt.verify method
      const decoded = await promisify(jwt.verify)(req.cookies.jwt,process.env.JWTSECRET);
      const admin = await Admin.findById({_id:decoded.id});
      if(admin){
        return next();
      }else{
        res.redirect('/admin/login')
      }
    }catch(err){
      res.redirect('/admin/login')
    }
  }else{
    req.flash('error','Please Log in to Continue')
    return res.redirect('/admin/login')
  }
}

exports.checkAdmin = async(req,res,next)=>{
  if(req.cookies.jwt){
      const decoded = await promisify(jwt.verify)(req.cookies.jwt,process.env.JWTSECRET);
      const admin = await Admin.findById({_id:decoded.id});
      if(admin){
        return res.redirect('/admin')
      }
  }
  next();
}

exports.authChecker = async(req,res,next)=>{
  let token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if(!token){
    return next();
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWTSECRET);
  const currentUser = await User.findById(decoded.id);
  if(!currentUser){
    return next();
  }
  req.user = currentUser;
  res.locals.user = req.user
  return next();
}

exports.isLoggedin = async (req,res,next)=>{
  if(!req.user){
    req.flash('error','Please login to continue');
    return res.redirect('/login');
  }
  next();
}

exports.previousRouteTracker =catchAsync(async (req,res,next)=>{
  req.previousUrl = req.header('Referer') || '/';
  next();
})
