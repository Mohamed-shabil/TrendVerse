const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = express();
const path = require('path');
const morgan = require('morgan');
const session = require('express-session');
const flash = require('connect-flash');
const userRoute = require('./routes/userRoute');

dotenv.config({path:'./config.env'});
const db = process.env.DATABASE

mongoose.connect(db,{
    useNewUrlParser:true,
    useUnifiedTopology: true
  }).then(()=>{
    console.log('Db Connected Successfully')
})


app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));


app.use(session({
  secret:process.env.FLASHSECRET,
  saveUninitialized: true,
  resave: true
}));

app.use(flash());
app.use(function(req, res, next){
  res.locals.successMessage = req.flash('success');
  res.locals.errorMessage = req.flash('error');
  next();
});
app.use(express.static(path.join(__dirname, 'public')));
app.use(morgan('dev'));

app.use(express.urlencoded({extended:true}))
const port = process.env.PORT || 3000;


app.use('/',userRoute);

app.listen(port,()=>{
    console.log('listening on port')
})