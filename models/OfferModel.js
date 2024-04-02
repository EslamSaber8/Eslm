const mongoose = require("mongoose")

// Define schema for the entire data
const OfferSchema = new mongoose.Schema({
    price: Number,
    deadline: Date,
    partPrice: Number,
    description: {
        type: String,
        required: [true, 'Product description is required'],
        minlength: [20, 'Too short product description'],
      },

    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: [true, "Offer must belong to user"],
    },
    report: {
        type: mongoose.Schema.ObjectId,
        ref: "Report",
    },
})
OfferSchema.pre(/^find/, function (next) {
    this.populate({ path: "createdBy", select: "name role" })
    next()
})
OfferSchema.pre(/^find/, function (next) {
    this.populate({ path: "report", select: "reportDescription" })
    next()
})
// Create and export the model
const Offer = mongoose.model("Offer", OfferSchema)

module.exports = Offer
