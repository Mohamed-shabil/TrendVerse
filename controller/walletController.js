const catchAsync = require('../utils/catchAsync');
const User = require('../model/userModel');

exports.getWallet = catchAsync(async(req,res)=>{
    const user = await User.findById(req.user._id)
    const wallet = user.wallet
    console.log(wallet);
    res.render('./users/account/wallet',{wallet});
})

