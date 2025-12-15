import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const WriteReview = () => {
  const [product, setProduct] = useState("");
  const [category, setCategory] = useState("");
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const form = new FormData();
      form.append("product", product);
      form.append("category", category);
      form.append("rating", rating);
      form.append("review", review);

      images.forEach((file) => form.append("images", file));

      const token = localStorage.getItem("token"); // 🔐 JWT

      const res = await fetch("http://localhost:5000/write-review", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      if (!res.ok) throw new Error("Failed to submit review");

      navigate("/");
    } catch (err) {
      console.error("Error submitting review:", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded-lg mt-6">
        <button
          onClick={() => navigate("/")}
          className="text-sm text-gray-600 mb-3 hover:text-gray-800"
        >
          ← Back to Home
        </button>

        <h2 className="text-2xl font-semibold mb-4">Write a Review</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            required
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
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n} Star
              </option>
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

          <div>
            <label className="block mb-2">Upload Images (optional)</label>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setImages(files);

                Promise.all(
                  files.map(
                    (file) =>
                      new Promise((res) => {
                        const reader = new FileReader();
                        reader.onload = () => res(reader.result);
                        reader.readAsDataURL(file);
                      })
                  )
                ).then(setPreviews);
              }}
              className="w-full p-2 border rounded"
            />

            {previews.length > 0 && (
              <div className="mt-2 flex gap-2 flex-wrap">
                {previews.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    className="w-24 h-24 object-cover rounded border"
                    alt="preview"
                  />
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Submit Review
          </button>
        </form>
      </div>
    </div>
  );
};

export default WriteReview;
