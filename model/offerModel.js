const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    title: String,
    description: String,
    discountPercentage: Number,
    startDate: Date,
    endDate: Date,
    type:{
      type:String,
      enum:['product','category']
    },
    applicableProducts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    }],
    applicableCategories: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    }],
},{timestamps:true});

const Offer = mongoose.model('Offer', offerSchema);
module.exports = Offer;