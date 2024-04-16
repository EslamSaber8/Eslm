const mongoose = require("mongoose")
// 1- Create Schema
const bannerSchema = new mongoose.Schema(
    {
        image: String,
    },
    { timestamps: true }
)

module.exports = mongoose.model("Banner", bannerSchema)
