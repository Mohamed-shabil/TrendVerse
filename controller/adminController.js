const catchAsync = require('../utils/catchAsync');
const Admin = require('../model/adminModel');
const Product = require('../model/productModel');
const Category = require('../model/categoryModel');
const User = require('../model/userModel')
const Order = require('../model/orderModel')
const Offer = require('../model/offerModel')
const bcrypt = require('bcrypt');
const token = require('../utils/token');
const slugify = require('slugify')
const json2csv = require('json2csv');
const applyOffers = require('../utils/applyOffer');
const fs = require('fs');
const { log } = require('console');
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


exports.getDashboard = catchAsync(async(req,res) =>{
    const orders = await Order.find().populate('products');
    const totalUsers = await User.find().countDocuments();
    const monthSales = await Order.aggregate([
        {
            $match:{
                status:{$ne:'Cancel'}
            }
        },
        {

            $group: {
                _id: {
                  year: { $year: '$orderDate' },
                  month: { $month: '$orderDate' }
                },
                totalSales: { $sum: '$totalPrice' }
            }
        },
        {
            $sort: {
              '_id.year': 1,
              '_id.month': 1
            }
        }
    ])
    const topSellingProducts = await Order.aggregate([
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
            $limit: 5 
        }
    ])

    const topSellingCategory = await Order.aggregate([
        {
            $unwind: '$products'
          },
          {
            $lookup: {
              from: 'products', 
              localField: 'products.product',
              foreignField: '_id',
              as: 'productInfo'
            }
          },
          {
            $unwind: '$productInfo'
          },
          {
            $group: {
              _id: '$productInfo.category',
              totalQuantitySold: { $sum: '$products.quantity' }
            }
          },
          {
            $lookup: {
              from: 'categories', 
              localField: '_id',
              foreignField: 'name',
              as: 'category'
            }
          },
          {
            $sort: {
              totalQuantitySold: -1 
            }
          },
    ])

    const cancelOrders = await Order.aggregate([
        {
            $match: {
              status: 'Cancel' 
            }
          },
          {
            $group: {
              _id: null,
              totalCancelledOrders: { $sum: 1 } 
            }
          },
          {
            $project: {
              _id: 0 
            }
        }
    ])
    
    const paymentStatics = await Order.aggregate([
        {
            $group: {
              _id: '$paymentMethod',
              totalAmount: { $sum: '$totalPrice' }
            }
          }
    ])

    const totalRevenue = await Order.aggregate([
        {
            $group: {
              _id: null,
              totalRevenue: { $sum: '$totalPrice' }
            }
          }
    ])

    const yearlyChart = await Order.aggregate([
        {
            $match: {
              status: 'Delivered', 
            }
          },
          {
            $group: {
              _id: {
                year: { $year: '$orderDate' },
                month: { $month: '$orderDate' }
              },
              totalSales: { $sum: '$totalPrice' }
            }
          },
          {
            $sort: {
              '_id.year': 1,
              '_id.month': 1
            }
          },
          {

            $project:{
                _id:0
            }
          }
    ])
    const yearlyData =yearlyChart.map((item)=>{ return item.totalSales});

    const blockedUser = await User.find({blocked:true}).countDocuments();
    
    const today = new Date().toISOString().split('T')[0];
    const todaysRevenue = await Order.aggregate([
        {
            $match: {
                orderDate: {
                    $gte: new Date(today), 
                    $lt: new Date(new Date(today).setDate(new Date(today).getDate() + 1)) 
                }
            }
        },
        {
            $group: {
                _id: null,
                todaysSales: { $sum: '$totalPrice' }
            }
        }
    ])
    const totalOrders = await Order.aggregate([
        {
            $match: {
                status: { $ne: 'Cancel' }
            }
        },
        {
            $group: {
                _id: null,
                totalOrders: { $sum: 1 }
            }
        }
    ])
    
    const pendingOrders = await Order.aggregate([
        {
            $match: {
              status: 'Pending'
            }
        },
        {
            $lookup: {
              from: 'products', 
              localField: 'products.product',
              foreignField: '_id',
              as: 'productsInfo'
            }
        }
    ])
    console.log(paymentStatics);
    res.render('./admin/dashboard',{
        monthSales,
        topSellingProducts,
        topSellingCategory,
        cancelOrders,
        paymentStatics,
        totalRevenue,
        todaysRevenue,
        totalOrders,
        yearlyData,
        pendingOrders,
        totalUsers,
        blockedUser,
    });
})

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
    const [categories, offers] = await Promise.all([
        Category.find(),
        Offer.find({type:'product'})
    ])
    res.render('./admin/addProducts',{
        categories,offers
    });
})

