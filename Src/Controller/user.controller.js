const UserServices = require("../service/user.service");
const userService = new UserServices();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { mailMessage } = require("../helpers/mail");
const { StatusCodes } = require("http-status-codes");
const { MSG } = require("../helpers/messages");

// REGISTER USER
exports.signupUser = async (req, res) => {
  try {
    let user = await userService.getUser({ email: req.body.email });
    // console.log(user);
    if (user) {
      res.json({
        status: StatusCodes.BAD_REQUEST,
        error: true,
        message: MSG.ALREADY_REGISTERED,
      });
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
    let token = jwt.sign({ userId: user._id }, process.env.KEY, {
      expiresIn: "5min",
    });
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

    res.json({
      status: StatusCodes.CREATED,
      error: false,
      message: MSG.SUCCESSFUL_REGISTERED,
      result: { user, token },
    });
  } catch (error) {
    console.log(error);
    res.json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      error: true,
      message: MSG.INTERNAL_ERROR`${console.error()}`,
    });
  }
};

// LOGIN USER
exports.loginUser = async (req, res) => {
  try {
    let user = await userService.getUser({ email: req.body.email });
    // console.log(user);
    if (!user) {
      res.json({
        status: StatusCodes.NOT_FOUND,
        error: true,
        message: MSG.EMAIL_NOT_FOUND,
      });
    }
    let checkpassword = await bcrypt.compare(req.body.password, user.password);
    // console.log(checkpasssword);
    if (!checkpassword) {
      res.json({
        status: StatusCodes.NOT_FOUND,
        error: true,
        message: MSG.PASSWORD_NOT_MATCH,
      });
    }
    let token = jwt.sign({ userId: user._id }, process.env.KEY);
    // // console.log(token);
    res.json({
      status: StatusCodes.CREATED,
      error: false,
      message: MSG.LOGIN_SUCCESSFULLY,
      result: { user, token },
    });
  } catch (error) {
    console.log(error);
    res.json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      error: true,
      message: MSG.INTERNAL_ERROR`${console.error()}`,
    });
  }
};

// GET USER PROFILE
exports.getUserProfile = async (req, res) => {
  try {
    let user = await userService.getSpecificUser(req.query.userId);
    // console.log(user);
    if (!user) {
      res.json({
        status: StatusCodes.NOT_FOUND,
        error: true,
        message: MSG.PROFILE_NOT_FOUND,
      });
    }
    res.json({
      status: StatusCodes.OK,
      error: false,
      message: MSG.PROFILE_INFORMATION,
      result: { user },
    });
  } catch (error) {
    console.log(error);
    res.json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      error: true,
      message: MSG.INTERNAL_ERROR`${console.error()}`,
    });
  }
};

// VERIFY OTP
exports.verifyOTP = async (req, res) => {
  try {
    console.log(req.body);

    let { otp } = req.body;
    if (req.user.otp !== otp) {
      return res.json({
        status: StatusCodes.BAD_REQUEST,
        error: true,
        message: MSG.OTP_NOT_MATCH,
      });
    }
    res.json({
      status: StatusCodes.OK,
      error: false,
      message: MSG.VERIFIED_SUCCESSFULLY,
    });
  } catch (error) {
    res.json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      error: true,
      message: MSG.INTERNAL_ERROR`${console.error()}`,
    });
  }
};
