const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: [true, "name required"],
        },
        slug: {
            type: String,
            lowercase: true,
        },
        email: {
            type: String,
            required: [true, "email required"],
            unique: true,
            lowercase: true,
        },
        phone: String,
        license: {
            type: String,
        },
        idImg: String,
        verified: {
            type: Boolean,
            default: false,
        },
        avatar: {
            type: String,
            default: "",
        },
        verifyCode: String,
        verificationExpires: Date,
        accountState: {
            type: String,
            enum: ["underReview", "approved", "rejected"],
            default: "underReview",
        },
        password: {
            type: String,
            required: [true, "password required"],
            minlength: [6, "Too short password"],
        },
        notifications: [
            {
                type: { type: String, enum: ["report",], default: "" },
                message: String,

            },
        ],
        passwordChangedAt: Date,
        passwordResetCode: String,
        passwordResetExpires: Date,
        passwordResetVerified: Boolean,
        workshopLocationLat: String,
        workshopLocationLong: String,
        role: {
            type: String,
            enum: ["workshop", "driver", "insurance", "vendor", "admin", "superAdmin"],
            default: "driver",
        },
        active: {
            type: Boolean,
            default: true,
        },
        locations: String,
    },
    { timestamps: true }
)

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next()
    // Hashing user password
    this.password = await bcrypt.hash(this.password, 12)
    next()
})

const User = mongoose.model("User", userSchema)

module.exports = User
