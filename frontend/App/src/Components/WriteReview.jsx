import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const WriteReview = () => {
  const [user, setUser] = useState("");
  const [product, setProduct] = useState("");
  const [category, setCategory] = useState("");
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [images, setImages] = useState([]); // File objects
  const [previews, setPreviews] = useState([]); // data URLs

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const form = new FormData();
      form.append("user", user);
      form.append("product", product);
      form.append("category", category);
      form.append("rating", rating);
      form.append("review", review);

      images.forEach((file) => form.append("images", file));

      await fetch("http://localhost:5000/reviews", {
        method: "POST",
        body: form, // browser sets the correct multipart boundary
      });

      navigate("/"); // redirect back to home
    } catch (err) {
      console.log("Error submitting review:", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded-lg mt-6">
      <button
        onClick={() => navigate('/')}
        className="text-sm text-gray-600 mb-3 hover:text-gray-800 cursor-pointer"
      >
        ← Back to Home
      </button>
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

        <div>
          <label className="block mb-2">Upload Images (optional)</label>

          <input
            type="file"
            accept="image/*"
            multiple
            className="w-full p-2 border rounded cursor-pointer"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              setImages(files);

              // generate previews
              const readers = files.map(
                (file) =>
                  new Promise((res, rej) => {
                    const r = new FileReader();
                    r.onload = () => res(r.result);
                    r.onerror = rej;
                    r.readAsDataURL(file);
                  })
              );
              Promise.all(readers)
                .then((urls) => setPreviews(urls))
                .catch((err) => console.error(err));
            }}
          />

          {images.length > 0 && (
            <p className="text-sm text-gray-600 mt-2">{images.length} image(s) selected</p>
          )}

          {previews.length > 0 && (
            <div className="mt-2 flex gap-2 flex-wrap">
              {previews.map((src, idx) => (
                <div key={idx} className="relative">
                  <img src={src} alt={`preview-${idx}`} className="w-24 h-24 object-cover rounded border" />
                  <button
                    type="button"
                    onClick={() => {
                      const newPreviews = previews.filter((_, i) => i !== idx);
                      const newImages = images.filter((_, i) => i !== idx);
                      setPreviews(newPreviews);
                      setImages(newImages);
                    }}
                    className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
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
