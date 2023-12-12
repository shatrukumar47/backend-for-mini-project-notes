const nodemailer = require("nodemailer")
require('dotenv').config();

const generateUniqueToken = ()=>{
    return Math.random().toString(36).slice(2,10);
}

const sendResetPasswordEmail = (email, resetToken)=>{

    const emailContent = `
    <p>You have requested to reset your password on Notes App</p>
    <p>Click the following link to reset your password:</p>
    <a href="https://notesshatru.netlify.app/reset-password/${resetToken}">Reset Password</a>
    <p>If you didn't request this, please ignore this email.</p>
  `;

  const { EMAIL_USER, EMAIL_PASSWORD } = process.env;
  console.log(EMAIL_USER, EMAIL_PASSWORD)

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD
    }
  })

  const mailOptions = {
    from: "notesapp@gmail.com",
    to: email,
    subject: "Password Reset",
    html: emailContent
  }

  transporter.sendMail(mailOptions, (error, info)=>{
    if(error){
        console.log('Error sending reset password email:',error);
    }
  })
}


module.exports = { generateUniqueToken, sendResetPasswordEmail };