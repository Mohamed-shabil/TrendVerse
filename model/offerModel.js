const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    title: String,
    description: String,
    discountPercentage: Number,
    startDate: Date,
    endDate: Date,
    applicableProducts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    }],
},{timestamps:true});

const Offer = mongoose.model('Offer', offerSchema);
module.exports = Offer;