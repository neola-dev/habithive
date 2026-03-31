const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  weeklyStreak: { 
    type: Number,
    default: 0
  },
  successfulWeeks: {
    type: Number,
    default: 0
  },
  lastCheckin: {
    type: Date,
    default: null
  }
});


const groupSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true,
  },

  description: {
    type: String,
  },

  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  members: [memberSchema],

  inviteCode: {
    type: String,
    unique: true,
  },
}, { timestamps: true });

module.exports = mongoose.model("Group", groupSchema);