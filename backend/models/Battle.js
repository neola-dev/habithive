const mongoose=require("mongoose");
const battleSchema=new mongoose.Schema({
    groupA: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
        required: true
    },
    groupB:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group"
    },
    inviteCode:{
        type: String,
        unique: true
    },
    status:{
        type: String,
        enum: ["pending","active","completed"],
        default: "pending"
    },
    startDate: Date,
    endDate: Date,
    groupAScore: {
        type: Number,
        default: 0
    },
    groupBScore:{
        type: Number,
        default: 0
    },
    winner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group"
    }
},{timestamps:true});
module.exports=mongoose.model("Battle",battleSchema);