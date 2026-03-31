const cron = require("node-cron");
const Battle = require("../models/Battle");
const { updateBattleScores } = require("../controllers/battleController");

// Runs every Sunday at 23:59
cron.schedule("59 23 * * 0", async () => {
  console.log("Weekly Battle Reset Cron running...");

  try {
    const activeBattles = await Battle.find({ status: "active" });

    for (const battle of activeBattles) {
      // Update scores and determine winner
      await updateBattleScores(battle._id);

      // Mark battle as completed
      battle.status = "completed";

      // Optional: set endDate for record
      battle.endDate = new Date();

      await battle.save();

      console.log(`Battle ${battle._id} completed. Winner: ${battle.winner}`);
    }

    console.log("Weekly Battle Reset Cron finished.");
  } catch (err) {
    console.error("Error in weekly battle reset cron:", err.message);
  }
});