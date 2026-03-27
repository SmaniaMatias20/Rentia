const express = require("express");
const Router = express.Router();
const authRoutes = require("./authRoutes.js");
const contractRoutes = require("./contractRoutes.js");
const paymentRoutes = require("./paymentRoutes.js");
const propertyRoutes = require("./propertyRoutes.js");
const statisticsRoutes = require("./statisticsRoutes.js");


Router.use("/auth", authRoutes);
Router.use("/contracts", contractRoutes);
Router.use("/payments", paymentRoutes);
Router.use("/properties", propertyRoutes);
Router.use("/statistics", statisticsRoutes);



module.exports = Router;
