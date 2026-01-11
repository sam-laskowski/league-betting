const Bet = require("../models/Bets");
const User = require("../models/User");

const createBet = async (req, res) => {
  try {
    const { createdId, forId, betType, roomId } = req.body;

    const bet = new Bet({
      createdId,
      forId,
      betType,
      roomId,
      hasBeenPaidOut: false,
      outcome: null,
    });

    await bet.save();

    return res.status(201).json(bet);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const placeBet = async (req, res) => {
  try {
    const { betId, userId, amount, prediction } = req.body;

    const bet = await Bet.findById(betId);
    const user = await User.findById(userId);

    if (!bet) {
      return res.status(404).json({ error: "Bet not found" });
    }
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (user.balance < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    user.balance -= amount;
    await user.save();

    bet.placedBets.push({ userId, amount, prediction });
    await bet.save();

    return res.status(201).json(bet);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getBetsForRoomId = async (req, res) => {
  try {
    const { roomId } = req.params;

    const bets = await Bet.find({ roomId: roomId });

    return res.status(200).json(bets);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to get bets for room", error: error.message });
  }
};

const generateRandomBetPayouts = async (req, res) => {
  try {
    const { roomId } = req.params;

    const bets = await Bet.find({ roomId: roomId });

    const allPayouts = [];

    for (const bet of bets) {
      if (bet.hasBeenPaidOut) {
        continue;
      }
      const outcome = Math.random() < 0.5 ? "true" : "false";
      let totalLoserAmount = 0;
      let numWinners = 0;
      for (let i = 0; i < bet.placedBets.length; i++) {
        if (bet.placedBets[i].prediction === outcome) {
          numWinners++;
        } else {
          totalLoserAmount += parseInt(bet.placedBets[i].amount);
        }
      }
      //console.log("totalLoserAmount: ", totalLoserAmount);
      //console.log("numWinners: ", numWinners);
      for (const placedBet of bet.placedBets) {
        if (placedBet.prediction === outcome) {
          const user = await User.findById(placedBet.userId);
          const payout =
            parseInt(placedBet.amount) +
            parseInt(totalLoserAmount / numWinners);
          //console.log("payout: ", payout);
          user.balance += payout;
          await user.save();
          allPayouts.push({
            userId: placedBet.userId,
            amount: payout,
            newBalance: user.balance,
          });
        }
      }
      const booleanOutcome = outcome === "true";
      bet.outcome = booleanOutcome;
      bet.hasBeenPaidOut = true;
      await bet.save();
    }
    console.log(allPayouts);

    return res.status(200).json(allPayouts);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to get bets for room", error: error.message });
  }
};

const getAllBets = async (req, res) => {
  try {
    const bets = await Bet.find({});
    return res.status(200).json(bets);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to get all bets", error: error.message });
  }
};

module.exports = {
  createBet,
  placeBet,
  getBetsForRoomId,
  generateRandomBetPayouts,
  getAllBets,
};
