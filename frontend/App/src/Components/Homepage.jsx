import React, { useEffect, useState } from "react";
import RecentReview from "./RecentReview";
import { useNavigate } from "react-router-dom";
import Carousel from "./Carousel";
import HomepBanner from "./HomepBanner";
import HomepWriteAreview from "./HomepWriteAreview";
import HomepTrustBanner from "./HomepTrustBanner";

const Home = () => {
  const [reviews, setReviews] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedRating, setSelectedRating] = useState("All");
  const navigate = useNavigate();

  // fetch reviews from backend
 useEffect(() => {
  const fetchReviews = async () => {
    try {
      const params = new URLSearchParams();

      if (selectedCategory !== "All") params.append("category", selectedCategory);
      if (selectedRating !== "All") params.append("rating", selectedRating);

      const url = `http://localhost:5000/reviews?${params.toString()}`;

      const res = await fetch(url);
      const data = await res.json();

      setReviews(data);
    } catch (err) {
      console.log(err);
    }
  };

  fetchReviews();
}, [selectedCategory, selectedRating]);



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
      
      <HomepTrustBanner/>
    </div>
    </>
  );
};

export default Home;
