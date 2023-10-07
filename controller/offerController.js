const catchAsync = require('../utils/catchAsync');
const Product = require('../model/productModel')
const Category = require('../model/categoryModel');
const Offer = require('../model/offerModel');
const { updateOne } = require('../model/adminModel');

exports.getOffers = catchAsync(async (req,res)=>{
    const offers = await Offer.find();
    console.log(offers)
    res.render('./admin/offer/offers',{offers})
})

exports.getAddOffers = (req,res)=>{
    res.render('./admin/offer/addOffer');
}

exports.createOffer = catchAsync(async(req,res)=>{
    const { title,description,discountPercentage,startDate,endDate,type} = req.body
    console.log('hello,,,,,,,,,'+type)
    if(new Date(startDate) >= new Date(endDate)){
        req.flash('error','Invalid Dates')
        console.log('dateErrro')
        return res.redirect('/offers/addOffer')
    }
    const newOffer = await Offer.create({
        title,
        description,
        startDate,
        endDate,
        type,
        discountPercentage
    })
    console.log(newOffer)
    res.redirect('/admin/offers');
})

exports.applyOfferToProduct = catchAsync(async(req,res)=>{
    const {product , offerId} = req.body
    const [offer,offerAppliedProduct] = await Promise.all([
        Offer.findById({_id:offerId}),
        Product.findById({_id:product}),
    ])
    if(offer && offerAppliedProduct){
        const discountAmount = (offerAppliedProduct.price * office.discountPercentage)/100;
        offerAppliedProduct.discountPrice = discountAmount
        offerAppliedProduct.price = discountAmount;
        offerAppliedProduct.save();
        offer.applicableProducts.push(offerAppliedProduct._id);
    }
    req.flash('success','Offer applied ')
    res.render('/offers');
});

exports.deleteOffer = catchAsync(async (req,res)=>{
    const offerId = req.params.id
    const offer = await Offer.deleteOne({_id:offerId});
    if(!offer){
        req.flash('error','something went wrong')
        return res.redirect('/admin/offers');
    }
    req.flash('success','successfully deleted')
    res.redirect('/admin/offers');
})

exports.getEditOffer = catchAsync(async(req,res)=>{
    const offerId = req.params.id
    console.log(offerId);
    const offer = await Offer.findById({_id:offerId}).sort({createdAt:1});
    console.log(offer)
    res.render('./admin/offer/editOffer',{offer});
})

exports.editOffer = catchAsync( async (req,res)=>{
    const offerId = req.params.Id
    const data ={
        startDate : req.body.startDate,
        endDate:req.body.endDate,
        title:req.body.title,
        description : req.body.description,
        type:req.body.type,
        discountPercentage:req.body.discountPercentage
    }
    console.log(data)
    await Offer.updateOne({_id:offerId},data);
    req.flash('success','Offer Updated');
    res.redirect('/admin/offers');
})