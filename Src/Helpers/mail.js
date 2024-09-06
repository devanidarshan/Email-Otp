const nodemailer = require("nodemailer");
const { MSG } = require("./messages");

// EMAIL MESSAGE
exports.mailMessage = async (msg) => {
  try {
    if (!msg.subject) {
      throw new Error(MSG.EMAIL_HAVE_SUBJECT);
    }
    let transporter = nodemailer.createTransport({
      service: "gmail",
      secure: false,
      port: 587,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    let info = await transporter.sendMail(msg);
    console.log(MSG.EMAIL_SEND_SUCCESSFULLY, info.response);
  } catch (error) {
    console.log(error);
    res.json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      error: true,
      message: MSG.INTERNAL_ERROR`${console.error()}`,
    });
  }
};
