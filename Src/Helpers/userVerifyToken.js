const User = require("../model/user.model");
const jwt = require("jsonwebtoken");
const { MSG } = require("./messages");
const { StatusCodes } = require("http-status-codes");

// USER VERIFY TOKEN
exports.userVerifyToken = async (req, res, next) => {
  try {
    const authorization = req.headers["authorization"];
    if (authorization === undefined) {
      return res.json({ message: `${console.error()}` });
    }
    let token = authorization.split(" ")[1];
    //    console.log(token);
    if (token === undefined) {
      return res.json({
        status: StatusCodes.UNAUTHORIZED,
        error: true,
        message: MSG.INVALID_AUTHORIZATION`${console.error()}`,
      });
    } else {
      let { userId } = jwt.verify(token, "User");
      // console.log(userId);
      let user = await User.findById(userId);
      // console.log(user);
      if (user) {
        req.user = user;
        next();
      } else {
        return res.json({
          status: StatusCodes.UNAUTHORIZED,
          error: true,
          message: MSG.INVALID_USERTOKEN`${console.error()}`,
        });
      }
    }
  } catch (error) {
    console.log(error);
    res.json(MSG.INTERNAL_ERROR, `${console.error()}`);
  }
};
