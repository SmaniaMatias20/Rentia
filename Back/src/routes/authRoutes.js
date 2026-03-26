const express = require("express");
const authControllers = require("../controllers/authControllers.js");
const Router = express.Router();

Router.post("/login", authControllers.login);
Router.post("/register", authControllers.register);
Router.post("/logout", authControllers.logout);

module.exports = Router;
