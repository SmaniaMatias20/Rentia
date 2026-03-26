const express = require("express");
const Router = express.Router();
const authRoutes = require("./authRoutes.js");
const contractRoutes = require("./contractRoutes.js");


Router.use("/auth", authRoutes);
Router.use("/contracts", contractRoutes);



module.exports = Router;
