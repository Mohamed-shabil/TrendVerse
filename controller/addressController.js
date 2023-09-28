const catchAsync = require('../utils/catchAsync');
const User = require('../model/userModel');
const Address = require('../model/addressModel');
const bcrypt = require('bcrypt');
const randomString = require('randomstring');
const token = require('../utils/token')


exports.getAddress = async(req,res)=>{
    const addresses = await Address.find({userId:req.user._id}).sort({_id:-1});
    res.render('./users/account/address/address',{
        addresses
    });
}

exports.getAddAddress = async(req,res)=>{
    res.render('./users/account/address/addAddress')
}


exports.AddAddress = catchAsync( async (req,res)=>{
    const address = await Address.create({
        userId: req.user._id,
        name:req.body.name,
        pincode: req.body.pincode,
        city:req.body.city,
        locality:req.body.locality,
        phone:req.user.phone,
        alternativePhoneNumber:req.body.altNo,
        landMark:req.body.landMark
    })
    const user = await User.findById({_id:address.userId})
    user.address.push(address._id);
    user.save();
    res.redirect("/account/address")
})
exports.getEditAddress = catchAsync( async (req,res)=>{
    const address = await Address.findOne({_id:req.params.id});
    res.render('./users/account/address/editAddress',{
        address
    });
})

exports.editAddress = catchAsync( async (req,res)=>{
    const updatedAddress = {
        name:req.body.name,
        pincode:req.body.pincode,
        city:req.body.city,
        locality:req.body.locality,
        alternativePhoneNumber:req.body.altNo,
        landMark : req.body.landMark
    }
    await Address.updateOne({_id:req.params.id},updatedAddress);
    res.redirect('/account/address');
})

exports.setDefaultAddress = catchAsync(async (req,res)=>{
    const setDefaultAddress = req.body.id
    console.log(setDefaultAddress)
    const user = await User.findById(req.user._id);
    console.log('from address',user)
    let currentDefaultAddress
    const deafultAddress = await Address.findOne({defaultAddress:true});
    if(!deafultAddress){
        currentDefaultAddress = await Address.findByIdAndUpdate({_id:setDefaultAddress},{defaultAddress:true},{new:true});
    }else{
        await Address.updateOne({defaultAddress:true},{defaultAddress:false});
        currentDefaultAddress = await Address.findByIdAndUpdate({_id:setDefaultAddress},{defaultAddress:true},{new:true});
    }
    user.defaultAddress = currentDefaultAddress._id;
    await user.save();
    res.redirect(req.previousUrl);
})

exports.deleteAddress = catchAsync( async (req,res)=>{
    await Address.deleteOne({_id:req.body.id});
    res.redirect('/account/address');
})