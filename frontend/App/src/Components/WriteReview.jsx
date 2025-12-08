import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const WriteReview = () => {
  const [user, setUser] = useState("");
  const [product, setProduct] = useState("");
  const [category, setCategory] = useState("");
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newReview = {
  id: Date.now(),
  user,
  product,
  category,
  rating: Number(rating),
  review,
  time: "just now",
};

    try {
      await fetch("http://localhost:5000/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReview),
      });

      navigate("/");  // redirect back to home
    } catch (err) {
      console.log("Error submitting review:", err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded-lg mt-6">
      <h2 className="text-2xl font-semibold mb-4">Write a Review</h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          placeholder="Your Name"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />

        <input
          placeholder="Product Name"
          value={product}
          onChange={(e) => setProduct(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">Select Category</option>
          <option value="Electronics">Electronics</option>
          <option value="Fashion">Fashion</option>
          <option value="Home">Home</option>
          <option value="Books">Books</option>
        </select>

        <select
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          className="w-full p-2 border rounded"
        >
          {[1, 2, 3, 4, 5].map(n => (
            <option key={n} value={n}>{n} Star</option>
          ))}
        </select>

        <textarea
          placeholder="Write your review..."
          value={review}
          onChange={(e) => setReview(e.target.value)}
          rows={4}
          className="w-full p-2 border rounded"
          required
        />

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Submit Review
        </button>
      </form>
    </div>
  );
};

export default WriteReview;
