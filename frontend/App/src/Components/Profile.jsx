import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildApiUrl, buildAssetUrl, readJsonResponse } from "../lib/api";
import {
  clearClientAuth,
  fetchCurrentUser,
  getAuthFetchOptions,
  getStoredUser,
} from "../lib/auth";
import { formatReviewTimestamp } from "../lib/reviewTime";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => getStoredUser());
  const [reviews, setReviews] = useState([]);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    let isActive = true;

    const loadProfileData = async () => {
      try {
        setError("");

        const [userResult, reviewsResponse] = await Promise.all([
          fetchCurrentUser(),
          fetch(buildApiUrl("/reviews/mine"), getAuthFetchOptions()),
        ]);

        if (!isActive) {
          return;
        }

        if (!userResult.ok) {
          clearClientAuth();
          navigate("/auth");
          return;
        }

        setUser(userResult.user);

        if (reviewsResponse.status === 401) {
          clearClientAuth();
          navigate("/auth");
          return;
        }

        const reviewData = await readJsonResponse(reviewsResponse).catch(() => ({
          error: "Failed to load your reviews",
        }));

        if (!reviewsResponse.ok) {
          throw new Error(reviewData.error || "Failed to load your reviews");
        }

        setReviews(reviewData.reviews || []);
      } catch (err) {
        if (isActive) {
          setError(err.message || "Failed to load profile data");
        }
      } finally {
        if (isActive) {
          setLoadingReviews(false);
        }
      }
    };

    void loadProfileData();

    return () => {
      isActive = false;
    };
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await fetch(
        buildApiUrl("/auth/logout"),
        getAuthFetchOptions({
          method: "POST",
        })
      );
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      clearClientAuth();
      navigate("/auth");
    }
  };

  const getImageSrc = (img) => {
    if (!img || typeof img !== "string") {
      return null;
    }

    return buildAssetUrl(img);
  };

  const averageRating = reviews.length
    ? (
        reviews.reduce((sum, item) => sum + (item.rating || 0), 0) /
        reviews.length
      ).toFixed(1)
    : "0.0";
  const hasMoreReviews = reviews.length > 2;
  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 2);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-gray-700 font-sans text-slate-200 antialiased selection:bg-cyan-500/30">
      <div className="fixed left-0 top-0 -z-10 h-full w-full overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-[40%] w-[40%] rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-purple-500/10 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-4xl px-6 pb-12 pt-20">
        <div className="relative mb-6 rounded-[2.5rem] border border-white/10 bg-slate-900/40 p-8 backdrop-blur-2xl transition-all hover:border-white/20 md:p-12">
          <div className="flex flex-col items-center gap-8 md:flex-row md:items-start">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-green-400 to-green-800 opacity-25 blur transition duration-1000" />
              <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-2 border-white/10 bg-slate-950 bg-gradient-to-tr from-green-400 to-green-500 bg-clip-text text-5xl font-black text-transparent">
                {user.fullName?.charAt(0).toUpperCase()}
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-black tracking-tight text-white">
                {user.fullName}
              </h1>
              <p className="mt-1 text-lg font-medium text-slate-400">
                {user.email}
              </p>

              <div className="mt-6 flex flex-wrap justify-center gap-2 md:justify-start">
                <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-green-400">
                  {user.role || "User"}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-slate-400">
                  Early Adopter
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="space-y-6 md:col-span-2">
            <div className="rounded-[2rem] border border-white/10 bg-slate-900/40 p-8 backdrop-blur-xl">
              <h3 className="mb-6 text-lg font-bold text-white">
                Activity Overview
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/5 bg-white/5 p-6 transition-all hover:bg-white/[0.08]">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    Total Reviews
                  </p>
                  <p className="mt-2 text-3xl font-black text-white">
                    {reviews.length}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/5 bg-white/5 p-6 transition-all hover:bg-white/[0.08]">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    Average Rating
                  </p>
                  <p className="mt-2 text-3xl font-black text-cyan-400">
                    {averageRating}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-slate-900/40 p-8 backdrop-blur-xl">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Your Reviews</h3>
                  <p className="text-sm text-slate-400">
                    Everything you have posted appears here.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/write-review")}
                  className="rounded-xl bg-green-500 px-5 py-3 text-sm font-bold text-slate-950 transition-colors hover:bg-green-400"
                >
                  Write New Review
                </button>
              </div>

              {error && (
                <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-200">
                  {error}
                </div>
              )}

              {loadingReviews ? (
                <div className="space-y-4">
                  {[1, 2].map((item) => (
                    <div
                      key={item}
                      className="h-28 animate-pulse rounded-2xl bg-white/5"
                    />
                  ))}
                </div>
              ) : reviews.length ? (
                <div className="space-y-4">
                  {displayedReviews.map((review) => (
                    <div
                      key={review._id}
                      className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 transition-all hover:bg-white/[0.08]"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="mb-3 flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-cyan-300">
                              {review.category}
                            </span>
                            <span className="text-xs font-medium text-slate-500">
                              {formatReviewTimestamp(review)}
                            </span>
                          </div>

                          <h4 className="text-xl font-black text-white">
                            {review.product}
                          </h4>

                          <div className="mt-3 flex gap-1">
                            {Array.from({ length: 5 }).map((_, index) => (
                              <span
                                key={index}
                                className={
                                  index < (review.rating || 0)
                                    ? "text-yellow-400"
                                    : "text-slate-700"
                                }
                              >
                                &#9733;
                              </span>
                            ))}
                          </div>

                          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-300">
                            {review.review}
                          </p>
                        </div>

                        {review.images?.[0] && (
                          <img
                            src={getImageSrc(review.images[0])}
                            alt={review.product}
                            className="h-24 w-full rounded-2xl object-cover md:w-28"
                          />
                        )}
                      </div>

                      <div className="mt-5 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => navigate(`/review/${review._id}`)}
                          className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/10"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(`/review/${review._id}/edit`)}
                          className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/20"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}

                  {hasMoreReviews && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAllReviews((value) => !value)}
                        className="rounded-xl border border-white/15 px-5 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/10"
                      >
                        {showAllReviews
                          ? "Show Less"
                          : `View More (${reviews.length - 2} more)`}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-[1.75rem] border border-dashed border-white/10 bg-white/[0.03] px-6 py-12 text-center">
                  <p className="text-lg font-bold text-white">No reviews yet</p>
                  <p className="mt-2 text-sm text-slate-400">
                    Your posted reviews will show up here once you publish one.
                  </p>
                </div>
              )}
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/40 backdrop-blur-xl">
              <div className="flex cursor-pointer items-center justify-between border-b border-white/5 p-6 transition-colors hover:bg-white/5">
                <span className="font-medium text-slate-300">
                  Security & Privacy
                </span>
                <span className="text-slate-500 transition-transform hover:translate-x-1">
                  &rarr;
                </span>
              </div>
              <div className="flex cursor-pointer items-center justify-between border-b border-white/5 p-6 transition-colors hover:bg-white/5">
                <span className="font-medium text-slate-300">
                  Notification Preferences
                </span>
                <span className="text-slate-500 transition-transform hover:translate-x-1">
                  &rarr;
                </span>
              </div>
              <div
                onClick={handleLogout}
                className="flex cursor-pointer items-center justify-between p-6 transition-colors hover:bg-red-500/10"
              >
                <span className="font-bold text-red-600">Sign Out</span>
                <span className="text-red-800 transition-transform hover:translate-x-1">
                  &#x23FB;
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] bg-red-500 p-8 text-white">
              <h4 className="text-xl font-black leading-tight">
                Upgrade to Premium
              </h4>
              <p className="mt-3 text-sm leading-relaxed text-white/80">
                Unlock advanced analytics and verified reviewer badges.
              </p>
              <button className="mt-6 w-full rounded-xl bg-white py-3 text-sm font-bold text-slate-950 shadow-xl shadow-cyan-900/20 transition-all active:scale-95">
                Learn More
              </button>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-slate-900/40 p-6">
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                Account Status
              </p>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                <span className="text-sm font-bold text-white">
                  Verified Account
                </span>
              </div>
              <p className="mt-4 text-[11px] leading-relaxed text-slate-500">
                Member since:
                <br />
                December 2025
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
