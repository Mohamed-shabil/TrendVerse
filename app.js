const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = express();
const path = require('path');
const morgan = require('morgan');
const session = require('express-session');
const flash = require('connect-flash');
const userRoute = require('./routes/userRoute');
const methodOverride = require('method-override');
const adminRoute = require('./routes/adminRoute');
const cookieParser = require('cookie-parser')
const nocache = require('nocache');


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

app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));
app.use(morgan('dev'));
app.use(express.urlencoded({extended:true}))

app.use(function(req, res, next){
  res.locals.successMessage = req.flash('success');
  res.locals.errorMessage = req.flash('error');
  res.locals.userData = req.flash('data');
  res.locals.user = req.user;
  next();
});
app.use(nocache());
app.use('/',userRoute);
app.use('/admin',adminRoute);

app.all('*',(req,res)=>{
  res.render('./users/404Page')
})
const port = process.env.PORT || 3000;
app.listen(port,()=>{
    console.log('listening on port')
})