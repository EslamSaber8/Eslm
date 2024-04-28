const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Coupon name required'],
      unique: true,
    },
    expire: {
      type: Date,
      required: [true, 'Coupon expire time required'],
    },
    discount: {
      type: Number,
      required: [true, 'Coupon discount value required'],
      min: [0, 'Discount value cannot be less than 0'],
      max: [100, 'Discount value cannot be more than 100'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Coupon', couponSchema);