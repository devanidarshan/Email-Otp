const UserServices = require("../Service/user.service");
const userService = new UserServices();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { mailMessage } = require("../Helpers/mail");

// REGISTER USER
exports.signupUser = async (req, res) => {
  try {
    let user = await userService.getUser({ email: req.body.email });
    // console.log(user);
    if (user) {
      res.status(400).json({ message: "User Already Registered..." });
    }
    let hashpassword = await bcrypt.hash(req.body.password, 10);
    // console.log(hashpassword);
    user = await userService.addNewUser({
      ...req.body,
      password: hashpassword,
    });

    // Generate Email Confirmation
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
<body>
    <h2>Thank you for registering...!</h2>
    <p>Please confirm your email by clicking the link below:</p>
    <a href="${confirmationLink}">Confirm your email</a>
</body>
</html>
`,
    };

    await mailMessage(confirmationMail);
    res.status(201).json({user, message: "User Registered SuccessFully...Please check your email to confirm your account."});
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
    // console.log(checkpassword);
    if (!checkpassword) {
      res.status(400).json({ message: "Password Not Match..." });
    }
    let token = jwt.sign({ userId: user._id }, "User");
    // console.log(token);
    res.status(201).json({ token, message: "User Login SuccessFully..." });
  } catch (error) {
    console.log(error);
    res .status(500)
      .json({ message: `Internal Server Error...${console.error()}` });
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
