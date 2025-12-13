const express = require("express");
const cors = require("cors");
const fs = require("fs").promises;
const fsSync = require("fs");
const path = require("path");
const multer = require("multer");


const app = express();
app.use(cors());
app.use(express.json());

const filePath = "./Review.json";

// ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fsSync.existsSync(uploadsDir)) {
  fsSync.mkdirSync(uploadsDir, { recursive: true });
}

// serve uploaded images statically
app.use("/uploads", express.static(uploadsDir));

// configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
    cb(null, unique);
  },
});

const upload = multer({ storage });

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
// accept multipart/form-data with multiple images under field name 'images'
app.post("/reviews", upload.array("images", 10), async (req, res) => {
  try {
    const data = await fs.readFile(filePath, "utf8");
    const reviews = JSON.parse(data);

    // build review object from text fields and saved file paths
    const { user, product, category, rating, review } = req.body;

    const images = (req.files || []).map((f) => {
      // store relative path that can be accessed via /uploads/filename
      return `/uploads/${f.filename}`;
    });

    const newReview = {
      id: Date.now(),
      user: user || "",
      product: product || "",
      category: category || "",
      rating: rating ? Number(rating) : null,
      review: review || "",
      images,
      time: "just now",
    };

    reviews.unshift(newReview);

    await fs.writeFile(filePath, JSON.stringify(reviews, null, 2));

    res.json({ message: "Review added", review: newReview });
  } catch (err) {
    console.error("Error writing reviews.json:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
