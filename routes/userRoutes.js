const express = require("express");
const bcrypt = require("bcrypt");
const { UserModel } = require("../model/userModel");
const jwt = require("jsonwebtoken");
const { generateUniqueToken, sendResetPasswordEmail } = require("../utils/utils");
const userRouter = express.Router();

require("dotenv").config();

//Signup
userRouter.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    let existingUser = await UserModel.findOne({ email: email });
    if (existingUser) {
      res.status(200).send({ message: "User Already Registered !!" });
    } else {
      bcrypt.hash(password, +process.env.saltRounds, async (err, hash) => {
        if (err) {
          res.status(400).send({ error: err });
        }
        const user = new UserModel({ username, email, password: hash });
        await user.save();
        res.status(200).send({ message: "User Registered successfully" });
      });
    }
  } catch (error) {
    res.status(400).send({ error: error });
  }
});

//check username availability
userRouter.get("/check-username/:username", async (req, res) => {
  const { username } = req.params;

  try {
    const existingUser = await UserModel.findOne({ username });

    if (existingUser) {
      res.json({ available: false, message: "Username not available" });
    } else {
      res.json({ available: true, message: "Username available" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//Login
userRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await UserModel.findOne({ email: email });
    if (!user) {
      res.status(200).send({ message: "User Not Found !!" });
    } else {
      bcrypt.compare(password, user?.password, (error, result) => {
        if (!result) {
          res.status(200).send({ message: "Wrong Password !!" });
        } else {
          const accessToken = jwt.sign(
            { userID: user?._id, username: user?.username }, process.env.JWT_SECRET);
          
          res.status(200).send({
            message: "Logged-in successfully",
            accessToken: accessToken,
            username: user?.username
          });
        }
      });
    }
  } catch (error) {
    res.status(400).send({ error: error });
  }
});

//forgot password
userRouter.post("/forgot-password", async (req, res)=>{
  const { email } = req.body;

  try {
    const user = await UserModel.findOne({email});

    if(!user){
      return res.status(200).send({message: "We cannot find your email", action: false})
    }

    const resetToken = jwt.sign({email: user.email}, process.env.JWT_SECRET, {expiresIn:"1h"})
    user.resetToken = resetToken;

    await user.save();

    sendResetPasswordEmail(user.email, resetToken);
    res.json({ message: 'Password reset email sent successfully', action: true });
    
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
})

//reset password
userRouter.post("/reset-password", async (req, res)=>{
  const { token, newPassword } = req.body;
  try {

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    const user = await UserModel.findOne({
      email: decodedToken.email,
      resetToken: token,
    });

    if (!user) {
      return res.status(200).json({ message: 'Invalid or expired token', action: false });
    }

    // Update the user's password

    bcrypt.hash(newPassword, +process.env.saltRounds, async (err, hash) => {
      if (err) {
        res.status(400).send({ error: err });
      }
      user.password = hash;
      user.resetToken = null;

      await user.save();
      res.status(200).send({ message: 'Password reset successful', action: true });
    });
    
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
})


module.exports = {
  userRouter,
};
