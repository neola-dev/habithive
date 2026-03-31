const express = require("express");
const router = express.Router();
const Habit = require("../models/Habit");
const protect = require("../middleware/authMiddleware");
// Create habit
router.post("/", protect, async (req, res) => {
  try {
    const { title } = req.body;

    const habit = await Habit.create({
      title,
      user: req.user.id   // important (see next bug)
    });

    res.status(201).json(habit);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all habits
router.get("/", protect,async (req, res) => {
  try {
    const habits = await Habit.find({user: req.user.id});
    res.json(habits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id",protect,async(req,res)=>{
    try{
        const habit=await Habit.findByIdAndUpdate(
            req.params.id,
            req.body,
            {new: true}
        );
        if(!habit){
            return res.status(404)/express.json({message: "Habit not found"});
        }
        res.json(habit);
    }
    catch(error){
        res.status(500).json({message: error.message});
    }
});

router.delete("/:id",protect,async(req,res)=>{
    try{
        const habit=await Habit.findByIdAndDelete(req.params.id);
        if(!habit){
            return res.status(404).json({message: "Habit not found"});
        }
        res.json({message: "Habit deleted successfully"});
    }
    catch(error){
        res.status(500).json({message: error.message});
    }
});
module.exports = router;