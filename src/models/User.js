const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    authProviderUserId: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      trim: true,
      required: true,
    },
    lastName: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.default.isEmail(value)) {
          throw new Error("email is not valid");
        }
      },
    },
    password: {
      type: String,
      minlength: 8,
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error("password cannot contain string password");
        }
      },
    },
    displayImage: {
      type: String,
    },
    about: {
      type: String,
    },
    authProviders: {
      type: String,
      trim: true,
    },
    accounts: [
      {
        account: {
          type: mongoose.Types.ObjectId,
          ref: "Account",
        },
      },
    ],
    post: [
      {
        post: {
          type: mongoose.Types.ObjectId,
          ref: "Post",
          account: {
            type: mongoose.Types.ObjectId,
            ref: "Account",
          },
        },
      },
    ],
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);
userSchema.statics.findUsersByAuthProvider = async function (
  email,
  authProviders
) {
  const user = await User.findOne({ email, authProviders });
  return user;
};
const User = mongoose.model("User", userSchema);
module.exports = User;
