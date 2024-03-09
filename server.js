const path = require("path")

const express = require("express")
const dotenv = require("dotenv")
const morgan = require("morgan")
const cors = require('cors');
dotenv.config({ path: "config.env" })
const ApiError = require("./utils/apiError")
const globalError = require("./middlewares/errorMiddleware")
const dbConnection = require("./config/database")
// Routes
const reportRoute = require("./routes/reportRoute")
const userRoute = require("./routes/userRoute")
const authRoute = require("./routes/authRoute")
const offerRoute = require("./routes/OfferRoute")
const categoryRoute = require('./routes/categoryRoute');
const brandRoute = require('./routes/brandRoute');
const productRoute = require('./routes/productRoute');
const reviewRoute = require('./routes/reviewRoute');


// Connect with db
dbConnection()

// express app
const app = express()
// Enable other domains to access your application
app.use(cors());
app.options('*', cors());

// Middlewares
app.use(express.json())
// app.use(express.static(path.join(__dirname, "uploads")))
app.use("/uploads", express.static("uploads"))

if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"))
    console.log(`mode: ${process.env.NODE_ENV}`)
}

// Mount Routes
app.use("/api/v1/reports", reportRoute)
app.use("/api/v1/users", userRoute)
app.use("/api/v1/auth", authRoute)
app.use("/api/v1/offer", offerRoute)

app.use('/api/v1/categories', categoryRoute);
app.use('/api/v1/brands', brandRoute);
app.use('/api/v1/products', productRoute);
app.use('/api/v1/reviews', reviewRoute);

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
