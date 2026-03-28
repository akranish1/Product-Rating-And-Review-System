const { Schema, model } = require("mongoose");
const { formatReviewTime } = require("../utils/reviewTime");
const { normalizeProductName } = require("../utils/productName");

const ReviewSchema = new Schema(
  {
    user: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
      default: null,
    },
    product: {
      type: String,
      required: true,
      trim: true,
    },
    productKey: {
      type: String,
      trim: true,
      index: true,
      default: "",
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      required: true,
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    time: {
      type: String,
      default: () => formatReviewTime(),
    },
  },
  { timestamps: true }
);

ReviewSchema.pre("validate", function setProductKey() {
  this.productKey = normalizeProductName(this.product);
});

module.exports = model("Review", ReviewSchema);
