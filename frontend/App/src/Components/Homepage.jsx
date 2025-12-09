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
    <Carousel/>
    <div className="max-w-5xl mx-auto px-4 py-3">
    <HomepWriteAreview/>
    <div className="pt-10 pb-20">
    <HomepBanner/>
    </div>
    
    <div className="flex gap-3 my-4">
  {["All", "Electronics", "Fashion", "Home", "Books"].map(cat => (
    <button
      key={cat}
      onClick={() => setSelectedCategory(cat)}
      className={`px-4 py-1 rounded-full border border-gray-200 
        ${selectedCategory === cat ? "bg-green-600 text-white" : "bg-white"}`}
    >
      {cat}
    </button>
  ))}
</div>
<div className="flex gap-3 my-4">
  {["All", 5, 4, 3, 2, 1].map(r => (
    <button
      key={r}
      onClick={() => setSelectedRating(r)}
      className={`px-4 py-1 rounded-full border border-gray-200 
        ${selectedRating === r ? "bg-green-600 text-white" : "bg-white"}`}
    >
      {r === "All" ? "All Ratings" : `${r} Star`}
    </button>
  ))}
</div>


      {/* Recent Reviews */}
      <RecentReview reviews={reviews} />
      <HomepTrustBanner/>
    </div>
    </>
  );
};

export default Home;
