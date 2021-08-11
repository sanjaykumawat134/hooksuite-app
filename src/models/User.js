const moongoose = require("mongoose");
const validator = require("validator");

const userSchema = new moongoose.Schema(
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
      unique: true,
      trim: true,
    },
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
const User = moongoose.model("User", userSchema);
module.exports = User;
