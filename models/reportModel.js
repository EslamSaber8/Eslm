const mongoose = require("mongoose")
// const { string, object } = require('sharp/lib/is');

// Define schema for the entire data
const reportSchema = new mongoose.Schema(
    {
        images: [String], // Array of image
        carMake: String,
        carModel: String,
        carNumber: String,
        manufactureYear: Date,
        reportDescription: String,
        partsList: [String], // Optional, array of parts
        locationOfVehicle: String,
        haveParts: Boolean, //true if user have parts
        reportStatus: {
            type: String,
            enum: ["pending", "completed","progress", "cancelled"],
            default: "pending",
        },
        progress: {
            type: String,
            enum: ["workshopoffers", "driveroffers", "workshopinprogress", "workshopcompleted", "driverinprogress"],
            default: "workshopoffers",
        },
        selectedWorkshopOffer: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
        },
        selectedDriverOffer: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
        },
        selectWorkshop: Boolean,
        allowedWorkshop: [
            {
                type: mongoose.Schema.ObjectId,
                ref: "User",
            },
        ],
        createdBy: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
        },
        uploadFiles: String, // Optional, array of file paths
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

// reportSchema.populate("selectedWorkshopOffer")




// Create and export the model
const Report = mongoose.model("Report", reportSchema)

module.exports = Report
