const catchAsync = require('../utils/catchAsync');
const Admin = require('../model/adminModel');
const Product = require('../model/productModel');
const Category = require('../model/categoryModel');
const User = require('../model/userModel')
const bcrypt = require('bcrypt');
const token = require('../utils/token');
const slugify = require('slugify')

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
        token.createSendToken(admin,res);
        res.redirect('/admin')
    }
}) 
exports.logout = catchAsync(async (req, res, next )=>{
    res.cookie('jwt','loggedout',{
      expires : new Date(Date.now() + 10 * 10000),
      httpOnly:true
    });
    res.redirect('/');
})


exports.getDashboard = (req,res) =>{
    res.render('./admin/dashboard');
}
// Products
exports.getProducts = catchAsync( async (req,res) =>{
    const page = parseInt(req.query.page) || 1; 
    const limit = 12;
    const skip = (page - 1) * limit
    const products = await Product.find().skip(skip).limit(limit);
    const totalDocs = await Product.countDocuments();
    const totalPages= totalDocs/limit
    res.render('./admin/products',{products:products,page,totalPages})
});

exports.getAddProducts = catchAsync(async (req,res) =>{
    const categories = await Category.find()
    res.render('./admin/addProducts',{
        categories
    });
})
exports.addProducts = catchAsync(async(req,res) =>{
    const {name,description,price,stock,images,category} = req.body;
    const product = await Product.create({
        name,
        description,
        price,
        stock,
        images,
        category
    })
    if(!product){
        req.flash('error','Something went Wrong try again')
        return res.redirect('/admin/products/addProducts');
    }
    const categoryName = await Category.findOne({name:product.category})
    categoryName.products.push(product._id);
    categoryName.save();
    req.flash('success','Product Added successfully')
    return res.redirect('/admin/products');
})

exports.getEditProduct = catchAsync(async(req,res)=>{
    const product = await Product.findOne({_id:req.params.id})
    const categories = await Category.find();
    res.render('./admin/editProduct',{categories,product});
})

exports.editProduct = catchAsync(async(req,res)=>{
    console.log(req.body.name);
    const data = {
        name:req.body.name,
        description:req.body.description,
        category: req.body.category,
        price: req.body.price,
    } 
    await Product.findOneAndUpdate({_id:req.params.id},data,{new:true})
    req.flash('success','Product updated successfully')
    res.redirect('/admin/products');
})
exports.deleteProductImage = catchAsync(async (req,res)=>{
    console.log('params works')
    console.log(req.params.image);
    const deleteImage = await Product.findOneAndUpdate({_id:req.params.id},{$pull:{images:req.params.image}},{new:true});
    if(deleteImage){
        req.flash('success','Image deleted successfully')
        res.redirect(`/admin/products/editProduct/${req.params.id}`);
    }
})
exports.addProductImage = catchAsync(async (req,res)=>{
    console.log(req.body.images);
    
    const addImage = await Product.findOneAndUpdate({_id:req.params.id},{$push:{images:{$each:req.body.images}}},{new:true});
    if(addImage){
        req.flash('success','Image deleted successfully')
        res.redirect(`/admin/products/editProduct/${req.params.id}`);
    }
})

exports.deleteProduct = catchAsync(async(req,res)=>{
    await Product.deleteOne({_id:req.params.id}).then(()=>{
        req.flash('success','Product deleted successfully')
        return res.redirect('/admin/products');
    }).catch((err)=>{
        req.flash('error','something went wrong')
        return res.redirect('/admin/products');
    })
})

// Category
exports.getAddCategory = (req,res)=>{
    res.render("./admin/addCategory");
}
exports.addCategory = catchAsync(async(req,res)=>{
    const name = req.body.name.toLowerCase();
    console.log(name);
    const photo = req.body.photo;
    const isCategoryExist = await Category.findOne({name});
    if(isCategoryExist){
        req.flash('error',`Category with name ${name} already Exist !`);
        return res.redirect("/admin/category");
    }
    await Category.create({
        name:name,
        image:photo
    })
    req.flash('success','Category Added successfully')
    res.redirect("/admin/category/addCategory");
})

exports.getCategory = catchAsync(async(req,res)=>{
    const category = await Category.find();
    res.render('./admin/category',{category}); 
})
exports.getEditCategory = catchAsync(async(req,res)=>{
    const category = await Category.findOne({_id: req.params.id});
    res.render('./admin/editCategory',{category});
})

exports.editCategory = catchAsync(async(req,res)=>{
    const name= req.body.name.toLowerCase();
    console.log(name);
    const photo= req.body.photo

    await Category.updateOne({_id:req.params.id},{name,image:photo});
    req.flash('success','Category Added successfully')
    res.redirect("/admin/category");
})

exports.deleteCategory = catchAsync(async(req,res)=>{
    await Category.deleteOne({_id:req.params.id});
    req.flash('success','Category Deleted successfully')
    res.redirect("/admin/category");
})

// users

exports.getUsers = catchAsync(async(req,res)=>{
    const users = await User.find();
    res.render('./admin/users',{users});
})
exports.blockUsers = catchAsync(async(req,res)=>{
    const userStatus = /^true$/i.test(req.body.isBlocked);
    const user = await User.findByIdAndUpdate({_id:req.params.id},{$set:{blocked:userStatus}},{new:true})
    res.redirect('/admin/users');
})

// Orders

