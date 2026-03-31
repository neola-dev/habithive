const Group = require("../models/Group");
const {nanoid}  = require("nanoid");
// Create Group
const createGroup = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Group name required" });
    }
    const inviteCode=nanoid(8);
    const group = await Group.create({
      name,
      description,
      creator: req.user._id,
      members: [
        {
          user: req.user._id,
           weeklyStreak: 0,
           lifetimeStreak: 0,
          lastCheckin: null,
        },
      ],
      inviteCode: inviteCode,
    });
    const inviteLink = `http://localhost:5173/invite/${inviteCode}`;

    res.json({
      ...group._doc,
      inviteLink
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Groups where user is a member
const getGroups = async (req, res) => {
  try {
    const groups = await Group.find({
      "members.user": req.user._id,
    })
      .populate("creator", "name email")
      .populate("members.user", "name email");

    const groupsWithLink = groups.map(group => ({
        ...group._doc,
        inviteLink: `http://localhost:5173/invite/${group.inviteCode}`
    }));

    res.json(groupsWithLink);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Join Group
const joinGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const alreadyMember = group.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (alreadyMember) {
      return res.status(400).json({ message: "Already joined" });
    }

    group.members.push({
  user: req.user._id,
  weeklyStreak: 0,
  lifetimeStreak: 0,
  lastCheckin: null
});

    await group.save();

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Group Details
const getGroupById = async (req,res)=>{
  try{

    const group = await Group.findById(req.params.id)
      .populate("members.user","name");

    const today = new Date();
    today.setHours(0,0,0,0);

    const membersWithStatus = group.members.map(member => {

      let status = "active";

      if(member.lastCheckin){

        const last = new Date(member.lastCheckin);
        last.setHours(0,0,0,0);

        const diff = Math.floor((today - last) / (1000*60*60*24));

        if(diff >= 2){
          status = "missed";
        }

      }

      return {
        ...member.toObject(),
        status
      };

    });

    res.json({
      ...group.toObject(),
      members: membersWithStatus
    });

  }catch(err){
    res.status(500).json({message:err.message});
  }
}
// GET groups where user is creator
const getMyCreatedGroups = async (req, res) => {
  try {
    const userId = req.user._id;

    const groups = await Group.find({
      creator: userId
    });

    res.json(groups);

  } catch (err) {
    console.log("ERROR in getMyCreatedGroups:", err); 
    res.status(500).json({ message: err.message });
  }
};
// Daily Check-in

const joinByInvite = async (req, res) => {
  try {

    const { inviteCode } = req.params;

    const group = await Group.findOne({ inviteCode });

    if (!group) {
      return res.status(404).json({
        message: "Invalid invite link"
      });
    }

    const alreadyMember = group.members.find(
      m => m.user.toString() === req.user._id.toString()
    );

    if (alreadyMember) {
      return res.status(400).json({
        message: "Already a member"
      });
    }

    group.members.push({
  user: req.user._id,
  weeklyStreak: 0,
  lifetimeStreak: 0,
  lastCheckin: null
});

    await group.save();

    res.json(group);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};
const getGroupByInviteCode = async (req, res) => {
  try {
    const { inviteCode } = req.params;

    const group = await Group.findOne({ inviteCode })
      .populate("creator", "name")
      .populate("members.user", "name");

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.json(group);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = {
  createGroup,
  getGroups,
  joinGroup,
  getGroupById,
  joinByInvite,getGroupByInviteCode,getMyCreatedGroups
};