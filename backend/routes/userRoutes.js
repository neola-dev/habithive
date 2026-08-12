const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const https = require("https");
const crypto = require("crypto");
const User = require("../models/User");
const {getAllUsers} = require("../controllers/UserController");
const router = express.Router();

// Helper to verify Google ID Token via Google's API
function verifyGoogleToken(idToken) {
  return new Promise((resolve, reject) => {
    const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`;
    https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode === 200) {
            resolve(parsed);
          } else {
            reject(new Error(parsed.error_description || "Google token verification failed"));
          }
        } catch (err) {
          reject(err);
        }
      });
    }).on("error", (err) => {
      reject(err);
    });
  });
}


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

// GET PUBLIC CONFIG (Google Client ID)
router.get("/config", (req, res) => {
  res.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID || ""
  });
});

// GOOGLE AUTH (Sign In / Sign Up)
router.post("/google-auth", async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: "Google credential is required" });
    }

    const payload = await verifyGoogleToken(credential);
    const { email, name, aud } = payload;

    // Verify audience matches our Client ID if configured (security best practice)
    if (process.env.GOOGLE_CLIENT_ID && aud !== process.env.GOOGLE_CLIENT_ID) {
      return res.status(400).json({ message: "Token audience mismatch" });
    }

    // Check if the user already exists in the database
    let user = await User.findOne({ email });
    let isNew = false;

    if (!user) {
      isNew = true;
      // Generate a strong, cryptographically secure random password
      // that satisfies the minLength: 6 constraint and uppercase/lowercase/digit/special characters checks.
      const randomPassword = crypto.randomBytes(16).toString("hex") + "aA1!";
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      user = await User.create({
        name: name || email.split("@")[0],
        email,
        password: hashedPassword
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(isNew ? 201 : 200).json({
      message: isNew ? "Registered successfully via Google" : "Login successful via Google",
      token,
      id: user._id,
      name: user.name
    });

  } catch (error) {
    console.error("❌ GOOGLE AUTH ERROR:", error.message);
    res.status(400).json({ message: "Google authentication failed: " + error.message });
  }
});

router.get("/", protect, getAllUsers);

module.exports = router;