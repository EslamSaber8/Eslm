const { default: axios } = require("axios")
const request = require("request")

exports.sendSms = async (phone, message, next) => {

    try {
        const response = await axios.post("https://mopanel.tech/api/create-message", {
          appkey: process.env.SMSAPIKEY,
          authkey: process.env.SMSAUTHKEY,
          to: phone,
          message: message,
        });
        // Do something with the response data
    
        return response.data;
      } catch (error) {
        console.error(error);
        throw new Error("Failed to send SMS");
      }
}
