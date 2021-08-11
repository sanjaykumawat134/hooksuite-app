const express = require("express");

const User = require("../models/User");
const { getAccessToken, getLinkedinProfile } = require("../utils/linkedInApi");
const linkedInRoutes = new express.Router();
linkedInRoutes.get("/", async (req, res) => {
  try {
    res.status(200).send({ msg: "Hello world" });
  } catch (error) {
    res.status(400).send(error);
  }
});

// linkedInRoutes.route("/auth").get(async (req, res) => {
//   try {
//     return res.status(200).send({ url: getAuthorizationUrl() });
//   } catch (error) {
//     res.status(400).send(error);
//   }
// });

// linkedInRoutes.get("/callback", async (req, res) => {
//   try {
//     const token = await getAccessToken(req);
//     req.access_token = token;
//     data = await getLinkedinProfile(req);
//     res.send(data);
//   } catch (error) {
//     res.status(400).send(error);
//   }
// });

// linkedInRoutes.get("/profile", async (req, res) => {
//   try {
//     const token = await getAccessToken(req);
//     req.access_token = token;
//     const data = await getLinkedinProfile(req);
//     res.send(data);
//   } catch (error) {
//     res.status(400).send(error);
//   }
// });

linkedInRoutes.post("/auth", async (req, res) => {
  try {
    const code = req.body.code;
    if (!code && code === "") {
      return res.status(404).send("Not authorized !");
    }
    const token = await getAccessToken(code);
    req.access_token = token;
    req.session.authorized = true;
    const user = await getLinkedinProfile(req);
    const userExists = await User.findUsersByAuthProvider(
      user.email,
      "linkedIn"
    );
    if (userExists == null) {
      //create new user
      const newUser = new User({
        ...user,
        authProviders: "linkedIn",
      });
      const userObj = await newUser.save();
      userObj.tokens = userObj.tokens.concat({ token });
      const userObjWithToken = await userObj.save();
      console.log(userObjWithToken);
      return res.send({ userObjWithToken, msg: "sucessfully login" });
    }
    //update existing one
    const updatedUser = await User.findByIdAndUpdate(userExists._id, {
      ...userExists,
      authProviders: "linkedIn",
    });
    updatedUser.tokens = updatedUser.tokens.concat({ token });
    updatedUserWithToken = await updatedUser.save();
    console.log(updatedUser);
    return res.send({ updatedUser, msg: "sucessfully login" });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error });
  }
});
linkedInRoutes.get("/profile/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    if (!_id && _id === undefined) {
      return res.status(400).send({ error: "please enter valid id" });
    }
    const user = await User.findById({ _id });
    if (!user && user === null) {
      throw new Error();
    }
    res.status(200).send(user);
  } catch (error) {
    res.status(404).send({
      error: "no user found with this id",
    });
  }
});
// share to linked in body required( accesstoken , userid , content )
linkedInRoutes.post("/shares", async (req, res) => {
  try {
   
  } catch (error) {
    res.status(400).send(error);
  }
});
module.exports = linkedInRoutes;
