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

        reportStatus: {
            type: String,
            enum: ["pending", "completed", "cancelled"],
            default: "pending",
        },
        progress: {
            type: String,
            enum: ["workshopoffers", "driveroffers", "workshopinprogress", "workshopcompleted", "driverinprogress", "drivercompleted"],
            default: "workshopoffers",
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

        
        selectedWorkshopOffer: {
            type: mongoose.Schema.ObjectId,
            ref: "Offer",
        },
        selectedDriverOffer: {
            type: mongoose.Schema.ObjectId,
            ref: "Offer",
        },
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
