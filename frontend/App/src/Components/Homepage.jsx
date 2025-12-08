import React, { useEffect, useState } from "react";
import RecentReview from "./RecentReview";
import { useNavigate } from "react-router-dom";

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
    <div className="max-w-5xl mx-auto px-4 py-6">

      <div className="w-full flex items-center justify-center my-10">
      <div className="flex items-center justify-center w-full max-w-4xl">
        <div className="flex-1 border-t border-gray-300"></div>
        <div className="mx-4 px-6 py-2 bg-white border border-gray-300 rounded-full shadow-sm text-sm flex items-center">
          <span className="text-gray-700">Bought something recently?</span>
          <button
            onClick={() => navigate("/write-review")}
            className="text-blue-600 font-medium ml-2 hover:underline flex items-center cursor-pointer"
          >
            Write a review →
          </button>
        </div>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>
    </div>
    <div className="flex gap-3 my-4">
  {["All", "Electronics", "Fashion", "Home", "Books"].map(cat => (
    <button
      key={cat}
      onClick={() => setSelectedCategory(cat)}
      className={`px-4 py-1 rounded-full border 
        ${selectedCategory === cat ? "bg-blue-600 text-white" : "bg-white"}`}
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
      className={`px-4 py-1 rounded-full border 
        ${selectedRating === r ? "bg-yellow-500 text-white" : "bg-white"}`}
    >
      {r === "All" ? "All Ratings" : `${r} Star`}
    </button>
  ))}
</div>


      {/* Recent Reviews */}
      <RecentReview reviews={reviews} />
    </div>
  );
};

export default Home;
