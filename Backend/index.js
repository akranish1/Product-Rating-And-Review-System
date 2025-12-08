const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

const filePath = "./Review.json";

// GET reviews
app.get("/reviews", (req, res) => {
  const reviews = JSON.parse(fs.readFileSync(filePath));
  const { category, rating } = req.query;

  let filtered = reviews;

  // Category filter
  if (category && category !== "All") {
    filtered = filtered.filter(r => r.category === category);
  }

  // Rating filter
  if (rating && rating !== "All") {
    filtered = filtered.filter(r => r.rating === Number(rating));
  }

  res.json(filtered);
});

// POST review
app.post("/reviews", (req, res) => {
  const reviews = JSON.parse(fs.readFileSync(filePath));

  const newReview = req.body;
  reviews.unshift(newReview);

  fs.writeFileSync(filePath, JSON.stringify(reviews, null, 2));

  res.json({ message: "Review added", review: newReview });
});

app.listen(5000, () => console.log("Server running on port 5000"));
