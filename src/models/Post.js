const mongoose = require("mongoose");
// const validator = require("validator");

const postSchema = new mongoose.Schema({
  postId: {
    type: String,
    required: true,
  },
  postContent: {
    type: String,
    required: true,
  },
  postImgUrl: {
    type: String,
  },
});

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
