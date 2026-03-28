const express = require("express");
const Review = require("../models/Review");
const authMiddleware = require("../middleware/authMiddleware");
const {
  buildStoredImagePaths,
  createReviewUploadMiddleware,
  deleteReviewImages,
  deleteUploadedFiles,
} = require("../middleware/reviewUploadMiddleware");
const { validateReviewPayload } = require("../utils/reviewPayload");
const { formatReviewTime } = require("../utils/reviewTime");
const {
  buildProductExactRegex,
} = require("../utils/productName");
const {
  getProductReviewStats,
  getProductReviewStatsMap,
  normalizeProductName,
} = require("../utils/reviewAggregation");

const router = express.Router();
const upload = createReviewUploadMiddleware();

const isReviewOwner = (review, userId) =>
  Boolean(review?.userId) && review.userId.toString() === userId.toString();
const defaultStats = { avgRating: 0, totalReviews: 0 };

// GET /reviews?category=Food&rating=4&q=de&limit=10&offset=0
router.get("/", async (req, res) => {
  try {
    const { category, rating, q, limit = 10, offset = 0 } = req.query;

    let filter = {};

    // exact filters
    if (category) {
      filter.category = category;
    }

    if (rating) {
      filter.rating = Number(rating);
    }

    // 🔍 search filter (partial, case-insensitive)
    if (q) {
      filter.$or = [
        { product: { $regex: q, $options: "i" } },
        { review: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
        { user: { $regex: q, $options: "i" } },
      ];
    }

    // count total matching documents for client-side pagination
    const total = await Review.countDocuments(filter);

    const parsedLimit = parseInt(limit, 10) || 10;
    const parsedOffset = parseInt(offset, 10) || 0;

    const reviews = await Review.find(filter)
      .sort({ createdAt: -1 })
      .skip(parsedOffset)
      .limit(parsedLimit);

    const statsMap = await getProductReviewStatsMap(
      reviews.map((review) => review.product)
    );

    const reviewsWithStats = reviews.map((review) => {
      const productKey = normalizeProductName(review.product);
      return {
        ...review.toObject(),
        productStats: statsMap[productKey] || defaultStats,
      };
    });

    res.json({ total, reviews: reviewsWithStats });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/mine", authMiddleware, async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    const statsMap = await getProductReviewStatsMap(
      reviews.map((review) => review.product)
    );

    const reviewsWithStats = reviews.map((review) => {
      const productKey = normalizeProductName(review.product);
      return {
        ...review.toObject(),
        productStats: statsMap[productKey] || defaultStats,
      };
    });

    return res.json({
      total: reviewsWithStats.length,
      reviews: reviewsWithStats,
    });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});

router.get("/products/summary", async (req, res) => {
  try {
    const product = req.query.product?.trim();

    if (!product) {
      return res.status(400).json({ error: "Product is required" });
    }

    const stats = await getProductReviewStats(product);

    return res.json({
      product,
      ...stats,
    });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});

// individual review lookup (used by detail page)
router.get("/:id", async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    const productStats = await getProductReviewStats(review.product);

    res.json({
      ...review.toObject(),
      productStats,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/:id", authMiddleware, upload.array("images", 5), async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      await deleteUploadedFiles((req.files || []).map((file) => file.path));
      return res.status(404).json({ error: "Review not found" });
    }

    if (!isReviewOwner(review, req.user._id)) {
      await deleteUploadedFiles((req.files || []).map((file) => file.path));
      return res.status(403).json({ error: "You can only edit your own review" });
    }

    const { details, payload } = validateReviewPayload(req.body);
    if (details.length) {
      await deleteUploadedFiles((req.files || []).map((file) => file.path));
      return res.status(400).json({
        error: "Invalid review data",
        details,
      });
    }

    const normalizedProduct = normalizeProductName(payload.product);
    const duplicateReview = await Review.findOne({
      userId: req.user._id,
      _id: { $ne: review._id },
      $or: [
        { productKey: normalizedProduct },
        { product: buildProductExactRegex(payload.product) },
      ],
    }).select("_id");

    if (duplicateReview) {
      await deleteUploadedFiles((req.files || []).map((file) => file.path));
      return res.status(409).json({
        error: "You have already reviewed this product",
      });
    }

    const nextImages = buildStoredImagePaths(req.files || []);
    if (nextImages.length) {
      await deleteReviewImages(review.images);
      review.images = nextImages;
    }

    review.user = req.user.fullName;
    review.userId = req.user._id;
    review.product = payload.product;
    review.productKey = normalizedProduct;
    review.category = payload.category;
    review.rating = payload.rating;
    review.review = payload.review;
    review.time = formatReviewTime();

    await review.save();

    return res.json({ message: "Review updated", review });
  } catch (err) {
    await deleteUploadedFiles((req.files || []).map((file) => file.path));
    console.error("Update review error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    if (!isReviewOwner(review, req.user._id)) {
      return res.status(403).json({ error: "You can only delete your own review" });
    }

    await deleteReviewImages(review.images);
    await review.deleteOne();

    return res.json({ message: "Review deleted" });
  } catch (err) {
    console.error("Delete review error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
