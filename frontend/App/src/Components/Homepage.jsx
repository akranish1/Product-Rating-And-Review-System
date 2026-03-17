import React, { useEffect, useState } from "react";
import RecentReview from "./RecentReview";
import Carousel from "./Carousel";
import HomepBanner from "./HomepBanner";
import HomepWriteAreview from "./HomepWriteAreview";
import HomepTrustBanner from "./HomepTrustBanner";
import Faq from "./Faq";
import { buildApiUrl, readJsonResponse } from "../lib/api";

const Home = () => {
  const [reviews, setReviews] = useState([]);

  // fetch reviews from backend
 useEffect(() => {
  const fetchReviews = async () => {
    try {
      const res = await fetch(buildApiUrl("/reviews"));
      const data = await readJsonResponse(res);

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
