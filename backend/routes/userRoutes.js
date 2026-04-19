const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const {getAllUsers}= require("../controllers/UserController");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
// REGISTER
router.post("/register", async (req, res) => {
  console.log("✅ REGISTER ROUTE HIT");

  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log("❌ USER ALREADY EXISTS");
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("✅ TOKEN GENERATED:", token);

    console.log("✅ SENDING RESPONSE:", {
      token,
      id: user._id,
      name: user.name
    });

    res.status(201).json({
      message: "User registered successfully",
      token,
      id: user._id,
      name: user.name
    });

  } catch (error) {
    console.error("❌ REGISTER ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
});
// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
    message: "Login successful",
    token,
    id: user._id,    
    name: user.name  
  });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get("/", protect, getAllUsers);
module.exports = router;