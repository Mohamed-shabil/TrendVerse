const nodemailer = require('nodemailer');

const sendMail = async (req,res)=>{
    const transporter = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
            user: process.env.EMAIL, 
            pass: process.env.PASS 
        }
    });
    // For testing
    const mailOptions = {
        from: process.env.EMAIL,
        to: process.env.USERMAIL, 
        subject: 'Test Email', 
        text: 'This is a test email sent using Nodemailer.' 
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error:', error);
        } else {
            console.log('Email sent:', info.response);
            res.send("success")
        }
    });

}

module.exports = sendMail