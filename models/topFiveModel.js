const mongoose = require("mongoose")
// 1- Create Schema

const weeklyCheckSchema = new mongoose.Schema(
    {
        weekNumber: {
            type: Number,
            required: true,
        },
        Completed: {
            type: Number,
        },
        // Add more fields as needed for details about the weekly check
    },
    { _id: false }
)

const topFiveSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ["workshop", "driver", "insurance"],
        },
        year: {
            type: Number,
            required: [true, "Please provide a year"],
        },
        user:{
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: [true, "Please provide a user"],
        },
        months: {
            January: [weeklyCheckSchema],
            February: [weeklyCheckSchema],
            March: [weeklyCheckSchema],
            April: [weeklyCheckSchema],
            May: [weeklyCheckSchema],
            June: [weeklyCheckSchema],
            July: [weeklyCheckSchema],
            August: [weeklyCheckSchema],
            September: [weeklyCheckSchema],
            October: [weeklyCheckSchema],
            November: [weeklyCheckSchema],
            December: [weeklyCheckSchema],
        },
    },
    { timestamps: true }
)

module.exports = mongoose.model("TopFive", topFiveSchema)
