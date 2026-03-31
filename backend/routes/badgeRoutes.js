const express=require("express");
const router=express.Router();
const {getUserBadges}=require("../controllers/badgeController");
const protect=require("../middleware/authMiddleware");
router.get("/",protect,getUserBadges);
module.exports=router;