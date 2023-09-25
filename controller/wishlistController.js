const catchAsync = require('../utils/catchAsync');
const User = require('../model/userModel');


exports.addToWishlist = catchAsync(async (req,res) => {
    const product = req.body.productId
    const user = await User.findOne({_id: req.user._id});
    console.log(user.wishlist[0])
    const existingItem = user.wishlist.findIndex((item)=> item.product.equals(product));
    if(existingItem == -1){
        user.wishlist.push({product});
        await user.save();
        return res.status(200).json({
            status:'success',
            wishlist : req.user.wishlist,
            message:'Added to wishlist'
        })
    }
    user.wishlist.splice(existingItem,1);
    await user.save();
    res.status(200).json({
        status: 'success',
        wishlist : req.user.wishlist,
        message:'removed from Wishlist'
    });
})

exports.removeFromWishlist = catchAsync(async (req,res)=>{
    const product = req.body.productId
    console.log(product)
    const user = await User.find({_id:req.user._id});
    // console.log(user);
    const deleteItem  = await User.updateOne({_id:req.user._id},{$pull:{wishlist:{product:req.body.productId}}});
    console.log(deleteItem);
    req.flash('error','Item removed from the wishlist');
    res.redirect(req.previousUrl);
})

exports.getWhishList = catchAsync(async (req,res) => {
    const user = await User.findOne({_id:req.user._id}).populate('wishlist.product');
    const wishlist = user.wishlist;
    // console.log(user.wishlist[0])
    // console.log(wishlist);
    res.render('./users/wishlist',{wishlist});
})

