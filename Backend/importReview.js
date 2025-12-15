require("dotenv").config();
const fs = require("fs").promises;
const connectDB = require("./db");
const Review = require("./models/Review");

(async () => {
  try {
    await connectDB();

    const data = await fs.readFile("./Review.json", "utf8");
    const reviews = JSON.parse(data);

    if (!Array.isArray(reviews) || reviews.length === 0) {
      console.log("❌ No reviews found in Review.json");
      process.exit(0);
    }

    console.log(`📦 Found ${reviews.length} reviews in JSON`);

    // OPTIONAL: clear old reviews first (recommended once)
    await Review.deleteMany({});
    console.log("🧹 Cleared existing reviews collection");

    // Remove _id if present
    const cleaned = reviews.map(({ _id, ...rest }) => rest);

    await Review.insertMany(cleaned);
    console.log("✅ All JSON reviews imported into MongoDB");

    process.exit(0);
  } catch (err) {
    console.error("❌ Import failed:", err);
    process.exit(1);
  }
})();
