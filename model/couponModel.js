const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code:{
        type:String,
        unique:true,
        required:true,
    },
    discountType:{
        type:String,
        enums:['percentage','fixed'],
        required:true,
    },
    discount:Number,
    minimumSpend : Number,
    expirationDate: Date
})

const Coupon = mongoose.model('Coupon',couponSchema);

module.exports = Coupon;