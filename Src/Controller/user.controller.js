const UserServices = require("../service/user.service");
const userService = new UserServices();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { mailMessage } = require("../helpers/mail");

// REGISTER USER
exports.signupUser = async (req, res) => {
  try {
    let user = await userService.getUser({ email: req.body.email });
    // console.log(user);
    if (user) {
      res.status(400).json({ message: "User Already Registered..." });
    }

    // CONVERT HASH PASSWORD
    let hashpassword = await bcrypt.hash(req.body.password, 10);
    console.log(hashpassword);

    // console.log(hashpassword);
    user = await userService.addNewUser({
      ...req.body,
      password: hashpassword,
    });

    
    // GENERATE TOKEN
    let token = jwt.sign({ userId: user._id }, "User", {expiresIn: '5min'});
    // console.log(token);

    // GENERATE A 6 DIGIT OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    console.log(otp);
    user.otp = otp;
    await user.save();

    // GENERATE EMAIL CONFIRMATION
    const confirmationLink = `${req.protocol}://${req.get(
      "host"
    )}/api/confirm-email/`;

    let confirmationMail = {
      from: process.env.MAIL_USER,
      to: req.body.email,
      subject: "Confirmation Mail",
      html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Confirmation</title>
</head>

<body style="font-family: Arial, sans-serif; background-color: #f9fafb; color: #333;">
    <div style="max-width: 600px; margin: auto; padding: 20px; background-color: #ffffff; border-radius: 8px;">
        <h2 style="color: #1f2937; font-size: 24px; font-weight: bold;">Thank you for Registering...!</h2>
        <p style="color: #4b5563; font-size: 16px;">Please confirm your email by clicking the link below:</p>
        <a href="${confirmationLink}" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 4px;">Confirm your email</a>
        <h3 style="margin-top: 30px; color: #1f2937; font-size: 20px;">Your OTP : ${otp}</h3>
</body>

</html>
`,
    };

    await mailMessage(confirmationMail);

    res.status(201).json({
      user,
      token,
      message:"User Registered SuccessFully...Please check your EMAIL and OTP to confirm your account."});
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: `Internal Server Error...${console.error()}` });
  }
};

// LOGIN USER
exports.loginUser = async (req, res) => {
    try {
       let user = await userService.getUser({ email: req.body.email });
    // console.log(user);
    if (!user) {
      res.status(400).json({ message: "Email Not Found..." });
    }
    let checkpassword = await bcrypt.compare(req.body.password, user.password);
    // console.log(checkpasssword);
    if (!checkpassword) {
      res.status(400).json({ message: "Password Not Match..." });
    }
    let token = jwt.sign({ userId: user._id }, "User");
    // // console.log(token);
    res.status(201).json({ token, message: "User Login SuccessFully..." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: `Internal Server Error...${console.error()}` });
  }
};

// GET USER PROFILE
exports.getUserProfile = async (req, res) => {
  try {
    let user = await userService.getSpecificUser(req.query.userId);
    // console.log(user);
    if (!user) {
      res.status(400).json({ message: "User's Profile Not Found..." });
    }
    res.status(200).json({ user, message: "User's Profile Information..." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: `Internal Server Error...${console.error()}` });
  }
};

// VERIFY OTP
exports.verifyOTP = async (req, res) => {
  try {
    console.log(req.body);
    
    let {otp} = req.body;
    if(req.user.otp !== otp){
      return res.json({message: 'Otp is not matched...'});
    }
    res.status(200).json({ message: "User verified successfully..." });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error...", error });
  }
};
