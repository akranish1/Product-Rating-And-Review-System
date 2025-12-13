import React from "react";
import { useNavigate } from "react-router-dom";

const HomepWriteAreview = () => {
  const navigate = useNavigate();

  return (
        <div className="w-full bg-[#F6E3E7] rounded-3xl p-10 my-15 flex flex-col md:flex-row justify-between items-center gap-10">
     

          {/* Left content */}
          <div className="md:flex-1">
            <h2 className="text-3xl md:text-4xl font-extrabold text-black mb-4">
              Share your experience ✍️
            </h2>

            <p className="text-gray-900 mb-6">
              Your review helps others make better choices and pushes brands to do better.
              Honest opinions build real trust — and it starts with you.
            </p>

            <button
              onClick={() => navigate("/write-review")}
              className="inline-block bg-black text-white px-6 py-2.5 rounded-full shadow-md hover:opacity-95 transition"
            >
              Write a review
            </button>
          </div>

          {/* Right banner card */}
          <div className="md:w-80 self-center md:self-auto">
            <div className="bg-[#fab5c4] text-black p-6 rounded-lg shadow-lg">
              <h3 className="font-semibold text-lg mb-2">
                Your voice matters
              </h3>
              <p className="text-sm text-gray-900 ">
                Reviews stay public, transparent, and help thousands decide with confidence.
              </p>
            </div>
          </div>

        </div>
    
  );
};

export default HomepWriteAreview;
