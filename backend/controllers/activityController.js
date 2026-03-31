const mongoose=require("mongoose");
const Activity=require("../models/Activity");
const getGroupActivities=async (req,res)=>{
    try{
        const {groupId}=req.params;
        const activities=await Activity.find({group:new mongoose.Types.ObjectId(groupId)}).sort({createdAt: -1}).limit(20);
        res.json(activities);
    }catch(err){
        res.status(500).json({message: err.message});
    }
}
module.exports={getGroupActivities};