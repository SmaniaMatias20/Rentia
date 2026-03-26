const express = require("express");
const contractControllers = require("../controllers/contractControllers.js");
const Router = express.Router();

Router.get("/all", contractControllers.getAll);
Router.post("/create", contractControllers.createContract);
Router.get("/user/:userId", contractControllers.getByUser);
Router.delete("/:id", contractControllers.deleteContract);
Router.patch("/:id/status", contractControllers.updateStatus);

module.exports = Router;