const mongoose = require("mongoose");
const CheckIn = require("../models/CheckIn");
const Group = require("../models/Group");
const Activity = require("../models/Activity");
const Badge=require("../models/Badge");
const Battle=require("../models/Battle");
const {updateBattleScores}=require("../controllers/battleController");
const checkInToday = async (req, res) => {
  try {

    const { groupId } = req.params;

    // Today's date (midnight)
    const today = new Date();
    today.setHours(0,0,0,0);

    // Check if already checked in today
    const existing = await CheckIn.findOne({
      user: req.user._id,
      group: groupId,
      date: { $gte: today }
    });

    if (existing) {
      return res.status(400).json({
        message: "Already checked in today"
      });
    }

    // Create check-in record
    await CheckIn.create({
      user: req.user._id,
      group: groupId
    });

    // Get group
    const group = await Group.findById(groupId);

    const member = group.members.find(
      m => m.user.toString() === req.user._id.toString()
    );

    if (!member) {
      return res.status(404).json({
        message: "User not in group"
      });
    }

    // Get last checkin
    let lastCheck = null;

    if (member.lastCheckin) {
      lastCheck = new Date(member.lastCheckin);
      lastCheck.setHours(0,0,0,0);
    }

    // Calculate difference in days
    let diff = null;

    if (lastCheck) {
      diff = Math.floor((today - lastCheck) / (1000 * 60 * 60 * 24));
    }

    // -------- WEEK RESET LOGIC --------

    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    monday.setHours(0,0,0,0);

    if (lastCheck && lastCheck < monday) {
      member.weeklyStreak = 0;
    }
    // Streak logic
    if (!lastCheck) {
      member.weeklyStreak = 1;
    }

    else if (diff === 1) {
      member.weeklyStreak += 1;
    }

    else if (diff === 0) {
      // already checked today (safety check)
      return res.status(400).json({
        message: "Already checked in today"
      });
    }

    else {
      // streak broken
      member.weeklyStreak = 1;
    }
    // Update last checkin
    member.lastCheckin = new Date();

    
   const milestones = [1,5,10,20,50];
    if(member.weeklyStreak===7){
      member.successfulWeeks+=1;
      await Activity.create({
        user: req.user._id,
        group: groupId,
        type: "streak",
        message: `${req.user.name} completed a perfect week🏆`
      });
      if (milestones.includes(member.successfulWeeks)) {
        const badgeExists=await Badge.findOne({
           user: req.user._id,
           value: member.successfulWeeks
        });
        if(!badgeExists){
          await Badge.create({
            user: req.user._id,
            value: member.successfulWeeks
          });
         
        
          await Activity.create({
              user: req.user._id,
              group: groupId,
              type: "streak",
              message: `${req.user.name} successfully completed ${member.successfulWeeks} weeks😎`
            });
        }    
      }
    }

    await Activity.create({
      user: req.user._id,
      group: new mongoose.Types.ObjectId(groupId),
      type: "checkin",
      message: `✅${req.user.name} checked in today!🔥`
    });
    const battles=await Battle.find({
      status: "active",
      $or:[
        {groupA: groupId},
        {groupB: groupId}
      ]
    });
    for(const battle of battles){
      await updateBattleScores(battle._id);
    }
    await group.save();
    res.status(200).json({
      message: "Check-in successful",
      weeklyStreak: member.weeklyStreak,
      successfulWeeks: member.successfulWeeks
    });
   
  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

module.exports = { checkInToday };