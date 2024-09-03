const express = require('express');
const userRoute = express.Router();
const {userVerifyToken} = require('../helpers/userVerifyToken');

const {
     signupUser,
     loginUser,
     getUserProfile,
     verifyOTP
} = require("../controller/user.controller");

// REGISTER USER
userRoute.post('/signup' , signupUser);

// LOGIN USER
userRoute.post('/login' , loginUser );

// GET USER PROFILE
userRoute.get('/profile' , userVerifyToken , getUserProfile)

// VERIFY OTP
userRoute.post('/verify-otp' ,userVerifyToken, verifyOTP)

module.exports = userRoute;
