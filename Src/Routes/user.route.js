const express = require('express');
const userRoute = express.Router();
const {userVerifyToken} = require('../Helpers/userVerifyToken');

const {
     signupUser,
     loginUser,
     getUserProfile
} = require("../Controller/user.controller");

// REGISTER USER
userRoute.post('/signup' , signupUser);

// LOGIN USER
userRoute.post('/login' , loginUser );

// GET USER PROFILE
userRoute.get('/profile' , userVerifyToken , getUserProfile)

module.exports = userRoute;
