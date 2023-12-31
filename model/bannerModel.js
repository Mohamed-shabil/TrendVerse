const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    name : String,
    banner: String,
    description : String,
    visibility : {
        type : Boolean,
        default : true,
    }
},{timestamps:true});

const Banner = mongoose.model('Banner', bannerSchema);

module.exports = Banner;
