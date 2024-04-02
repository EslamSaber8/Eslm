const mongoose = require("mongoose")
// const { string, object } = require('sharp/lib/is');

// Define schema for the entire data
const reportSchema = new mongoose.Schema(
    {
        images: [String], // Array of image
        carMake: String,
        carModel: String,
        carNumber: String,
        manufactureYear:Date,
        reportDescription: Date,
        partsList: [String], // Optional, array of parts
        locationOfVehicle: String,
        /*if we make workshop model 
       selectWorkshop: {
      type: mongoose.Schema.ObjectId,
      ref: 'workshop',
    },*/
        selectWorkshop: String,
        createdBy: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
        },
        uploadFiles: [String], // Optional, array of file paths
    },
    {
        timestamps: true,
        // to enable virtual populate
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
)

//
reportSchema.virtual("offers", {
    ref: "Offer",
    localField: "_id",
    foreignField: "report",
})

// Create and export the model
const Report = mongoose.model("Report", reportSchema)

module.exports = Report
