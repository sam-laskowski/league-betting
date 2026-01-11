const express = require("express");
const router = express.Router();
const {
  createBet,
  placeBet,
  getBetsForRoomId,
  generateRandomBetPayouts,
  getAllBets,
} = require("../controllers/betsController");

router.post("/createbet", createBet);
router.post("/placebet", placeBet);
router.get("/getbetsforroomid/:roomId", getBetsForRoomId);
router.post("/generateRandomBetPayouts/:roomId", generateRandomBetPayouts);
router.get("/getallbets", getAllBets);

module.exports = router;
