const Banner = require('../model/bannerModel');
const catchAsync = require('../utils/catchAsync')

exports.getBanner = catchAsync(async(req,res)=>{
    const banners = await Banner.find();
    res.render('./admin/banner/banner',{
        banners
    });
})

exports.getAddBanner = (req,res)=>{
    res.render('./admin/banner/addBanner')
}

exports.addBanner = catchAsync(async (req,res)=>{
    const {name,description , banner} = req.body;
    const newBanner = await Banner.create({
        name,
        banner,
        description
    })
    if(!newBanner){
        req.flash('error','something went wrong try again');
        res.redirect('/admin/banner/banner');
    }
    req.flash('success',)
    res.redirect('/admin/banner');
})

exports.getEditBanner = catchAsync(async (req,res)=>{
    const bannerId = req.body.id
    const banner = await Banner.find({id: bannerId});
    res.render('./admin/banner/editBanner')
})
exports.editBanner = catchAsync(async (req,res)=>{
    const bannerId = req.params.id;
    const updatedBanner = await Banner.updateOne({_id:bannerId},req.body);
    if(!updatedBanner){
        req.flash('error','something went wrong try again');
        res.redirect('/admin/banner/banner');
    }
    req.flash('success','New Banner added ')
    res.redirect('/admin/banner');
})

exports.deleteBanner = catchAsync(async (req,res)=>{
    const bannerId = req.body;
    await Banner.deleteOne({_id:bannerId});
    res.redirect('/admin/banner');
})