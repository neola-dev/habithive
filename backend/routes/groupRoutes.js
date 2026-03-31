const express = require("express");
const router = express.Router();

const {
  createGroup,
  getGroups, joinGroup,getGroupById,
  joinByInvite,getGroupByInviteCode,getMyCreatedGroups
} = require("../controllers/groupController");

const  protect  = require("../middleware/authMiddleware");

router
  .route("/")
  .get(protect, getGroups)
  .post(protect, createGroup);
router.post("/join/:id",protect,joinGroup);
router.get("/my-created",protect,getMyCreatedGroups);

router.get("/invite/:inviteCode", protect, getGroupByInviteCode);
router.post("/invite/:inviteCode",protect,joinByInvite);
router.get("/:id", protect, getGroupById);
module.exports = router;