exports.addProducts = catchAsync(async(req,res) =>{
    const {name,description,price,stock,images,category,offer} = req.body;
    const product = await Product.create({
        name,
        description,
        price,
        stock,
        images,
        category,
        offer
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
    const [product , categories , offers ] = await Promise.all([
        Product.findOne({_id:req.params.id}),
        Category.find(),
        Offer.find(),
    ])
    res.render('./admin/editProduct',{categories,product,offers});
})

exports.editProduct = catchAsync(async(req,res)=>{
    const data = {
        name : req.body.name,
        description : req.body.description,
        category : req.body.category,
        price : req.body.price,
        stock : req.body.stock,
        visibility:true
    }
    if(req.body.offer.length){
        data.offer = req.body.offer
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

    const deletedProduct = await Product.findOneAndDelete({_id:req.params.id},)
    if(!deletedProduct){
        req.flash('error','something went wrong')
        return res.redirect('/admin/products');
    }
    const category = await Category.findOne({name:deletedProduct.name})
    const isExist = category.products.findIndex((item)=> item.equals(deletedProduct._id));
    if(isExist!=-1){
        category.products.splice(isExist,1);
        await category.save()
    }
})

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
    res.redirect("/admin/category");
})

exports.getCategory = catchAsync(async(req,res)=>{
    const category = await Category.find();
    res.render('./admin/category',{category}); 
})
exports.getEditCategory = catchAsync(async(req,res)=>{
    const category = await Category.findOne({_id: req.params.id});
    const offers = await Offer.find();
    res.render('./admin/editCategory',{category,offers});
})

exports.editCategory = catchAsync(async(req,res)=>{
    const name= req.body.name.toLowerCase();
    console.log(name);
    const photo= req.body.photo
    await Category.updateOne({_id:req.params.id},{name,image:photo});
    if(req.body.offer){
        applyOffers.applyCategoryOffers(req.body.offer,req.params.id);
    }
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


exports.getSalesReport = catchAsync(async(req,res)=>{
    const to = req.query.to
    const from = req.query.from
    const status = req.query.status
    const dateRangeFilter = {};
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const currentDate = new Date();

    if(fromDate > toDate && fromDate > currentDate ) {
        console.log('error')
        req.flash('error','invalid Dates');
        return res.redirect('/admin/salesReport');
    }
    

    if (from) {
      dateRangeFilter.orderDate = {
        $gte: new Date(`${from}T00:00:00.000Z`), 
      };
    }
    if (to) {
      dateRangeFilter.orderDate = {
        ...dateRangeFilter.orderDate,
        $lte: new Date(`${to}T23:59:59.999Z`),
      };
    }
    
    let pipeline = [
        {
            $unwind:"$products"
        },
        {
            $lookup: {
                from: "products",
                localField: "products.product",
                foreignField: "_id",
                as: "productsInfo"
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"customer",
                foreignField:"_id",
                as:"customer"
            }
        }
    ]
    
    if (Object.keys(dateRangeFilter).length > 0) {
        pipeline.push({
            $match: dateRangeFilter,
        });
    }
    let report;
    if(to){
        report = await Order.aggregate(pipeline);
    }
    // console.log(report[0].productInfo.name);
    res.render('./admin/salesReport',{report,to,from});
})

exports.downloadSalesReport = catchAsync(async(req,res)=>{
    const data = req.body
    let dataLength =0 
    let transformedData = [];

    if(Array.isArray(data)){
        dataLength = data.orderId.length
        for(let i=0; i<dataLength; i++){
            transformedData.push({
                orderDate: data.orderDate[i],
                orderId: data.orderId[i],
                userEmail:data.userEmail[i],
                products:data.product[i],
                quantity:data.quantity[i],
                paymentMethod:data.paymentMethod[i],
                amount:data.amount[i]
            })
        }
    }else{
        transformedData = data
    }

    console.log(dataLength);
    const fields = ['orderDate',"orderId","userEmail","products","quantity","paymentMethod",'amount']
    const csv = json2csv.parse(transformedData, { fields });
    res.attachment('salesReport.csv');
    res.status(200).send(csv);
})

exports.getStockAlert = catchAsync(async(req,res)=>{
    const products = await Product.find({stock:{$lte:5}});
    res.render('./admin/stockAlert',{products})
})

exports.updateVisibility = catchAsync(async (req,res)=>{
    const visibility = /^true$/i.test(req.body.visibility);
    await Product.updateOne({_id:req.params.id},{visibility:visibility});
    res.redirect(req.previousUrl)
})