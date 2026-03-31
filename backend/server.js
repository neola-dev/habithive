require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const groupRoutes=require("./routes/groupRoutes")
const cors = require("cors");
const checkInRoutes=require("./routes/checkInRoutes");
const connectDB = require("./config/db");
const habitRoutes = require("./routes/habitRoutes");
const userRoutes=require("./routes/userRoutes")
const app = express();  
const leaderboardRoutes = require("./routes/leaderboardRoutes");
const activityRoutes=require("./routes/activityRoutes");
const badgeRoutes=require("./routes/badgeRoutes");
const battleRoutes=require("./routes/battleRoutes");

connectDB().then(() => {
  console.log("MongoDB connected");
  console.log("DB Name:", mongoose.connection.name);
  require("./jobs/weeklyReset"); 
  require("./jobs/weeklyBattleReset");// cron runs only after DB is ready
}).catch((err) => {
  console.error("MongoDB connection failed", err);
});

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
}));
app.use("/api", leaderboardRoutes);
app.use("/api/badges",badgeRoutes);
app.use(express.json());
app.use("/api/battles",battleRoutes);
app.use("/api/groups",groupRoutes);
app.use("/api/activity",activityRoutes);

// Routes
app.use("/api/habits", habitRoutes);
app.use("/api/users",userRoutes);
app.get("/", (req, res) => {
    res.send("API is running...");
});
app.use("/api/checkins",checkInRoutes);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

