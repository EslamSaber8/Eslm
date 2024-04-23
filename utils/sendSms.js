const { default: axios } = require("axios")
const request = require("request")
const ApiError = require("./apiError")

exports.sendSms = async (phone, message, next) => {
    try {
        // const response = await axios.post("https://mopanel.tech/api/create-message", {
        //     appkey: process.env.SMSAPIKEY,
        //     authkey: process.env.SMSAUTHKEY,
        //     to: phone,
        //     message: message,
        // })
        const response = await axios.post("https://wasender.codepeak.live/api/create-message", {
            appkey: process.env.SMSAPIKEY2,
            authkey: process.env.SMSAUTHKEY2,
            to: phone,
            message: message,
        })
        // Do something with the response data

        return response.data
    } catch (error) {
        return next(new ApiError("Error in sending sms", 500))
    }
}
