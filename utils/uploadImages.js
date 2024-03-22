const multer = require("multer")
const ApiError = require("./apiError")
const asyncHandler = require("express-async-handler")
const { signupValidator } = require("./validators/authValidator")

const domainName = process.env.DOMAINNAME + "uploads/"

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/") // Specify the destination folder for uploaded images
    },
    filename: (req, file, cb) => {
        const filename = Date.now() + "-" + file.originalname
        cb(null, filename) // Define the file naming convention and return an object with filename and domainName
    },
    finalName: (req, file, cb) => {
        const { filename } = cb(null, file)
        cb(null, domainName + filename)
    },
})

const upload = multer({ storage })
const fieldsUpload = upload.fields([
    { name: "license", maxCount: 1 },
    { name: "idImg", maxCount: 1 },
    { name: "image", maxCount: 1 },
    { name: "images", maxCount: 5 },
    { name: "imageCover", maxCount: 1 },
    { name: "imageid", maxCount: 10 },
])

exports.uploadMultipleImages = asyncHandler(async (req, res, next) => {
    //   const  error  = await signupValidator
    fieldsUpload(req, res, (err) => {
        if (err) {
            return next(new ApiError("Error uploading images", 400))
        }
        if (req.files.license) {
            req.body.license = domainName + req.files.license[0].filename
        }
        if (req.files.idImg) {
            req.body.idImg = domainName + req.files.idImg[0].filename
        }
        if (req.files.image) {
            req.body.image = domainName + req.files.image[0].filename
        }
        if (req.files.images) {
            req.body.images = req.files.images.map((file) => domainName + file.filename)
        }
        if (req.files.imageCover) {
            req.body.imageCover = domainName + req.files.imageCover[0].filename
        }
        if (req.files.imageid) {
            req.body.imageid = req.files.imageid.map((file) => domainName + file.filename)
        }
        next()
    })
})

// const singleUpload = upload.single("image")
// const multipleUpload = upload.array("images", 10)
// exports.uploadProductImage = asyncHandler(async (req, res, next) => {
//     singleUpload(req, res, (err) => {
//         if (err) {
//             console.log(err)
//             return next(new ApiError("Error uploading product image", 400))
//         }
//         next()
//     })
// })
// exports.uploadProductImages = (req, res, next) => {
//     console.log(req.file)
//     multipleUpload(req, res, (err) => {
//         if (err) {
//             console.log(err)
//             return next(new ApiError("Error uploading product images", 400))
//         }

//         res.status(200).json({
//             status: "success",
//             data: {
//                 files: req.files,
//             },
//         })
//         next()
//     })
// }
