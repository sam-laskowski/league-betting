const User = require("../models/User");

const addFunds = async (req, res) => {
    try {
        const { userId, amount } = req.body;

        const user = await User.findById(userId)

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.balance += amount;
        await user.save();

        res.status(200).json({ message: "Funds added successfully", balance: user.balance });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

module.exports = { addFunds }