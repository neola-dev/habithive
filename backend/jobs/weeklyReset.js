const cron = require("node-cron");
const Group = require("../models/Group");
console.log("Weekly reset script loaded");
cron.schedule("0 0 * * 1", async () => {
  try {
    console.log("Running weekly leaderboard reset...");

    // Fetch all groups
    const groups = await Group.find({});

    for (const group of groups) {
      let updated = false;

      // Loop through members and reset weeklyStreak
      group.members.forEach(member => {
        if (member.weeklyStreak !== 0) {
          member.weeklyStreak = 0;
          updated = true;
        }
      });

      if (updated) {
        await group.save();
        console.log(`Reset weekly streak for group: ${group._id}`);
      }
    }

    console.log("Weekly scores reset successfully");
  } catch (error) {
    console.error("Weekly reset failed:", error);
  }
});