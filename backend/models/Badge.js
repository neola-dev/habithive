const mongoose=require("mongoose");
const badgeSchema=new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: true
    },
    type:{
        type: String,
        default: "successfulWeeks"
    },
    value:{
        type:Number
    },
    createdAt:{
        type:Date,
        default: Date.now
    }
});
module.exports=mongoose.model("Badge",badgeSchema);