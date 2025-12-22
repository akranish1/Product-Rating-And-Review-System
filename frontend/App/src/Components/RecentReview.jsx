import React from 'react'
import { useNavigate } from 'react-router-dom'
const RecentReview = ({ reviews }) => {
  const navigate = useNavigate();
  const getImageSrc = (img) => {
    if (!img) return null;
    if (typeof img !== 'string') return null;
    if (img.startsWith('data:')) return img;
    if (img.startsWith('http')) return img;
    if (img.startsWith('/')) return `${import.meta.env.VITE_API_URL}${img}`;
    return img;
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h2 className="text-2xl font-semibold mb-4">Recent Reviews</h2>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2">
        {reviews.slice(0, 4).map((item) => (
          <div
            key={item._id}
            role="button"
            onClick={() => navigate(`/review/${item._id}`)}
            className="bg-white shadow p-4 rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition h-full"
          >
            <div className="flex items-center justify-between ">
              <p className="font-medium">{item.user}</p>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-gray-500">{item.time}</p>
                {item.images && item.images[0] && (
                  <img
                    src={getImageSrc(item.images[0])}
                    alt="review-thumb"
                    className="w-12 h-12 object-cover rounded border"
                  />
                )}
              </div>
            </div>

            <p className="text-blue-600 text-sm mt-1">{item.product}</p>

            <div className="flex mt-1">
              {Array.from({ length: item.rating }).map((_, i) => (
                <div
                  key={i}
                  className="inline-flex w-4 h-4 items-center justify-center p-2 border bg-green-600 border-gray-200"
                >
                  <span className=" text-gray-300 text-lg">★</span>
                </div>
              ))}
            </div>

            <p className="text-gray-700 mt-2 text-sm">{item.review}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentReview;