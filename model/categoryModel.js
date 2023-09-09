const mongoose = require('mongoose'); 

const categorySchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        unique:true
    },
    image:String,
    products:[
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:'Product',
        required:true}
    ]
})

const Category = mongoose.model('Category',categorySchema);
module.exports = Category;