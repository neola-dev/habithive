const express=require("express");
const router=express.Router();
const {getGroupActivities}=require("../controllers/activityController");
const protect=require("../middleware/authMiddleware");
console.log(getGroupActivities);
router.get("/:groupId",protect,getGroupActivities);
module.exports=router;