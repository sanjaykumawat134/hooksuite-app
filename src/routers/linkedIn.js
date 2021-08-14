const express = require("express");

const User = require("../models/User");
const multer = require("multer");
var path = require("path");
const auth = require("../middleware/auth");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });
const {
  getAccessToken,
  getLinkedinProfile,
  publishContent,
  simpleTextShare,
} = require("../utils/linkedInApi");
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
      await userObj.save();
      return res.send({ token, msg: "sucessfully login" });
    }
    //update existing one
    const updatedUser = await User.findByIdAndUpdate(userExists._id, {
      ...userExists,
      authProviders: "linkedIn",
    });
    updatedUser.tokens = updatedUser.tokens.concat({ token });
    await updatedUser.save();
    return res.send({ token, msg: "sucessfully login" });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error });
  }
});
linkedInRoutes.get("/profile/", auth, async (req, res) => {
  try {
    const _id = req.user._id;
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
linkedInRoutes.post(
  "/shares",
  auth,
  upload.single("file"),
  async (req, res) => {
    try {
      const text = req.body.message;
      const filePath = req.file.path;
      const access_token = req.access_token;
      const linkedInId = req.user.authProviderUserId;
      const publishResponse = await publishContent(
        access_token,
        linkedInId,
        filePath,
        text
      );
      res.send(publishResponse.data);
    } catch (error) {
      console.log(error);
      res.status(400).send(error);
    }
  }
);
linkedInRoutes.post("/simpleshare", auth, async (req, res) => {
  try {
    console.log(req.body.content);
    // console.log(req);
    const text = req.body.content;
    console.log(text);
    const access_token = req.access_token;
    const linkedInId = req.user.authProviderUserId;
    const shareResponse = await simpleTextShare(text, access_token, linkedInId);
    console.log(shareResponse);
    res.send(shareResponse.data);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});
linkedInRoutes.get("/logout", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    // console.log(index);
    // req.user.tokens.splice(index, 1);
    const user = await req.user.save();
    console.log(user);
    res.send(user);
  } catch (error) {
    console.log(error);
    res.status(400).send({ error });
  }
});
module.exports = linkedInRoutes;
