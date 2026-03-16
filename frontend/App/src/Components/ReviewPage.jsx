import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const ReviewPage = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [rating, setRating] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // fixed page size for now
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(null);


  //hook with debounce: refetch whenever filter, search or page changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReviews();
    }, 400); // debounce search/page changes

    return () => clearTimeout(timer);
  }, [category, rating, search, page]);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      setError(null);
      // use environment variable if set, otherwise assume local backend running on 5000
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      if (!import.meta.env.VITE_API_URL) console.warn("VITE_API_URL not defined; defaulting to http://localhost:5000");
      let url = `${baseUrl}/reviews?`;
      if (category) url += `category=${category}&`;
      if (rating) url += `rating=${rating}&`;
      if (search) url += `q=${encodeURIComponent(search)}&`;
      // pagination parameters
      const offset = (page - 1) * limit;
      url += `limit=${limit}&offset=${offset}`;
      const res = await fetch(url);
      // validate JSON response
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Expected JSON but received", text);
        throw new Error("Server returned non-JSON response");
      }
      const data = await res.json();
      // backend now returns { total, reviews }
      setReviews(data.reviews || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [category, rating, search, page, limit]);

  const getImageSrc = (img) => {
    if (!img) return null;
    if (img.startsWith("http")) return img;
    if (img.startsWith("/")) return `${import.meta.env.VITE_API_URL}${img}`;
    return img;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4">
      <div className="max-w-5xl mx-auto">

        {/* --- HEADER & FILTERS --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Platform <span className="text-green-600">Reviews</span>
            </h1>
            <p className="text-slate-500 mt-1 font-medium">
              {reviews.length} insights from our community
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Search reviews..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="bg-white border border-slate-200 text-slate-700 text-sm 
             rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 
             outline-none shadow-sm transition-all"
            />
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="bg-white border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all cursor-pointer"
            >
              <option value="">All Categories</option>
              <option value="Food">Food</option>
              <option value="Fashion">Fashion</option>
              <option value="Electronics">Electronics</option>
            </select>

            <select
              value={rating}
              onChange={(e) => { setRating(e.target.value); setPage(1); }}
              className="bg-white border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all cursor-pointer"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
            </select>

            {(category || rating || search) && (
              <button
                onClick={() => { setCategory(""); setRating(""); setSearch(""); setPage(1); }}
                className="text-sm font-semibold text-slate-400 hover:text-red-500 px-2 transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* --- CONTENT SECTION --- */}
        {/* show error if exists */}
        {error && (
          <div className="mb-6 text-red-600 font-medium text-center">
            {error}
          </div>
        )}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-40 bg-slate-200 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid gap-6">
              {reviews.map((review) => (
                <div
                key={review._id}
                onClick={() => navigate(`/review/${review._id}`)}
                className="group relative bg-white border border-slate-100 rounded-3xl p-6 md:p-8 
                           hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] hover:-translate-y-1 
                           transition-all duration-300 cursor-pointer flex flex-col md:flex-row gap-8 items-start"
              >
                {/* LEFT CONTENT */}
                <div className="flex-1 ">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider rounded-full">
                      {review.category}
                    </span>
                    <span className="text-xs text-slate-400">{review.time}</span>
                  </div>

                  <h2 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-green-600 transition-colors">
                    {review.product}
                  </h2>

                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-lg ${i < (review.rating || 0) ? 'text-yellow-400' : 'text-slate-200'}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>

                  <p className="text-slate-600 leading-relaxed line-clamp-2 mb-6">
                    {review.review}
                  </p>

                  <div className="flex items-center gap-3 pt-6 border-t border-slate-50">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600 text-sm shadow-sm">
                      {review.user?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{review.user}</p>
                      <p className="text-[11px] text-slate-400 uppercase tracking-tighter">Verified Reviewer</p>
                    </div>
                  </div>
                </div>

                {/* RIGHT IMAGE */}
                {review.images?.[0] && (
                  <div className="w-full md:w-44 h-44 shrink-0 rounded-2xl overflow-hidden shadow-sm">
                    <img
                      src={getImageSrc(review.images[0])}
                      alt="Review content"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                )}

                {/* VISUAL ARROW ON HOVER */}
                <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block text-blue-400">
                  →
                </div>
              </div>
            ))}

            {!reviews.length && (
              <div className="text-center py-20">
                <div className="text-4xl mb-4">empty-folder-icon</div>
                <p className="text-slate-500 font-medium">No reviews found matching those filters.</p>
              </div>
            )}
          </div>

          {/* --- PAGINATION CONTROLS --- */}
          {total > limit && (
            <div className="flex justify-between items-center mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-white border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-slate-500">
                Page {page} of {Math.max(1, Math.ceil(total / limit))}
              </span>
              <span className="text-sm text-slate-500">
                &nbsp;| Showing {(page - 1) * limit + 1} – {Math.min((page - 1) * limit + reviews.length, total)} of {total}
              </span>
              <button
                onClick={() => {
                  if (page < Math.ceil(total / limit)) setPage((p) => p + 1);
                }}
                disabled={page >= Math.ceil(total / limit)}
                className="px-4 py-2 bg-white border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
          </>
        )}
      </div>
    </div>
  );
};

export default ReviewPage;