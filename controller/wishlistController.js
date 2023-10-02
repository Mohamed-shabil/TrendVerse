const catchAsync = require('../utils/catchAsync');
const User = require('../model/userModel');


exports.addToWishlist = catchAsync(async (req,res) => {
    if(!req.user){
        return res.status(200).json({
            status:'false',
            message:'Please Login add Product to whishlist',
        })
    }
    const product = req.body.productId
    const user = await User.findById(req.user._id);
    console.log(user)
    console.log(user.wishlist[0])
    const existingItem = user.wishlist.findIndex((item)=> item.product.equals(product));
    console.log(existingItem);
    if(existingItem == -1){
        user.wishlist.push({product});
        await user.save();
        return res.status(200).json({
            status:'success',
            wishlist : req.user.wishlist,
            operation:'added',
            message:'Added to wishlist'
        })
    }
    user.wishlist.splice(existingItem,1);
    await user.save();
    return res.status(200).json({
        status: 'success',
        wishlist : req.user.wishlist,
        operation:'removed',
        message:'Removed from wishlist'
    });
})

exports.removeFromWishlist = catchAsync(async (req,res)=>{
    const product = req.body.productId
    console.log(product)
    const deleteItem  = await User.updateOne({_id:req.user._id},{$pull:{wishlist:{product:req.body.productId}}});
    console.log(deleteItem);
    req.flash('error','Item removed from the wishlist');
    res.redirect(req.previousUrl);
})

exports.getWhishList = catchAsync(async (req,res) => {
    const user = await User.findOne({_id:req.user._id}).populate('wishlist.product');
    const wishlist = user.wishlist;
    res.render('./users/wishlist',{wishlist});
})

