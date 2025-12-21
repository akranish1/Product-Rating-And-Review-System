const express = require("express");
const Review = require("../models/Review");

const router = express.Router();

// GET /api/reviews?category=Food&rating=4&q=de
router.get("/", async (req, res) => {
  try {
    const { category, rating, q } = req.query;

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
      ];
    }

    const reviews = await Review.find(filter).sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
