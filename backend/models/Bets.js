const mongoose = require("mongoose");

const betsSchema = new mongoose.Schema({
  createdId: {
    type: String,
    required: true,
  },
  forId: {
    type: String,
    required: true,
  },
  betType: {
    type: Object,
    required: true,
  },
  placedBets: {
    type: Array,
  },
  roomId: {
    type: String,
    required: true,
  },
  hasBeenPaidOut: {
    type: Boolean,
    default: false,
  },
  outcome: {
    type: Boolean,
    default: null,
  },
});

module.exports = mongoose.model("Bets", betsSchema);
