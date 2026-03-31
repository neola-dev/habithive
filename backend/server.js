require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const groupRoutes = require("./routes/groupRoutes");
const checkInRoutes = require("./routes/checkInRoutes");
const habitRoutes = require("./routes/habitRoutes");
const userRoutes = require("./routes/userRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");
const activityRoutes = require("./routes/activityRoutes");
const badgeRoutes = require("./routes/badgeRoutes");
const battleRoutes = require("./routes/battleRoutes");

const connectDB = require("./config/db");

const app = express();

// ✅ MIDDLEWARE FIRST
app.use(express.json());
app.use(cors({
  origin: "*",
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
}));

// ✅ CONNECT DB
connectDB().then(() => {
  console.log("MongoDB connected");
  console.log("DB Name:", mongoose.connection.name);

  require("./jobs/weeklyReset"); 
  require("./jobs/weeklyBattleReset");
}).catch((err) => {
  console.error("MongoDB connection failed", err);
});

// ✅ ROUTES
app.use("/api", leaderboardRoutes);
app.use("/api/badges", badgeRoutes);
app.use("/api/battles", battleRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/habits", habitRoutes);
app.use("/api/users", userRoutes);
app.use("/api/checkins", checkInRoutes);

// ✅ TEST ROUTE
app.get("/", (req, res) => {
  res.send("API is running...");
});

// ✅ PORT
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});