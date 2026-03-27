const express = require("express");
const Router = express.Router();
const paymentControllers = require("../controllers/paymentControllers.js");


Router.get("/", paymentControllers.getAllPayments);
Router.get("/transactions", paymentControllers.getAllTransactions);
Router.get("/transactions/:paymentId", paymentControllers.getTransactionsByPaymentId);
Router.delete("/transactions/:id", paymentControllers.deleteTransaction);

Router.get("/contract/:contractId", paymentControllers.getPaymentsByContract);

Router.post("/create", paymentControllers.createPayment);
Router.put("/:id", paymentControllers.updatePayment);

Router.post("/transactions", paymentControllers.createTransaction);

// REPORTES
Router.get("/reports/rent", paymentControllers.getMonthlyRent);
Router.get("/reports/electricity", paymentControllers.getMonthlyElectricity);
Router.get("/reports/gas", paymentControllers.getMonthlyGas);
Router.get("/reports/hoa", paymentControllers.getMonthlyHoa);
Router.get("/reports/water", paymentControllers.getMonthlyWater);
Router.get("/reports/count", paymentControllers.getMonthlyCount);


module.exports = Router;