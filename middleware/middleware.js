const multer = require('multer');
const sharp = require('sharp');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const Admin = require('../model/adminModel');
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
  {name:'images',maxCount:4}
])


exports.resizeProductImages = catchAsync(async(req, res, next)=>{
    console.log(req.files); 
    if(!req.files.images) return next()

      req.body.images = [];
      await Promise.all( 

        req.files.images.map( async ( file, i ) =>{
        const filename = `-${Date.now()}-${i+1}.jpeg`;
       
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
  
  req.body.photo = req.file.originalname
 await sharp(req.file.buffer)
  .resize(500,500)
  .toFormat('png')
  .png({quality:90}).toFile(`public/category/${req.file.originalname}`);
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

