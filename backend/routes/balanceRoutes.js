const express = require("express");
const router = express.Router();
const {addFunds} = require("../controllers/balanceController")

router.post("/addfunds", addFunds)

module.exports = router;
