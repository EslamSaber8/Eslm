const path = require("path")

const express = require("express")
const dotenv = require("dotenv")
const morgan = require("morgan")

dotenv.config({ path: "config.env" })
const ApiError = require("./utils/apiError")
const globalError = require("./middlewares/errorMiddleware")
const dbConnection = require("./config/database")
// Routes
const reportRoute = require("./routes/reportRoute")
const userRoute = require("./routes/userRoute")
const authRoute = require("./routes/authRoute")
const offerRoute = require("./routes/OfferRoute")

// Connect with db
dbConnection()

// express app
const app = express()

// Middlewares
app.use(express.json())
app.use(express.static(path.join(__dirname, "uploads")))

if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"))
    console.log(`mode: ${process.env.NODE_ENV}`)
}

// Mount Routes
app.use("/api/v1/reports", reportRoute)
app.use("/api/v1/users", userRoute)
app.use("/api/v1/auth", authRoute)
app.use("/api/v1/offer", offerRoute)

app.get("/", (req, res) => {
    res.send("Hello World")
})

app.all("*", (req, res, next) => {
    next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400))
})

// Global error handling middleware for express
app.use(globalError)

const PORT = process.env.PORT || 8000
const server = app.listen(PORT, () => {
    console.log(`App running running on port ${PORT}`)
})

// Handle rejection outside express
process.on("unhandledRejection", (err) => {
    console.error(`UnhandledRejection Errors: ${err.name} | ${err.message}`)
    server.close(() => {
        console.error(`Shutting down....`)
        process.exit(1)
    })
})