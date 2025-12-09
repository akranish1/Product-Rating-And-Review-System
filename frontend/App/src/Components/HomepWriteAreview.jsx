import React from 'react'
import { useNavigate } from "react-router-dom";
const HomepWriteAreview = () => {
  return (
    <div>
      
            <div className="w-full flex items-center justify-center my-10">
            <div className="flex items-center justify-center w-full max-w-4xl">
              <div className="flex-1 border-t border-gray-300"></div>
              <div className="mx-4 px-6 py-2 bg-gray-800 border border-gray-300 rounded-full shadow-sm text-sm flex items-center">
                <span className="text-gray-200">Bought something recently?</span>
                <button
                  onClick={() => navigate("/write-review")}
                  className="text-blue-500 font-medium ml-2 hover:underline flex items-center cursor-pointer"
                >
                  Write a review →
                </button>
              </div>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>
          </div>
          
    </div>
  )
}

export default HomepWriteAreview
