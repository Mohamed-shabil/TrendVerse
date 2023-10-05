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
    },
    password:{
        type:String,        
    },
    profile:{
        type:String,
        default:'/profile/user.png'
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
    address: [{
        address:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Address'
        }
    }],
    defaultAddress:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Address'
    },
    otp:{
        type:Number,
        createdAt:{type:Date,expires:'5m',default:Date.now},
        select:false
    },
    wallet:{
        balance:{
            type:Number,
            default:0.00
        },
        transactionHistory:[{
            amount: Number,
            operation : {
                type: String,
                enums:['credit','debit']
            },
            message:String,
            OrderId:String,
            date: Date,
            timeStamp : String
        }]
    },
    wishlist:[{
        product:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Product'
        }
    }],
    usedCoupons:[{type:String}],
    varified: {
        type:Boolean,
        default:false
    },
    blocked:{
        type:Boolean,
        default:false
    },
    resetPasswordToken: {
        type:String
    },
    resetPasswordExpires:{
        type:Date,
    }
})

const User = mongoose.model('User',userSchema);
module.exports = User; 