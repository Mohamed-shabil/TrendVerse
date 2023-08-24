const mongoose  = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('./model/adminModel');
const dotenv = require('dotenv');
const catchAsync = require('./utils/catchAsync')
dotenv.config({path:'./config.env'});
const db = process.env.DATABASE

mongoose.connect(db,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(()=>{
    console.log('db Connected')
})

const seedAdmin = catchAsync(async ()=>{
    const admin = process.env.ADMINUSERNAME
    const password = process.env.ADMINPASSWORD

    await Admin.create({
        name : admin,
        password
    }).then(()=>{
        console.log('Admin created successfully');
        process.exit();
    }).catch(err=>{
        console.log(err)
        process.exit(1);
    })
})

seedAdmin();