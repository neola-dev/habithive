const mongoose=require("mongoose");
const checkInSchema=mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        group:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group",
            required: true
        },
        date:{
            type: Date,
            default: Date.now
        }
    },{timestamps: true}
);
module.exports=mongoose.model("checkIn",checkInSchema);