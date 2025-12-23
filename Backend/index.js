const express = require("express");
const cors = require("cors");
const path = require("path");
const fsSync = require("fs");
const multer = require("multer");
// DB + auth
require("dotenv").config();
const connectDB = require("./db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("./models/User");
const Review = require("./models/Review");
const authMiddleware = require("./middleware/authMiddleware");
const reviewRoutes = require("./Routes/Review");
const cookieParser = require("cookie-parser");

const app = express();
app.use(cookieParser());

app.use(cors({
  origin: "https://product-rating-and-review-system-1.onrender.com", // exact frontend origin
  credentials: true
}));
app.use(express.json());

// connect to MongoDB
connectDB().catch((err) => console.error("DB connect error", err));


//FILE UPLOAD CONFIG

const uploadsDir = path.join(__dirname, "uploads");
if (!fsSync.existsSync(uploadsDir)) {
  fsSync.mkdirSync(uploadsDir, { recursive: true });
}

app.use("/uploads", express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadsDir),
  filename: (_, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_")),
});

const upload = multer({ storage });

//REVIEWS ROUTES (MongoDB)

app.use("/reviews", reviewRoutes);
//  GET all reviews

//  POST review (protected)
app.post(
  "/write-review",
  authMiddleware,
  upload.array("images", 5),
  async (req, res) => {
    try {
      const { product, category, rating, review } = req.body;

      const images = (req.files || []).map(
        (f) => `/uploads/${f.filename}`
      );

      const newReview = await Review.create({
        user: req.user.fullName,
        product,
        category,
        rating: Number(rating),
        review,
        images,
        time: "just now",
      });

      res.json({ message: "Review added", review: newReview });
    } catch (err) {
      console.error("Add review error:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

//AUTH ROUTES

// SIGNUP
app.post("/auth/signup", async (req, res) => {
  try {
    const { fullName, email, role, password } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({
        error: "Full name, email and password are required",
      });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      role,
      password: hashedPassword,
    });

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
      },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" }
    );

    // 🍪 SET HTTP-ONLY COOKIE
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,        // true in production (HTTPS)
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
      },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" }
    );

    // 🍪 SET HTTP-ONLY COOKIE
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,        // true in prod
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


app.post("/auth/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: false, // true in production (HTTPS)
  });
  localStorage.removeItem("currentUser");

  res.json({ message: "Logged out successfully" });
});


/* =========================
   SERVER START
========================= */

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
