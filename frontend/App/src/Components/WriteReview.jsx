import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { buildApiUrl, buildAssetUrl, readJsonResponse } from "../lib/api";
import { clearClientAuth, getStoredUser } from "../lib/auth";

const WriteReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const currentUser = getStoredUser();

  const [product, setProduct] = useState("");
  const [category, setCategory] = useState("");
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingReview, setIsLoadingReview] = useState(isEditing);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEditing) {
      setIsLoadingReview(false);
      return;
    }

    let isActive = true;

    const fetchReview = async () => {
      try {
        setError("");

        const res = await fetch(buildApiUrl(`/reviews/${id}`), {
          credentials: "include",
        });
        const data = await readJsonResponse(res).catch(() => ({}));

        if (!res.ok) {
          throw new Error(data.error || "Review not found");
        }

        const ownerId =
          typeof data.userId === "object" ? data.userId?._id : data.userId;

        if (!ownerId || currentUser?.id !== ownerId) {
          throw new Error("You can only edit your own review");
        }

        if (!isActive) {
          return;
        }

        setProduct(data.product || "");
        setCategory(data.category || "");
        setRating(data.rating || 5);
        setReview(data.review || "");
        setExistingImages(data.images || []);
      } catch (err) {
        if (isActive) {
          setError(err.message || "Failed to load review");
        }
      } finally {
        if (isActive) {
          setIsLoadingReview(false);
        }
      }
    };

    fetchReview();

    return () => {
      isActive = false;
    };
  }, [currentUser?.id, id, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const form = new FormData();
      form.append("product", product.trim());
      form.append("category", category);
      form.append("rating", Number(rating));
      form.append("review", review.trim());
      images.forEach((file) => form.append("images", file));

      const endpoint = isEditing ? `/reviews/${id}` : "/write-review";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(buildApiUrl(endpoint), {
        method,
        credentials: "include",
        body: form,
      });

      if (res.status === 401) {
        clearClientAuth();
        navigate("/auth");
        return;
      }

      const data = await readJsonResponse(res).catch(() => ({
        error: isEditing ? "Failed to update review" : "Failed to submit review",
      }));

      if (!res.ok) {
        let errorMsg =
          data.error ||
          (isEditing ? "Failed to update review" : "Failed to submit review");

        if (data.details) {
          const details = data.details
            .map((detail) => `${detail.category}: ${detail.message}`)
            .join(", ");
          errorMsg = `${errorMsg}\n\n${details}`;
        }

        throw new Error(errorMsg);
      }

      navigate(isEditing ? `/review/${data.review?._id || id}` : "/");
    } catch (err) {
      setError(err.message || "Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingReview) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] py-12 px-4">
        <div className="max-w-5xl mx-auto rounded-[40px] bg-white p-10 shadow-[0_30px_100px_rgba(15,23,42,0.1)]">
          <p className="text-lg font-semibold text-gray-700">Loading review...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9] py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate(isEditing ? `/review/${id}` : "/")}
          className="mb-8 flex items-center gap-2 text-gray-700 font-bold hover:text-green-600 transition-colors bg-white px-5 py-2.5 rounded-full shadow-sm border border-gray-200"
        >
          <span>&larr;</span> {isEditing ? "Back to Review" : "Back to Discovery"}
        </button>

        <div className="bg-white rounded-[40px] shadow-[0_30px_100px_rgba(15,23,42,0.1)] border border-gray-200 overflow-hidden flex flex-col lg:flex-row">
          <div className="flex-[1.5] p-8 md:p-16">
            <header className="mb-10">
              <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">
                {isEditing ? "Edit Review" : "Write Review"}
              </h1>
              <p className="text-gray-500 font-medium">
                {isEditing
                  ? "Update your review and keep it useful for other readers."
                  : "Be descriptive to help the community."}
              </p>
            </header>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded">
                <p className="text-sm text-red-800 font-medium whitespace-pre-wrap">
                  {error}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="relative">
                <label className="text-xs font-black text-gray-800 uppercase tracking-widest mb-3 block ml-1">
                  Product Name
                </label>
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
                  <label className="text-xs font-black text-gray-800 uppercase tracking-widest mb-3 block ml-1">
                    Category
                  </label>
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
                  <label className="text-xs font-black text-gray-800 uppercase tracking-widest mb-3 block ml-1">
                    Your Rating
                  </label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="w-full px-6 py-5 bg-blue-50 border-2 border-blue-100 rounded-3xl focus:border-green-500 focus:bg-white outline-none font-black text-green-600"
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>
                        {n} Stars {n === 5 ? " - Excellent" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-black text-gray-800 uppercase tracking-widest block ml-1">
                    Detailed Review
                  </label>
                </div>
                <textarea
                  placeholder="What did you like or dislike?"
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  rows={6}
                  className="w-full px-6 py-5 bg-gray-50 border-2 border-gray-100 rounded-3xl focus:border-green-500 focus:bg-white outline-none transition-all text-gray-900 font-medium leading-relaxed resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-5 rounded-3xl font-black text-white uppercase tracking-widest text-sm transition-all shadow-xl ${
                  isSubmitting
                    ? "bg-red-400 cursor-not-allowed"
                    : "bg-gray-900 hover:bg-green-600 active:scale-[0.98]"
                }`}
              >
                {isSubmitting
                  ? isEditing
                    ? "Saving..."
                    : "Publishing..."
                  : isEditing
                    ? "Save Changes"
                    : "Publish Review"}
              </button>
            </form>
          </div>

          <div className="flex-1 bg-gray-900 p-8 md:p-12 text-white">
            <h3 className="text-xl font-bold mb-2">Visuals</h3>
            <p className="text-gray-400 text-sm mb-8 font-medium">
              {isEditing
                ? "Upload new photos only if you want to replace the existing ones."
                : "Add photos to increase visibility."}
            </p>

            <div className="relative group border-2 border-dashed border-gray-700 rounded-[32px] p-8 text-center hover:border-green-500 hover:bg-gray-800 transition-all cursor-pointer">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  const maxFileSize = 5 * 1024 * 1024;

                  for (const file of files) {
                    if (file.size > maxFileSize) {
                      setError(`${file.name} exceeds 5MB limit`);
                      return;
                    }
                  }

                  setError("");
                  setImages(files);
                  Promise.all(
                    files.map(
                      (file) =>
                        new Promise((resolve) => {
                          const reader = new FileReader();
                          reader.onload = () => resolve(reader.result);
                          reader.readAsDataURL(file);
                        })
                    )
                  ).then(setPreviews);
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              {error && <p className="text-red-500 mt-2 text-sm font-bold">{error}</p>}
              <div className="text-4xl mb-4">Image</div>
              <p className="text-sm font-bold text-gray-300">
                {isEditing ? "Replace review images" : "Drop images here"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8">
              {(previews.length ? previews : existingImages).map((src, i) => (
                <div
                  key={i}
                  className="relative aspect-square rounded-2xl overflow-hidden border-2 border-gray-700"
                >
                  <img
                    src={previews.length ? src : buildAssetUrl(src)}
                    className="w-full h-full object-cover"
                    alt="preview"
                  />
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
