const { strip } = require("colors")
const mongoose = require("mongoose")

const productSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            minlength: [3, "Too short product title"],
            maxlength: [100, "Too long product title"],
        },
        slug: {
            type: String,
            required: true,
            lowercase: true,
        },
        make: {
            type: String,
            required: true,
        },
        model: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: [true, "Product description is required"],
            minlength: [20, "Too short product description"],
        },
        quantity: {
            type: Number,
            required: [true, "Product quantity is required"],
            min: [0, 'quantity value cannot be less than 0'],
        },
        sold: {
            type: Number,
            default: 0,
        },
        year: Date,
        price: {
            type: Number,
            required: [true, "Product price is required"],
            trim: true,
            max: [20000000, "Too long product price"],
        },
        Discount: {
            type: Number,
            default: 0,
        },
        fixed: {
            type: Number,
            default: 0,
        },
        priceAfterDiscount: {
            type: Number,
        },
        colors: [String],

        imageCover: {
            type: String,
            required: [true, "Product Image cover is required"],
        },
        images: [String],
        category: {
            type: mongoose.Schema.ObjectId,
            ref: "Category",
            required: [true, "Product must be belong to category"],
        },
        brand: {
            type: mongoose.Schema.ObjectId,
            ref: "Brand",
        },
        ratingsAverage: {
            type: Number,
            min: [1, "Rating must be above or equal 1.0"],
            max: [5, "Rating must be below or equal 5.0"],
            // set: (val) => Math.round(val * 10) / 10, // 3.3333 * 10 => 33.333 => 33 => 3.3
        },
        createdBy: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
        },
        ratingsQuantity: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
        // to enable virtual populate
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
)

productSchema.virtual("reviews", {
    ref: "Review",
    foreignField: "product",
    localField: "_id",
})

// Mongoose query middleware
productSchema.pre(/^find/, function (next) {
    this.populate({
        path: "category brand createdBy",
        select: "name _id",
    })
    next()
})

// const setImageURL = (doc) => {
//   if (doc.imageCover) {
//     const imageUrl = `${process.env.BASE_URL}/products/${doc.imageCover}`;
//     doc.imageCover = imageUrl;
//   }
//   if (doc.images) {
//     const imagesList = [];
//     doc.images.forEach((image) => {
//       const imageUrl = `${process.env.BASE_URL}/products/${image}`;
//       imagesList.push(imageUrl);
//     });
//     doc.images = imagesList;
//   }
// };
// // findOne, findAll and update
// productSchema.post('init', (doc) => {
//   setImageURL(doc);
// });

// // create
// productSchema.post('save', (doc) => {
//   setImageURL(doc);
// });

module.exports = mongoose.model("Product", productSchema)