const mongoose = require("mongoose")

const carTypeSchema = new mongoose.Schema(
    {
        make: {
            type: String,
            trim: true,
        },
        model: {
            type: Date,
        },
        year: {
            type: Number,
        },
    },
    { timestamps: true }
)

module.exports = mongoose.model("CarType", carTypeSchema)
