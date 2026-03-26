const express = require("express");
const Router = express.Router();
const authRoutes = require("./authRoutes.js");


Router.use("/auth", authRoutes);



module.exports = Router;
