const express = require("express");
const router = express.Router();

const { checkInToday } = require("../controllers/checkinController");
const  protect = require("../middleware/authMiddleware");

router.post("/:groupId", protect, checkInToday);
module.exports = router;