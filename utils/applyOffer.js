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
        const discountAmount = Math.floor((offerAppliedProduct.price * offer.discountPercentage)/100);
        offerAppliedProduct.discountPrice = offerAppliedProduct.price - discountAmount
        offerAppliedProduct.originalPrice = offerAppliedProduct.price
        offerAppliedProduct.price = offerAppliedProduct.discountPrice
        offerAppliedProduct.offer = offer._id
        offerAppliedProduct.save();
        offer.applicableProducts.push(offerAppliedProduct._id);
    }
    return
})

exports.applyCategoryOffers = catchAsync(async (offerId,categoryId)=>{
    const [offer, offerAppliedCategory] = await Promise.all([
        Offer.findById({_id:offerId}),
        Category.findById({_id:categoryId}).populate('products')
    ])
    if(offer&&offerAppliedCategory){
        offerAppliedCategory.products.forEach(async (product)=>{
            const discountAmount = Math.floor((product.price * offer.discountPercentage)/100);
            product.discountPrice = product.price - discountAmount
            product.originalPrice = product.price
            product.price = product.discountPrice
            product.offer = offer._id
            await product.save();
            offer.applicableProducts.push(product._id);
            await offer.save();
        })
    }
})

exports.scheduleOfferExpirations = async () => {
    const now = new Date();
    const expiredOffers = await Offer.find({ endDate: { $lt: now } });
    for (const offer of expiredOffers) {
      const productsToUpdate = await Product.find({ offer: offer._id });
      for (const product of productsToUpdate) {
        product.discountPrice = undefined;
        product.price = product.originalPrice;
        product.originalPrice = undefined;
        product.offer = undefined;
        await product.save();
      }
      await Offer.findByIdAndRemove(offer._id);
    }
};

exports.scheduleOfferStart = async () => {
    const now = new Date();
    const startedOffers = await Offer.find({ startDate: { $lt: now } });
    for (const offer of startedOffers) {
      const productsToUpdate = await Product.find({ offer: offer._id });
      for (const product of productsToUpdate) {
        const discountAmount = Math.floor((product.price * offer.discountPercentage)/100);
        product.discountPrice = product.price - discountAmount
        product.originalPrice = product.price
        product.price = product.discountPrice
        product.offer = offer._id
        await product.save();
        console.log('done');
      }
    }
};