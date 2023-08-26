const mongoose = require('mongoose'); 

const adminSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    description:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true,
    },
    stock:{
        type:Number,
        required:true,
    },
    images:[String],
    category:String
    
})

const Product = mongoose.model('Product',adminSchema);
module.exports = Product; 