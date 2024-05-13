const path = require("path")

const express = require("express")
const dotenv = require("dotenv")
const morgan = require("morgan")
const cors = require("cors")
dotenv.config({ path: "config.env" })
const ApiError = require("./utils/apiError")
const globalError = require("./middlewares/errorMiddleware")
const dbConnection = require("./config/database")
const i18n = require("i18n")
// Routes
const reportRoute = require("./routes/reportRoute")
const userRoute = require("./routes/userRoute")
const authRoute = require("./routes/authRoute")
const offerRoute = require("./routes/OfferRoute")
const categoryRoute = require("./routes/categoryRoute")
const brandRoute = require("./routes/brandRoute")
const productRoute = require("./routes/productRoute")
const reviewRoute = require("./routes/reviewRoute")
const bannerRoute = require("./routes/bannerRoute")
const couponRoute = require("./routes/couponRoute")
const cartRoute = require("./routes/cartRoute")
const orderRoute = require("./routes/orderRoute")
const topFiveRoute = require("./routes/topFiveRoute")

// Connect with db
dbConnection()
const bodyParser = require("body-parser")
// express app
const app = express()
// Enable other domains to access your application
app.use(cors())
app.options("*", cors())
app.use(bodyParser.urlencoded({ extended: true }))
// Middlewares
app.use(express.json())

// app.use(express.static(path.join(__dirname, "uploads")))
app.use("/uploads", express.static("uploads"))

if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"))
    console.log(`mode: ${process.env.NODE_ENV}`)
}
i18n.configure({
    locales: ["ar", "en"],
    directory: __dirname + "/locales", // if you don't specify this it will throw an error
    queryParameter: "lang",
    defaultLocales: ["en"], // if you don't specify this it will throw an error
    cookie: "lang",
})

app.use(i18n.init)

// Routes
// app.use("/api/v1/auth", authRouter)
app.use((req, res, next) => {
    const userLang = req.query.lang || req.headers["accept-language"] || "en"
    req.setLocale(userLang)
    next()
})

// Mount Routes
app.use("/api/v1/reports", reportRoute)
app.use("/api/v1/users", userRoute)
app.use("/api/v1/auth", authRoute)
app.use("/api/v1/offer", offerRoute)

app.use("/api/v1/categories", categoryRoute)
app.use("/api/v1/brands", brandRoute)
app.use("/api/v1/products", productRoute)
app.use("/api/v1/reviews", reviewRoute)

app.use("/api/v1/banner", bannerRoute)

app.use("/api/v1/coupons", couponRoute)
app.use("/api/v1/cart", cartRoute)
app.use("/api/v1/orders", orderRoute)
app.use("/api/v1/topfive", topFiveRoute)

app.get("/", (req, res) => {
    res.send(req.__("welcome"))
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
