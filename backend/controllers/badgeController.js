const Badge=require("../models/Badge");
const badgeTitles = {
  1: "First Perfect Week 🏆",
  5: "5 Perfect Weeks 🔥",
  10: "10 Perfect Weeks 💪",
  20: "20 Perfect Weeks 🚀",
  50: "50 Perfect Weeks 🐐"
};


const getUserBadges=async(req,res)=>{
    try{
        const badges=await Badge.find({
            user: req.user._id
        }).sort({value:-1});
        const formattedBadges = badges.map(b => ({
            value: b.value,
            title: badgeTitles[b.value]
        }));

        res.status(200).json({
            badges: formattedBadges
        });
    }
    catch(error){
        res.status(500).json({message:error.message});
    }
};
module.exports={getUserBadges};