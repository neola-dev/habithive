const mongoose = require("mongoose");

const habitSchema = new mongoose.Schema(
  {
    user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
    },
    title: {
      type: String,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Habit", habitSchema);