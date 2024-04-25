const expressAsyncHandler = require("express-async-handler")
const topFiveModel = require("../models/topFiveModel")
const User = require("../models/userModel")
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

exports.getTopFive = expressAsyncHandler(async (req, res, next) => {
    const topFiveWorkshops = await getTopFives("workshop")
    const topFiveDriver = await getTopFives("driver")
    const topFiveInsuranceCompany = await getTopFives("insurance")
    const finalWorkshop = topFiveWorkshops.map((workshop) => {
        return workshop.user
    })
    const finalDriver = topFiveDriver.map((driver) => {
        return driver.user
    })
    const finalInsuranceCompany = topFiveInsuranceCompany.map((insurance) => {
        return insurance.user
    })

    const workshopMembers = await User.find({ role: "workshop" }).countDocuments()
    const driverMembers = await User.find({ role: "driver" }).countDocuments()
    const insuranceMembers = await User.find({ role: "insurance" }).countDocuments()

    return res.status(200).json({
        data: {
            topFiveWorkshops: finalWorkshop,
            topFiveDriver: finalDriver,
            topFiveInsuranceCompany: finalInsuranceCompany,
            workshopMembers,
            driverMembers,
            insuranceMembers,
        },
    })
})

const getTopFives = async (type) => {
    const date = new Date()
    return await topFiveModel
        .find({ type: type })
        .populate("user")
        .where("year")
        .equals(date.getFullYear())
        .where(`months.${monthNames[date.getMonth()]}.weekNumber`)
        .equals(Math.ceil(date.getDate() / 7))
        .sort({ [`months.${monthNames[date.getMonth()]}.Completed`]: -1 })
        .limit(5)
}
