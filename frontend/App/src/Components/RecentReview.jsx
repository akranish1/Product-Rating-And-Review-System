import React from 'react'
const RecentReview = ({ reviews }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-semibold mb-4">Recent Reviews</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        {reviews.map((item) => (
          <div key={item.id} className="bg-white shadow p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <p className="font-medium">{item.user}</p>
              <p className="text-sm text-gray-500">{item.time}</p>
            </div>

            <p className="text-blue-600 text-sm mt-1">{item.product}</p>

            <div className="flex mt-1">
              {Array.from({ length: item.rating }).map((_, i) => (
                <span key={i} className="text-yellow-500 text-lg">★</span>
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