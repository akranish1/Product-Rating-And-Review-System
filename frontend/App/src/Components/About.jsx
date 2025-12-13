import React from 'react'
import { Link } from 'react-router-dom'

export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
      <div className="bg-white shadow-xl rounded-4xl overflow-hidden">
        <div className="md:flex md:items-stretch">
          <div className="md:w-2/3 p-12 bg-gradient-to-br from-green-600 to-green-300 text-white">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6">About Our Product Reviews</h1>
            <p className="mb-8 text-indigo-100/90 text-lg">We provide a community-driven platform for honest product ratings and reviews. Our goal is to help shoppers make better decisions through real user experiences and rich media content.</p>
            <ul className="space-y-5">
              <li className="flex items-start">
                <div className="flex-shrink-0 mr-4">
                  <div className="h-12 w-12 md:h-14 md:w-14 rounded-md bg-white/20 flex items-center justify-center text-xl md:text-2xl">⭐</div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg md:text-xl">Authentic Reviews</h3>
                  <p className="text-sm md:text-base text-indigo-100/80">Verified users leave honest feedback with images and ratings.</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 mr-4">
                  <div className="h-12 w-12 md:h-14 md:w-14 rounded-md bg-white/20 flex items-center justify-center text-xl md:text-2xl">🖼️</div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg md:text-xl">Image Rich Reviews</h3>
                  <p className="text-sm md:text-base text-indigo-100/80">Upload multiple images to show real product conditions and details.</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 mr-4">
                  <div className="h-12 w-12 md:h-14 md:w-14 rounded-md bg-white/20 flex items-center justify-center text-xl md:text-2xl">🔒</div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg md:text-xl">Privacy Focused</h3>
                  <p className="text-sm md:text-base text-indigo-100/80">We respect privacy and store only necessary information for reviews.</p>
                </div>
              </li>
            </ul>
          </div>
          <div className="md:w-1/3 p-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">How it Works</h2>
            <ol className="list-decimal list-inside space-y-4 text-gray-700 text-base">
              <li>Write your honest review and rate the product.</li>
              <li>Attach multiple photos to illustrate your experience.</li>
              <li>Submit and see your review published immediately.</li>
            </ol>
            <div className="mt-8">
              <h3 className="font-semibold mb-2">For Businesses</h3>
              <p className="text-sm md:text-base text-gray-600">Brands can engage with customers by responding to reviews and improving products based on feedback.</p>
            </div>
            <div className="mt-10">
              <Link to="/write-review" className="inline-block bg-green-400 text-white px-6 py-3 text-lg rounded-md shadow-lg hover:bg-green-700">Write a Review</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-6">
        <div className="text-center text-sm text-gray-600">
          <span className="font-medium">Made by</span>
          <span className="ml-2">Anish</span>
          <span className="mx-2">•</span>
          <span>Dev</span>
          <span className="mx-2">•</span>
          <span>Rashim</span>
        </div>
      </div>
    </div>
  )
}
