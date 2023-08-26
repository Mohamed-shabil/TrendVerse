const catchAsync = require('../utils/catchAsync');
const Admin = require('../model/adminModel');
const Product = require('../model/productModel');
const Category = require('../model/categoryModel');
const User = require('../model/userModel')
const bcrypt = require('bcrypt');

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
// Products
exports.getProducts = catchAsync( async (req,res) =>{
    const products = await Product.find();
    res.render('./admin/products',{products:products})
});

exports.getAddProducts = catchAsync(async (req,res) =>{
    const categories = await Category.find();
    console.log(categories);
    res.render('./admin/addProducts',{
        categories
    });
})
exports.addProducts = catchAsync(async(req,res) =>{
    const {name,description,price,stock,images,category} = req.body;
    await Product.create({
        name,
        description,
        price,
        stock,
        images,
        category
    }).then(async ()=>{
        req.flash('success','Product Added successfully')
        return res.redirect('/admin/products/addProducts');
        
    }).catch((e)=>{
        req.flash('error','Something went Wrong try again')
        return res.redirect('/admin/products/addProducts');
    })
})

exports.getEditProduct = catchAsync(async(req,res)=>{
    const product = await Product.findOne({_id:req.params.id})
    const categories = await Category.find();
    res.render('./admin/editProduct',{categories,product});
})

exports.editProduct = catchAsync(async(req,res)=>{
    const data = {
        name:req.body.name,
        description:req.body.description,
        category: req.body.category,
        price: req.body.price,
        images:req.body.images
    } 
    const product = await Product.findOneAndUpdate({_id:req.params.id},data,{new:true})
    req.flash('success','Product updated successfully')
    res.redirect('/admin/products');
})

exports.deleteProduct = catchAsync(async(req,res)=>{
    console.log('delete products works')
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
    const {name,photo} = req.body;
    console.log(name,photo)
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
    const {name,photo} = req.body;
    console.log(name,photo)
    await Category.updateOne({_id:req.params.id},{name,photo});
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
    const user = await User.findByIdAndUpdate({_id:req.params.id},{},{})
})