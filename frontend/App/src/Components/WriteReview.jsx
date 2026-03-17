import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const LOCAL_BLOCKED_WORDS = [
  "fuck",
  "asshole",
  "shit",
  "kill",
  "murder",
  "threat",
  "violence",
  "rape",
  "nigger",
  "faggot",
];

const LOCAL_MODERATION_RULES = [
  { category: "harassment", score: 0.8, words: ["fuck", "asshole", "shit"] },
  { category: "violence", score: 0.9, words: ["kill", "murder", "threat", "violence"] },
  { category: "hate", score: 0.95, words: ["nigger", "faggot"] },
  { category: "sexual", score: 0.95, words: ["rape"] },
];

function getLocalModeration(reviewText) {
  const normalizedReview = reviewText.toLowerCase();
  const scores = {};
  const violatedCategories = [];

  for (const rule of LOCAL_MODERATION_RULES) {
    if (rule.words.some((word) => normalizedReview.includes(word))) {
      scores[rule.category] = Math.max(scores[rule.category] || 0, rule.score);
      violatedCategories.push({
        category: rule.category,
        score: rule.score,
      });
    }
  }

  return {
    allowed: violatedCategories.length === 0,
    scores,
    violatedCategories,
  };
}

const WriteReview = () => {
  const [product, setProduct] = useState("");
  const [category, setCategory] = useState("");
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [moderationWarning, setModerationWarning] = useState("");
  const [toxicityScores, setToxicityScores] = useState(null);

  const navigate = useNavigate();

  const checkReviewModeration = (reviewText) => {
    const trimmedReview = reviewText.trim();

    if (trimmedReview.length < 5) {
      setModerationWarning("");
      setToxicityScores(null);
      return { allowed: true, scores: {}, violatedCategories: [] };
    }

    const data = getLocalModeration(trimmedReview);
    setToxicityScores(data.scores || {});

    if (!data.allowed) {
      const warnings = (data.violatedCategories || [])
        .map((violation) => `${violation.category.replace(/_/g, " ")}: ${(violation.score * 100).toFixed(0)}%`)
        .join(", ");

      setModerationWarning(`Potentially offensive content detected: ${warnings}`);
    } else {
      setModerationWarning("");
    }

    return data;
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      checkReviewModeration(review);
    }, 250);

    return () => clearTimeout(timer);
  }, [review]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedReview = review.trim();
    const normalizedReview = trimmedReview.toLowerCase();
    const hasHatefulContent = LOCAL_BLOCKED_WORDS.some((word) => normalizedReview.includes(word));

    if (hasHatefulContent) {
      setError("Your review contains inappropriate content. Please revise your review.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const moderationResult = checkReviewModeration(trimmedReview);
      if (!moderationResult.allowed) {
        setError("Cannot submit review with inappropriate content. Please revise your review.");
        return;
      }

      const form = new FormData();
      form.append("product", product.trim());
      form.append("category", category);
      form.append("rating", Number(rating));
      form.append("review", trimmedReview);
      images.forEach((file) => form.append("images", file));

      const res = await fetch(`${import.meta.env.VITE_API_URL}/write-review`, {
        method: "POST",
        credentials: "include",
        body: form,
      });

      if (res.status === 401) {
        localStorage.removeItem("isLoggedIn");
        navigate("/auth");
        return;
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Failed to submit review" }));

        let errorMsg = errorData.error || "Failed to submit review";
        if (errorData.details) {
          const details = errorData.details.map((detail) => `${detail.category}: ${detail.message}`).join(", ");
          errorMsg = `${errorMsg}\n\n${details}`;
        }

        throw new Error(errorMsg);
      }

      navigate("/");
    } catch (err) {
      setError(err.message || "Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate("/")}
          className="mb-8 flex items-center gap-2 text-gray-700 font-bold hover:text-green-600 transition-colors bg-white px-5 py-2.5 rounded-full shadow-sm border border-gray-200"
        >
          <span>&larr;</span> Back to Discovery
        </button>

        <div className="bg-white rounded-[40px] shadow-[0_30px_100px_rgba(15,23,42,0.1)] border border-gray-200 overflow-hidden flex flex-col lg:flex-row">
          <div className="flex-[1.5] p-8 md:p-16">
            <header className="mb-10">
              <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Write Review</h1>
              <p className="text-gray-500 font-medium">Be descriptive to help the community.</p>
            </header>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded">
                <p className="text-sm text-red-800 font-medium whitespace-pre-wrap">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="relative">
                <label className="text-xs font-black text-gray-800 uppercase tracking-widest mb-3 block ml-1">Product Name</label>
                <input
                  type="text"
                  placeholder="e.g., iPhone 15 Pro Max"
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  className="w-full px-6 py-5 bg-gray-50 border-2 border-gray-100 rounded-3xl focus:border-green-500 focus:bg-white outline-none transition-all text-gray-900 font-bold placeholder:text-gray-300 text-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-black text-gray-800 uppercase tracking-widest mb-3 block ml-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-6 py-5 bg-gray-50 border-2 border-gray-100 rounded-3xl focus:border-green-500 focus:bg-white outline-none font-bold text-gray-700 cursor-pointer"
                    required
                  >
                    <option value="">Choose Category</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Home">Home</option>
                    <option value="Books">Books</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black text-gray-800 uppercase tracking-widest mb-3 block ml-1">Your Rating</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="w-full px-6 py-5 bg-blue-50 border-2 border-blue-100 rounded-3xl focus:border-green-500 focus:bg-white outline-none font-black text-green-600"
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>{n} Stars {n === 5 ? " - Excellent" : ""}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-black text-gray-800 uppercase tracking-widest block ml-1">Detailed Review</label>
                </div>
                <textarea
                  placeholder="What did you like or dislike?"
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  rows={6}
                  className="w-full px-6 py-5 bg-gray-50 border-2 border-gray-100 rounded-3xl focus:border-green-500 focus:bg-white outline-none transition-all text-gray-900 font-medium leading-relaxed resize-none"
                  required
                />

                {moderationWarning && (
                  <div className="mt-3 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg border-2">
                    <div className="flex items-center mb-2">
                      <span className="text-red-600 text-xl mr-2">Blocked</span>
                      <p className="text-sm text-red-800 font-bold">Content Warning</p>
                    </div>
                    <p className="text-sm text-red-700 mb-2">{moderationWarning}</p>
                    <p className="text-xs text-red-600 font-medium">Please revise your review to remove inappropriate content before submitting.</p>
                    {toxicityScores && (
                      <div className="mt-3 text-xs text-red-700 grid grid-cols-2 gap-2">
                        {Object.entries(toxicityScores)
                          .filter(([, value]) => value > 0.1)
                          .map(([key, value]) => (
                            <div key={key} className="flex justify-between bg-red-100 p-2 rounded">
                              <span className="font-medium">{key.replace(/_/g, " ")}:</span>
                              <span className="font-bold text-red-800">
                                {(value * 100).toFixed(0)}%
                              </span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || Boolean(moderationWarning)}
                className={`w-full py-5 rounded-3xl font-black text-white uppercase tracking-widest text-sm transition-all shadow-xl
                  ${isSubmitting || moderationWarning
                    ? "bg-red-400 cursor-not-allowed"
                    : "bg-gray-900 hover:bg-green-600 active:scale-[0.98]"}`}
              >
                {isSubmitting
                  ? "Publishing..."
                  : moderationWarning
                      ? "Content Blocked - Revise Review"
                      : "Publish Review"}
              </button>
            </form>
          </div>

          <div className="flex-1 bg-gray-900 p-8 md:p-12 text-white">
            <h3 className="text-xl font-bold mb-2">Visuals</h3>
            <p className="text-gray-400 text-sm mb-8 font-medium">Add photos to increase visibility.</p>

            <div className="relative group border-2 border-dashed border-gray-700 rounded-[32px] p-8 text-center hover:border-green-500 hover:bg-gray-800 transition-all cursor-pointer">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  const MAX_FILE_SIZE = 5 * 1024 * 1024;
                  for (const file of files) {
                    if (file.size > MAX_FILE_SIZE) {
                      setError(`${file.name} exceeds 5MB limit`);
                      return;
                    }
                  }
                  setError("");
                  setImages(files);
                  Promise.all(files.map((file) => new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.readAsDataURL(file);
                  }))).then(setPreviews);
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              {error && <p className="text-red-500 mt-2 text-sm font-bold">{error}</p>}
              <div className="text-4xl mb-4">Image</div>
              <p className="text-sm font-bold text-gray-300">Drop images here</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8">
              {previews.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-gray-700">
                  <img src={src} className="w-full h-full object-cover" alt="preview" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WriteReview;
