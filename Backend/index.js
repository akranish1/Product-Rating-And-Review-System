const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config();

const connectDB = require("./db");
const User = require("./models/User");
const Review = require("./models/Review");
const authMiddleware = require("./middleware/authMiddleware");
const {
  buildStoredImagePaths,
  createReviewUploadMiddleware,
  deleteUploadedFiles,
  ensureUploadsDir,
} = require("./middleware/reviewUploadMiddleware");
const authRoutes = require("./Routes/Auth");
const reviewRoutes = require("./Routes/Review");
const {
  backfillVerificationExpiryDates,
} = require("./services/authService");
const { getRedisClient } = require("./services/redisClient");
const { validateReviewPayload } = require("./utils/reviewPayload");
const { formatReviewTime } = require("./utils/reviewTime");
const {
  buildProductExactRegex,
  normalizeProductName,
} = require("./utils/productName");

const app = express();
const PORT = process.env.PORT || 5000;
const uploadsDir = path.join(__dirname, "uploads");

const allowedOrigins = [
  process.env.FRONTEND_URL ||
    "https://product-rating-and-review-system-1.onrender.com",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
  "http://localhost:3000",
];

const configureMiddleware = () => {
  app.use(express.json());
  app.use(cookieParser());
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        return callback(new Error("CORS policy: origin not allowed"));
      },
      credentials: true,
    })
  );
  app.use("/uploads", express.static(uploadsDir));
};

const registerRoutes = () => {
  const upload = createReviewUploadMiddleware();

  app.use("/auth", authRoutes);
  app.use("/reviews", reviewRoutes);

  app.post(
    "/write-review",
    authMiddleware,
    upload.array("images", 5),
    async (req, res) => {
      try {
        const { details, payload } = validateReviewPayload(req.body);

        if (details.length) {
          await deleteUploadedFiles((req.files || []).map((file) => file.path));
          return res.status(400).json({
            error: "Invalid review data",
            details,
          });
        }

        const normalizedProduct = normalizeProductName(payload.product);
        const existingReview = await Review.findOne({
          userId: req.user._id,
          $or: [
            { productKey: normalizedProduct },
            { product: buildProductExactRegex(payload.product) },
          ],
        }).select("_id");

        if (existingReview) {
          await deleteUploadedFiles((req.files || []).map((file) => file.path));
          return res.status(409).json({
            error: "You have already reviewed this product",
          });
        }

        const images = buildStoredImagePaths(req.files || []);

        const newReview = await Review.create({
          user: req.user.fullName,
          userId: req.user._id,
          productKey: normalizedProduct,
          ...payload,
          images,
          time: formatReviewTime(),
        });

        return res.json({ message: "Review added", review: newReview });
      } catch (err) {
        await deleteUploadedFiles((req.files || []).map((file) => file.path));
        console.error("Add review error:", err);
        return res.status(500).json({ error: "Server error" });
      }
    }
  );
};

const bootstrapServer = async () => {
  try {
    ensureUploadsDir();
    configureMiddleware();
    registerRoutes();

    await connectDB();
    await User.createIndexes();
    await backfillVerificationExpiryDates();
    await getRedisClient();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Server startup error:", err);
    process.exit(1);
  }
};

bootstrapServer();
