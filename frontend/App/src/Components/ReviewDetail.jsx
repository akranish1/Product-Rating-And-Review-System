import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { buildApiUrl, buildAssetUrl, readJsonResponse } from "../lib/api";
import {
  clearClientAuth,
  fetchCurrentUser,
  getAuthFetchOptions,
  getStoredUser,
} from "../lib/auth";
import { formatReviewTimestamp } from "../lib/reviewTime";

const ReviewDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const res = await fetch(buildApiUrl(`/reviews/${id}`));
        if (!res.ok) {
          setReview(null);
          return;
        }

        const data = await readJsonResponse(res);
        setReview(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReview();
  }, [id]);

  useEffect(() => {
    if (!currentUser) {
      return undefined;
    }

    let isActive = true;

    fetchCurrentUser()
      .then((result) => {
        if (!isActive) {
          return;
        }

        setCurrentUser(result.ok ? result.user : null);
      })
      .catch(() => {
        if (isActive) {
          setCurrentUser(null);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const getImageSrc = (img) => {
    if (!img || typeof img !== "string") {
      return null;
    }

    return buildAssetUrl(img);
  };

  const ownerId =
    typeof review?.userId === "object" ? review.userId?._id : review?.userId;
  const isOwner = Boolean(currentUser?.id && ownerId && currentUser.id === ownerId);

  const handleDelete = async () => {
    const confirmed = window.confirm("Delete this review permanently?");
    if (!confirmed) {
      return;
    }

    try {
      setIsDeleting(true);
      setActionError("");

      const res = await fetch(
        buildApiUrl(`/reviews/${id}`),
        getAuthFetchOptions({
          method: "DELETE",
        })
      );

      if (res.status === 401) {
        clearClientAuth();
        navigate("/auth");
        return;
      }

      const data = await readJsonResponse(res).catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete review");
      }

      navigate("/review");
    } catch (err) {
      setActionError(err.message || "Failed to delete review");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!review) {
    return (
      <div className="p-6">
        <p>Review not found.</p>
        <button className="mt-4 text-blue-600" onClick={() => navigate(-1)}>
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded-lg mt-6">
        <button
          className="text-sm text-gray-500 mb-4 cursor-pointer"
          onClick={() => navigate(-1)}
        >
          &larr; Back
        </button>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <h1 className="text-2xl font-semibold">Review Details</h1>
          {isOwner && (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate(`/review/${id}/edit`)}
                className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
              >
                Edit Review
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? "Deleting..." : "Delete Review"}
              </button>
            </div>
          )}
        </div>

        {actionError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {actionError}
          </div>
        )}

        <section className="mb-4">
          <h3 className="text-sm font-semibold text-gray-600">Product</h3>
          <p className="text-xl font-medium">{review.product}</p>
        </section>

        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Avg Rating
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {review.productStats?.avgRating?.toFixed
                ? review.productStats.avgRating.toFixed(1)
                : Number(review.productStats?.avgRating || 0).toFixed(1)}
              <span className="ml-1 text-base font-medium text-slate-500">/ 5</span>
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Reviews
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {review.productStats?.totalReviews || 0}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
          <section>
            <h3 className="text-sm font-semibold text-gray-600">Reviewer</h3>
            <p className="font-medium">{review.user}</p>
            <p className="text-sm text-gray-500">
              {formatReviewTimestamp(review)}
            </p>
          </section>

          <section className="text-left sm:text-right">
            <h3 className="text-sm font-semibold text-gray-600">Category</h3>
            <p className="text-sm">{review.category || "-"}</p>

            <h3 className="text-sm font-semibold text-gray-600 mt-3">Rating</h3>
            <div className="flex justify-start sm:justify-end gap-1">
              {Array.from({ length: review.rating || 0 }).map((_, i) => (
                <span key={i} className="text-yellow-400">
                  &#9733;
                </span>
              ))}
            </div>
          </section>
        </div>

        <section className="mb-4">
          <h3 className="text-sm font-semibold text-gray-600">Review</h3>
          <p className="text-gray-700 mt-1">{review.review}</p>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Images</h3>
          {review.images && review.images.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {review.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setCurrentIndex(idx);
                    setIsOpen(true);
                  }}
                  className="p-0"
                  aria-label={`Open image ${idx + 1}`}
                >
                  <img
                    src={getImageSrc(img)}
                    alt={`img-${idx}`}
                    className="w-full h-40 sm:h-44 object-cover rounded cursor-pointer"
                  />
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No images provided.</p>
          )}
        </section>

        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 sm:p-6">
            <div className="relative w-full max-w-4xl h-full sm:h-auto bg-white rounded overflow-hidden shadow-lg">
              <button
                className="absolute top-3 right-3 text-white bg-black/50 rounded px-3 py-1 sm:px-2 sm:py-1 cursor-pointer"
                onClick={() => setIsOpen(false)}
                aria-label="Close image viewer"
              >
                &times;
              </button>

              <div className="flex items-center justify-evenly p-2 bg-gray-100">
                <div className="text-sm font-medium truncate">{review.product}</div>
                <div className="text-sm text-gray-600">
                  {currentIndex + 1} / {review.images.length}
                </div>
              </div>

              <div className="p-2 sm:p-4 h-full sm:h-auto flex items-center justify-center">
                <button
                  className="text-3xl sm:text-4xl mr-2 sm:mr-6 text-gray-700 p-2 bg-white/80 rounded-full shadow-sm"
                  onClick={() =>
                    setCurrentIndex(
                      (i) => (i - 1 + review.images.length) % review.images.length
                    )
                  }
                  aria-label="Previous image"
                >
                  &#8249;
                </button>

                <div className="flex-1 flex items-center justify-center">
                  <img
                    src={getImageSrc(review.images[currentIndex])}
                    alt={`big-${currentIndex}`}
                    className="max-h-[70vh] w-full object-contain"
                  />
                </div>

                <button
                  className="text-3xl sm:text-4xl ml-2 sm:ml-6 text-gray-700 p-2 bg-white/80 rounded-full shadow-sm"
                  onClick={() =>
                    setCurrentIndex((i) => (i + 1) % review.images.length)
                  }
                  aria-label="Next image"
                >
                  &#8250;
                </button>
              </div>

              <div className="p-3 text-center text-sm text-gray-600">
                Tap arrows to navigate images
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewDetail;
