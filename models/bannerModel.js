const mongoose = require("mongoose")
// 1- Create Schema
const bannerSchema = new mongoose.Schema(
    {
       
 image: [String],
      
    },
    { timestamps: true }
)

module.exports = mongoose.model("Banner", bannerSchema)


// const mongoose = require("mongoose")
// // 1- Create Schema
// const bannerSchema = new mongoose.Schema(
//     {
//         title: {
//             type: String,
//             required: [true, "Brand required"],
//         },
//         image: String,
//         colorOne: {
//             type: String,
//         },
//         colorTwo: {
//             type: String,
//         },
//     },
//     { timestamps: true }
// )

// module.exports = mongoose.model("Banner", bannerSchema)
