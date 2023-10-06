const mongoose = require('mongoose'); 
const slugify = require('slugify');

const productSchema = new mongoose.Schema({
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
    originalPrice:{
        type:Number
    },
    discountPrice:{
        type:Number
    },
    stock:{
        type:Number,
        required:true,
    },
    slug: String,
    images:[String],
    category:String,
    visibility:{
        type:Boolean,
        default:true
    }
    
},{ timestamps: true })


productSchema.pre('save',function(next){
    this.slug = slugify(this.name,{lower:true});
    next();
})


const Product = mongoose.model('Product',productSchema);
module.exports = Product; 