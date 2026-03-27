const express = require("express");
const router = express.Router();
const statisticsControllers = require("../controllers/statisticsControllers.js");

// GET /statistics/:userId
router.get("/:userId", statisticsControllers.getStatisticsByUser);

module.exports = router;