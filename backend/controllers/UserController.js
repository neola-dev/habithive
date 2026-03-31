const User = require("../models/User");

// Get all users
const getAllUsers = async (req, res) => {
  try {

    const users = await User.find().select("-password");

    res.json(users);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllUsers
};