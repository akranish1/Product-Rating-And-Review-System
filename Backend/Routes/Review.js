const express = require("express");
const Review = require("../models/Review");

const router = express.Router();

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

    res.json({ total, reviews });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// individual review lookup (used by detail page)
router.get("/:id", async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
