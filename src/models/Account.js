const mongoose = require("mongoose");
const accountSchema = new mongoose.Schema({
  userInfo: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  accountType: {
    type: String,
    required: true,
  },
  tokens: {
    token: {
      type: String,
      required: true,
    },
  },
});

const Account = mongoose.model("Account", accountSchema);

module.exports = Account;
