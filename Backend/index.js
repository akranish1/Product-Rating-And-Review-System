const express = require("express");
const cors = require("cors");
const fs = require("fs").promises;

const app = express();
app.use(cors());
app.use(express.json());

const filePath = "./Review.json";

// GET reviews


// GET reviews
app.get("/reviews", async (req, res) => {
  try {
    const data = await fs.readFile(filePath, "utf8");
    const reviews = JSON.parse(data);

    const { category, rating } = req.query;
    let filtered = reviews;

    if (category && category !== "All") {
      filtered = filtered.filter(r => r.category === category);
    }

    if (rating && rating !== "All") {
      filtered = filtered.filter(r => r.rating === Number(rating));
    }

    res.json(filtered);
  } catch (err) {
    console.error("Error reading reviews.json:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// POST review
app.post("/reviews", async (req, res) => {
  try {
    const data = await fs.readFile(filePath, "utf8");
    const reviews = JSON.parse(data);

    const newReview = req.body;
    reviews.unshift(newReview);

    await fs.writeFile(filePath, JSON.stringify(reviews, null, 2));

    res.json({ message: "Review added", review: newReview });
  } catch (err) {
    console.error("Error writing reviews.json:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
