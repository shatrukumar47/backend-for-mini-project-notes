const express = require("express");
const bcrypt = require("bcrypt");
const { UserModel } = require("../model/userModel");
const jwt = require("jsonwebtoken");
const userRouter = express.Router();

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
            { userID: user?._id, username: user?.username }, "shatru47");
          
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

module.exports = {
  userRouter,
};
