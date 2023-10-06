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
    applicableCategories: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    }],
});

const Offer = mongoose.model('offer', offerSchema);

module.exports = Offer;