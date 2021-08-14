const User = require("../models/User");

const auth = async function (req, res, next) {
  try {
    console.log("middleware called");
    const token = req.header("Authorization").replace("Bearer ", "");
    let str = token.replace(/"/g, "");
    // console.log(str);
    const users = await User.find({ "tokens.token": str });
    // console.log(token);
    const user = users[0];
    console.log(user);
    if (!user) {
      throw new Error("user not found !");
    }
    req.user = user; // add user to request
    req.access_token = str; // add token to request
    next();
  } catch (error) {
    res.status(404).send({ error: "please authenticate!" });
  }
};

module.exports = auth;
