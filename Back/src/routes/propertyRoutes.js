const express = require("express");
const Router = express.Router();
const propertyControllers = require("../controllers/propertyControllers.js");

Router.get("/all", propertyControllers.getAll);
Router.post("/create", propertyControllers.createProperty);
Router.get("/user/:userId", propertyControllers.getByUser);
Router.get("/user/:userId/without-tenant", propertyControllers.getWithoutTenant);
Router.delete("/:id", propertyControllers.deleteProperty);
Router.put("/toggle/:id", propertyControllers.toggleProperty);
Router.get("/:id", propertyControllers.getProperty);
Router.put("/:id", propertyControllers.updateProperty);

module.exports = Router;