const mongoose = require("mongoose");
const Group = require("../models/Group");
const CheckIn = require("../models/CheckIn");

const getLeaderboard = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { type } = req.query;
    const currentUserId = req.user._id;
    // WEEKLY LEADERBOARD
    if(type === "weekly"){

      const leaderboard = await Group.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(groupId) } },
        { $unwind: "$members" },

        {
          $lookup:{
            from:"users",
            localField:"members.user",
            foreignField:"_id",
            as:"userInfo"
          }
        },

        { $unwind:"$userInfo" },
        { $sort: { "members.weeklyStreak": -1 , "members.lastCheckin": 1, 
    "userInfo.name": 1 } },
        {
          $project:{
            userId: "$userInfo._id",
            name:"$userInfo.name",
        
            weeklyStreak:"$members.weeklyStreak"
          }
        }
      ]);

      const ranked = leaderboard.map((u,i)=>({
        rank:i+1,
        ...u
      }));
      const userRank = ranked.find(
        u => u.userId.toString() === currentUserId.toString()
      );
      const top10 = ranked.slice(0,10);
      return res.json({leaderboard:top10,currentUserRank:userRank});
    }

    // LIFETIME LEADERBOARD
    if(type === "lifetime"){

      const leaderboard = await Group.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(groupId) } },
        { $unwind: "$members" },

        

        {
          $lookup:{
            from:"users",
            localField:"members.user",
            foreignField:"_id",
            as:"userInfo"
          }
        },

        { $unwind:"$userInfo" },
        { $sort: { "members.successfulWeeks": -1 , "members.lastCheckin": 1, 
    "userInfo.name": 1 } },
        {
          $project:{
            userId: "$userInfo._id",
            name:"$userInfo.name",
            successfulWeeks:"$members.successfulWeeks"
          }
        }
      ]);

      const ranked = leaderboard.map((u,i)=>({
        rank:i+1,
        ...u
      }));

      const userRank = ranked.find(
        u => u.userId.toString() === currentUserId.toString()
      );
      const top10 = ranked.slice(0,10);
      return res.json({leaderboard:top10,currentUserRank:userRank});
    }

    // MONTHLY LEADERBOARD
    if(type === "monthly"){

 const now = new Date();

 const startOfMonth = new Date(
   Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
 );

 const endOfMonth = new Date(
   Date.UTC(now.getUTCFullYear(), now.getUTCMonth()+1, 1)
 );

 const leaderboard = await Group.aggregate([

  { $match: { _id: new mongoose.Types.ObjectId(groupId) } },

  { $unwind: "$members" },

  {
   $lookup:{
    from:"checkins",
    let:{ userId:"$members.user" },
    pipeline:[
      {
        $match:{
          $expr:{
            $and:[
              { $eq:["$user","$$userId"] },
              { $eq:["$group", new mongoose.Types.ObjectId(groupId)] },
              { $gte:["$date", startOfMonth] },
              { $lt:["$date", endOfMonth] }
            ]
          }
        }
      }
    ],
    as:"monthlyCheckins"
   }
  },

  {
   $addFields:{
    monthlyCheckins:{ $size:"$monthlyCheckins" }
   }
  },

  
  {
   $lookup:{
    from:"users",
    localField:"members.user",
    foreignField:"_id",
    as:"userInfo"
   }
  },

  { $unwind:"$userInfo" },
  { $sort:{ monthlyCheckins:-1 , "members.lastCheckin": 1, 
    "userInfo.name": 1 } },

  {
   $project:{
    userId:"$userInfo._id",
    name:"$userInfo.name",
    monthlyCheckins:1
   }
  }

 ]);

 const ranked = leaderboard.map((u,i)=>({
  rank:i+1,
  ...u
 }));

 const userRank = ranked.find(
        u => u.userId.toString() === currentUserId.toString()
      );
      const top10 = ranked.slice(0,10);
      return res.json({leaderboard:top10,currentUserRank:userRank});
}

    res.status(400).json({message:"Invalid leaderboard type"});

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getLeaderboard };