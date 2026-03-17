const axios = require("axios");

const MODERATION_API_URL = "https://api.openai.com/v1/moderations";
const MODERATION_MODEL = process.env.OPENAI_MODERATION_MODEL || "omni-moderation-latest";
const MODERATION_CACHE_TTL_MS = 5 * 60 * 1000;
const moderationCache = new Map();

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
  violence_graphic: 0.05,
};

const CATEGORY_KEY_ALIASES = {
  hateful_threatening: "hate/threatening",
  harassment_threatening: "harassment/threatening",
  self_harm: "self-harm",
  self_harm_intent: "self-harm/intent",
  self_harm_instructions: "self-harm/instructions",
  sexual_minors: "sexual/minors",
  violence_graphic: "violence/graphic",
};

function normalizeText(text = "") {
  return text.toLowerCase();
}

function getCacheKey(text = "") {
  return normalizeText(text).trim();
}

function getCachedModeration(text) {
  const cacheKey = getCacheKey(text);

  if (!cacheKey) {
    return null;
  }

  const cached = moderationCache.get(cacheKey);
  if (!cached) {
    return null;
  }

  if (cached.expiresAt <= Date.now()) {
    moderationCache.delete(cacheKey);
    return null;
  }

  return cached.value;
}

function setCachedModeration(text, value) {
  const cacheKey = getCacheKey(text);

  if (!cacheKey) {
    return;
  }

  moderationCache.set(cacheKey, {
    value,
    expiresAt: Date.now() + MODERATION_CACHE_TTL_MS,
  });
}

function runLocalModeration(text) {
  const normalizedText = normalizeText(text);
  const violatedCategories = [];
  const scores = {};
  const harassmentTerms = ["asshole", "fuck", "shit", "bitch", "bastard", "moron", "idiot", "stupid"];
  const violenceTerms = ["kill", "murder", "threat", "violence", "shoot", "stab"];
  const violentPhrases = [
    "stop breathing",
    "drop dead",
    "go die",
    "hope you die",
    "hope you stop breathing",
    "wish you were dead",
  ];

  const addViolation = (category, score) => {
    const existing = violatedCategories.find((item) => item.category === category);
    if (existing) {
      existing.score = Math.max(existing.score, score);
    } else {
      violatedCategories.push({ category, score, threshold: 0.05 });
    }

    scores[category] = Math.max(scores[category] || 0, score);
  };

  if (harassmentTerms.some((word) => normalizedText.includes(word))) {
    addViolation("harassment", 0.9);
  }

  if (
    violenceTerms.some((word) => normalizedText.includes(word)) ||
    violentPhrases.some((phrase) => normalizedText.includes(phrase))
  ) {
    addViolation("violence", 0.95);
  }

  if (["nigger", "faggot", "chink"].some((word) => normalizedText.includes(word))) {
    addViolation("hate", 0.95);
  }

  if (["rape", "sexual assault"].some((word) => normalizedText.includes(word))) {
    addViolation("sexual", 0.95);
  }

  return {
    flagged: violatedCategories.length > 0,
    scores,
    violatedCategories,
  };
}

function getScore(scores, category) {
  const keysToTry = [
    category,
    CATEGORY_KEY_ALIASES[category],
    category.replace(/_/g, "/"),
    category.replace(/_/g, "-"),
  ].filter(Boolean);

  for (const key of keysToTry) {
    if (typeof scores[key] === "number") {
      return scores[key];
    }
  }

  return 0;
}

function mapModerationResult(result = {}) {
  const scores = result.category_scores || {};
  const violatedCategories = [];

  for (const [category, threshold] of Object.entries(CATEGORY_THRESHOLDS)) {
    const score = getScore(scores, category);
    if (score > threshold) {
      violatedCategories.push({
        category: category.replace(/_/g, " "),
        score,
        threshold,
      });
    }
  }

  return {
    flagged: Boolean(result.flagged) || violatedCategories.length > 0,
    scores,
    violatedCategories,
    source: "openai",
    degraded: false,
  };
}

/**
 * Check review text for toxic/hateful language using OpenAI Moderation API
 * @param {string} text - The review text to check
 * @param {Object} options
 * @param {boolean} options.allowRemote - Whether OpenAI should be queried
 * @param {boolean} options.forceRemote - Whether OpenAI should still be queried even if local moderation matches
 * @returns {Promise<Object>} - Returns { flagged: boolean, scores: {...}, violatedCategories: [...] }
 */
async function checkToxicity(text, options = {}) {
  const { allowRemote = true, forceRemote = false } = options;
  const trimmedText = (text || "").trim();

  try {
    if (!trimmedText) {
      return { flagged: false, scores: {}, violatedCategories: [], source: "empty", degraded: false };
    }

    const localModeration = runLocalModeration(trimmedText);
    if (localModeration.flagged && !forceRemote) {
      return { ...localModeration, source: "local_keyword", degraded: false };
    }

    if (!allowRemote) {
      return { ...localModeration, source: "local_only", degraded: false };
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!OPENAI_API_KEY) {
      console.warn("OPENAI_API_KEY not set. Skipping moderation check.");
      return { ...localModeration, source: "local_fallback", degraded: true, reason: "missing_api_key" };
    }

    const cachedModeration = getCachedModeration(trimmedText);
    if (cachedModeration) {
      return { ...cachedModeration, cached: true };
    }

    console.log("Making OpenAI Moderation API call for text:", trimmedText.substring(0, 50) + "...");

    const response = await axios.post(
      MODERATION_API_URL,
      {
        model: MODERATION_MODEL,
        input: trimmedText,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    const result = response.data.results?.[0];
    const moderation = mapModerationResult(result);
    setCachedModeration(trimmedText, moderation);
    return moderation;
  } catch (error) {
    console.error("Toxicity check error:", error.message);
    const providerStatus = error.response?.status || null;
    const providerMessage = error.response?.data?.error?.message || error.message;

    if (error.response?.data?.error) {
      console.error("OpenAI moderation error details:", error.response.data.error);
    }

    if (providerStatus === 401) {
      console.error("Invalid or missing OpenAI API key");
    } else if (providerStatus === 429) {
      console.error("OpenAI API rate limit exceeded");
    }

    const fallbackModeration = runLocalModeration(trimmedText);
    return {
      ...fallbackModeration,
      source: "local_fallback",
      degraded: true,
      providerStatus,
      providerMessage,
      error: providerMessage,
    };
  }
}

/**
 * Middleware to check review for toxic content
 * Attaches moderation result to req.moderation
 */
async function moderationMiddleware(req, res, next) {
  try {
    const { review } = req.body;

    if (!review || review.trim().length === 0) {
      return res.status(400).json({ error: "Review text is required" });
    }

    const moderation = await checkToxicity(review);
    req.moderation = moderation;

    if (moderation.flagged) {
      return res.status(400).json({
        error: "Review contains inappropriate content",
        details: moderation.violatedCategories.map((violation) => ({
          category: violation.category,
          message: `${violation.category.charAt(0).toUpperCase() + violation.category.slice(1)} score: ${(violation.score * 100).toFixed(1)}%`,
        })),
      });
    }

    next();
  } catch (error) {
    console.error("Moderation middleware error:", error);
    res.status(500).json({ error: "Content moderation check failed" });
  }
}

module.exports = { checkToxicity, moderationMiddleware };
