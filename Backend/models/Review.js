const { Schema, model } = require("mongoose");

const ReviewSchema = new Schema(
  {
    user: String,
    product: String,
    category: String,
    rating: Number,
    review: String,
    images: [String],
    time: String,
  },
  { timestamps: true }
);

module.exports = model("Review", ReviewSchema);
