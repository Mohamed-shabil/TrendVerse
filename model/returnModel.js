const mongoose = require('mongoose');

const returnSchema = new mongoose.Schema({
    order: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'Order'
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
    },
    reason:String,
    description:String,
    status:{
        type:String,
        enum:['Requested','Approved','Rejected','Completed'],
        default:'Requested'
    },
},{timestamps:true});


const Return = mongoose.model('Return',returnSchema);
module.exports = Return; 