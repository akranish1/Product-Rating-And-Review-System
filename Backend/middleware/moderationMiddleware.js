const axios = require("axios");

/**
 * Check review text for toxic/hateful language using OpenAI Moderation API
 * @param {string} text - The review text to check
 * @returns {Promise<Object>} - Returns { flagged: boolean, scores: {...}, violatedCategories: [...] }
 */
async function checkToxicity(text) {
  try {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!OPENAI_API_KEY) {
      console.warn("OPENAI_API_KEY not set. Skipping moderation check.");
      return { flagged: false, scores: {}, violatedCategories: [] };
    }

    const response = await axios.post(
      "https://api.openai.com/v1/moderations",
      {
        input: text,
        model: "text-moderation-latest"
      },
      {
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const result = response.data.results?.[0];

    if (!result) {
      console.error("No moderation result from OpenAI");
      return { flagged: false, scores: {}, violatedCategories: [] };
    }

    // OpenAI categories and safe thresholds
    const CATEGORY_THRESHOLDS = {
      hate: 0.05,
      hateful_threatening: 0.05,
      harassment: 0.05,
      harassment_threatening: 0.05,
      self_harm: 0.05,
      self_harm_intent: 0.05,
      self_harm_instructions: 0.05,
      sexual: 0.05,
      sexual_minors: 0.01,
      violence: 0.05,
      violence_graphic: 0.05
    };

    // Extract category scores
    const scores = result.category_scores || {};

    // Check which categories are flagged
    let violatedCategories = [];
    for (const [category, threshold] of Object.entries(CATEGORY_THRESHOLDS)) {
      const score = scores[category] || 0;
      if (score > threshold) {
        violatedCategories.push({
          category: category.replace(/_/g, " "),
          score,
          threshold
        });
      }
    }

    // Also check the overall flagged status from OpenAI
    const flagged = result.flagged || violatedCategories.length > 0;

    return {
      flagged,
      scores,
      violatedCategories
    };

  } catch (error) {
    console.error("Toxicity check error:", error.message);

    // Handle specific API errors
    if (error.response?.status === 401) {
      console.error("Invalid or missing OpenAI API key");
    } else if (error.response?.status === 429) {
      console.error("OpenAI API rate limit exceeded");
    }

    // In case of API error, allow the review (fail open)
    // You can change this to fail closed by returning { flagged: true }
    return { flagged: false, scores: {}, violatedCategories: [], error: error.message };
  }
}

/**
 * Middleware to check review for toxic content
 * Attaches moderation result to req.moderation
 */
async function moderationMiddleware(req, res, next) {
  try {
    const { review, product } = req.body;

    if (!review || review.trim().length === 0) {
      return res.status(400).json({ error: "Review text is required" });
    }

    // Check toxicity
    const moderation = await checkToxicity(review);
    req.moderation = moderation;

    if (moderation.flagged) {
      return res.status(400).json({
        error: "Review contains inappropriate content",
        details: moderation.violatedCategories.map(v => ({
          category: v.category,
          message: `${v.category.charAt(0).toUpperCase() + v.category.slice(1)} score: ${(v.score * 100).toFixed(1)}%`
        }))
      });
    }

    next();
  } catch (error) {
    console.error("Moderation middleware error:", error);
    res.status(500).json({ error: "Content moderation check failed" });
  }
}

module.exports = { checkToxicity, moderationMiddleware };