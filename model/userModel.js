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
    profile:{
        type:String,
        default:'user.png'
    },
    cart: [{
        product:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Product'
        },
        quantity:Number,
        totalAmount: Number
    }],
    totalCartValue:{
        type:Number,
        default:0
    },
    address:Array,
    blocked :{
        type:Boolean,
        default:false
    },
    otp:{
        type:Number,
        createdAt:{type:Date,expires:'5m',default:Date.now}
    },
    varified: {
        type:Boolean,
        default:false
    },
    blocked:{
        type:Boolean,
        default:false
    }
})


const User = mongoose.model('User',userSchema);
module.exports = User; 