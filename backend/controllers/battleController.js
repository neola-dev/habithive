const Battle = require("../models/Battle");
const crypto = require("crypto");
const Group = require("../models/Group");
const CheckIn = require("../models/CheckIn");


async function calculateGroupScore(groupId) {
    const group = await Group.findById(groupId).populate("members");
    if (!group || group.members.length === 0) return 0;

    let totalWeeklyStreaks = 0;

    // Get start of current week (Monday)
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const diffToMonday = day === 0 ? 6 : day - 1; // if Sunday, go back 6 days
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    // End of week (Sunday 23:59:59)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    for (const member of group.members) {
        const streaks = await CheckIn.countDocuments({
                user: member.user,      // ✅ correct field
                group: groupId,         // optional but safer
                date: { $gte: startOfWeek, $lte: endOfWeek }
        });

        totalWeeklyStreaks += streaks;
    }

    // normalized score
    return totalWeeklyStreaks / group.members.length;
}

//function to update battle score
async function updateBattleScores(battleId) {
        const battle=await Battle.findById(battleId);
        if(!battle)  throw new Error("Battle not found");
        if(battle.groupA){
                battle.groupAScore=await calculateGroupScore(battle.groupA);
        }
        if(battle.groupB){
                battle.groupBScore=await calculateGroupScore(battle.groupB);
        }
        if (battle.groupAScore > battle.groupBScore) {
        battle.winner = battle.groupA;
        } 
        else if (battle.groupBScore > battle.groupAScore) {
        battle.winner = battle.groupB;
        } 
        else {
        battle.winner = null;
        }
        await battle.save();
        return battle;
}
const createBattleInvite = async (req,res)=>{

        try{

        const {groupA} = req.body;

        const userId = req.user._id;

        const group = await Group.findById(groupA);

        if(!group){
        return res.status(404).json({message:"Group not found"});
        }

        if(group.creator.toString() !== userId.toString()){
        return res.status(403).json({
        message:"Only group creator can start battle"
        });
        }

        const inviteCode = crypto.randomBytes(6).toString("hex");

        const now = new Date();
        const startOfWeek = new Date(now);
        const day = now.getDay();
        const diffToMonday = day === 0 ? 6 : day - 1;
        startOfWeek.setDate(now.getDate() - diffToMonday);
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        const battle = await Battle.create({
        groupA,
        inviteCode,
        startDate: startOfWeek,
        endDate: endOfWeek,
        });

        res.json({
        message:"Battle invite created",
        inviteLink:`/battle/invite/${inviteCode}`,
        battle
        });

        }catch(err){
        res.status(500).json({error:err.message});
        }
};
const getBattleByInvite=async (req,res)=>{
        try{
                const {code}=req.params;
                const battle = await Battle.findOne({inviteCode: code}).populate("groupA","name").populate("groupB","name");
                             
                if(!battle){
                        return res.status(404).json({message: "Battle not found"});
                }
                res.json({
                        battle
                });
        }
        catch(error){
                res.status(500).json({message: error.message});
        }
}
const joinBattle=async(req,res)=>{
        try{
                const {inviteCode,groupB}=req.body;
                if(!req.user){
                        return res.status(401).json({
                                message:"User not authenticated"
                        });
                }

                const userId=req.user._id;
                const group=await Group.findById(groupB);
                if(!group){
                        return res.status(404).json({
                                message:"Group not found"
                        });
                }
                if(group.creator.toString()!==userId.toString()){
                        return res.status(403).json({
                                message: "Only creator has access to join battle"
                        });
                }
                const battle=await Battle.findOne({inviteCode});
                if(!battle){
                        return res.status(404).json({message: "Battle not found"});
                }
                if(battle.status!=="pending"){
                        return res.status(400).json({message: "Battle already started"});
                }
                battle.groupB=groupB;
                battle.status="active";
                await battle.save();
                await battle.populate("groupA","name");
                await battle.populate("groupB","name");
                res.json({
                        message: "Battle joined successfully",
                        battle
                });
        }
        catch(error){
                res.status(500).json({message: error.message});
        }
}
const getUserBattles = async (req, res) => {
  try {
    const userId = req.user._id;

    const groups = await Group.find({ "members.user": userId });
    const groupIds = groups.map(g => g._id);

    // Optionally filter by status query param
    const statusFilter = req.query.status || "active"; // default: active

    const battles = await Battle.find({
      status: statusFilter,
      $or: [
        { groupA: { $in: groupIds } },
        { groupB: { $in: groupIds } }
      ]
    })
      .populate("groupA", "name")
      .populate("groupB", "name")
      .populate("winner", "name") // populate winner for completed battles
      .sort({ createdAt: -1 });

    res.json({ battles });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const getBattleProgress=async(req,res)=>{
        try{
                const battle=await Battle.findById(req.params.battleId)
                .populate({
                        path: "groupA",
                        select: "name members",
                        populate: {
                                path: "members.user",
                                select: "name"
                        }
                })
                .populate({
                        path: "groupB",
                        select: "name members",
                        populate: {
                                path: "members.user",
                                select: "name"
                        }
                });
                if(!battle)     return res.status(404).json({message: "Battle not found"});
                await updateBattleScores(battle._id);
                let leader=null;
                let leadBy=0;
                if(battle.groupB){
                        if(battle.groupAScore>battle.groupBScore){
                                leader=battle.groupA.name;
                                leadBy=battle.groupAScore-battle.groupBScore;
                        }
                        else if(battle.groupBScore>battle.groupAScore){
                                leader=battle.groupB.name;
                                leadBy=battle.groupBScore-battle.groupAScore;
                        }
                }
                const today = new Date();
                today.setHours(0,0,0,0);

                const adjustStreak = (member) => {
                if (!member.lastCheckin) return member;

                const last = new Date(member.lastCheckin);
                last.setHours(0,0,0,0);

                const diff = Math.floor((today - last) / (1000 * 60 * 60 * 24));

                if (diff > 1) {
                member.weeklyStreak = 0; // ❗ missed day → reset
                }

                return member;
                };
                const sortMembers = (members = []) =>
                members.map(adjustStreak).sort((a, b) => b.weeklyStreak - a.weeklyStreak);
                res.json({
                        battleId: battle._id,
                        groupA:{
                                name: battle.groupA.name,
                                score: battle.groupAScore,
                                members: sortMembers(battle.groupA.members)
                        },
                        groupB:battle.groupB
                                ?{name: battle.groupB.name,score: battle.groupBScore,members: sortMembers(battle.groupB.members)}:null,
                        leader,
                        leadBy: leadBy.toFixed(2),
                        winner:battle.winner,
                });
        }catch(err){
                console.log(err);
                res.status(500).json({message: err.message});
        }
}
const getActiveBattle = async (req, res) => {
  try {
    const userId = req.user._id;

    // find groups where user is a member
    const groups = await Group.find({
      "members.user": userId
    });

    const groupIds = groups.map(g => g._id);

    // find active battle involving user's groups
    const battle = await Battle.findOne({
      status: "active",
      $or: [
        { groupA: { $in: groupIds } },
        { groupB: { $in: groupIds } }
      ]
    })
    .populate("groupA", "name")
    .populate("groupB", "name");

    if (!battle) {
      return res.status(404).json({ message: "No active battle" });
    }

    // update scores before sending
    await updateBattleScores(battle._id);

    let leadingGroup = null;
    let leadScore = 0;

    if (battle.groupB) {
      if (battle.groupAScore > battle.groupBScore) {
        leadingGroup = battle.groupA.name;
        leadScore = battle.groupAScore - battle.groupBScore;
      } else if (battle.groupBScore > battle.groupAScore) {
        leadingGroup = battle.groupB.name;
        leadScore = battle.groupBScore - battle.groupAScore;
      }
    }

    res.json({
      groupA: battle.groupA?.name,
      groupB: battle.groupB?.name || "Waiting...",
      leadingGroup,
      leadScore: leadScore.toFixed(2)
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
module.exports={createBattleInvite,getBattleByInvite,joinBattle,getBattleProgress,updateBattleScores,getUserBattles,getActiveBattle};