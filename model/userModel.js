const mongoose  = require('mongoose');

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    email:{
        type:String,
        required:true
    },
    phone:{
        type:Number,
        required: true
    },
    password:{
        type:String,
        required:true
    },
    cart: Array,
    address:Array,
    blocked :{
        type:Boolean,
        default:false
    },
    otp:Number
})


const User = mongoose.model('User',userSchema);
module.exports = User; 