const jwt = require('jsonwebtoken');

const generateToken = (id) =>{
    return jwt.sign({id},process.env.JWTSECRET,{
        expiresIn:process.env.JWTEXPIRESIN,
    });
}

exports.createSendToken = (user,res)=>{
    const token = generateToken(user._id);
    const cookieOptions = {
        expires: new Date(
          Date.now() + process.env.JWTCOOKIEEXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
      };
    res.cookie("jwt",token,cookieOptions);
}