const express = require("express");
const cookieSession = require("cookie-session");
require("./db/mongoose");
const linkedInRoutes = require("./routers/linkedIn");
const { sessionName, sessionKeys } = require("../config/linkedInConfig");
const app = express();

app.use(express.json());
app.set("trust proxy", 1); // trust first proxy
app.use(
  cookieSession({
    name: sessionName,
    keys: sessionKeys,
  })
);
app.use("/linkedIn", linkedInRoutes);

module.exports = app;
