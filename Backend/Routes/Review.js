const express = require("express");
const Review = require("../models/Review");

const router = express.Router();

// GET /api/reviews?category=Food&rating=4
router.get("/", async (req, res) => {
  try {
    const { category, rating } = req.query;

    let filter = {};

    if (category) {
      filter.category = category;
    }

    if (rating) {
      filter.rating = Number(rating);
    }

    const reviews = await Review.find(filter).sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
