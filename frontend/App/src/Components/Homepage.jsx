import React, { useEffect, useState } from "react";
import RecentReview from "./RecentReview";
import Carousel from "./Carousel";
import HomepBanner from "./HomepBanner";
import HomepWriteAreview from "./HomepWriteAreview";
import HomepTrustBanner from "./HomepTrustBanner";
import Faq from "./Faq";

const Home = () => {
  const [reviews, setReviews] = useState([]);

  // fetch reviews from backend
 useEffect(() => {
  const fetchReviews = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      if (!import.meta.env.VITE_API_URL) console.warn("VITE_API_URL not defined; defaulting to http://localhost:5000");
      const url = `${baseUrl}/reviews`;

      const res = await fetch(url);
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Expected JSON but received", text);
        throw new Error("Invalid response from server");
      }
      const data = await res.json();

      // backend returns either an array or { total, reviews }
      if (Array.isArray(data)) {
        setReviews(data);
      } else if (data && Array.isArray(data.reviews)) {
        setReviews(data.reviews);
      } else {
        setReviews([]);
      }
    } catch (err) {
      console.log(err);
    }
  };

  fetchReviews();
}, []);



  return (
    <>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
      <div className="mb-6">
        <Carousel />
      </div>

      <HomepWriteAreview />
      <RecentReview reviews={reviews} />
    <div className="pt-10 pb-20">
    <HomepBanner/>
    </div>
      {/* Recent Reviews */}
      <Faq/>
      <HomepTrustBanner/>
    </div>
    </>
  );
};

export default Home;
