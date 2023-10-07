const catchAsync = require('./catchAsync');
const Category = require('../model/categoryModel')
const Product = require('../model/productModel')
const Offer = require('../model/offerModel');

exports.applyProductOffers = catchAsync( async (offerId,productId)=>{
    console.log('im Working')
    const [offer, offerAppliedProduct] = await Promise.all([
        Offer.findById({_id:offerId}),
        Product.findById({_id:productId})
    ])
    if(offer && offerAppliedProduct){
        const discountAmount = (offerAppliedProduct.price * offer.discountPercentage)/100;
        offerAppliedProduct.discountPrice = offerAppliedProduct.price - discountAmount
        offerAppliedProduct.originalPrice = offerAppliedProduct.price
        offerAppliedProduct.price = offerAppliedProduct.discountPrice
        offerAppliedProduct.offer = offer._id
        offerAppliedProduct.save();
        offer.applicableProducts.push(offerAppliedProduct._id);
    }
    return
})