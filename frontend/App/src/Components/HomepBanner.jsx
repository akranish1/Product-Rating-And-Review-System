export default function HomepBanner() {
  return (
    <div className="w-full bg-green-200 rounded-3xl p-10 flex flex-col md:flex-row items-center justify-between gap-10">
      
      {/* LEFT SECTION */}
      <div className="max-w-md space-y-4">
        <h1 className="text-3xl font-bold text-black">
          Help millions make the right choice
        </h1>

        <p className="text-gray-700">
          Share your experience on Trustpilot, where reviews make a difference.
        </p>

        <div className="flex items-center gap-4 mt-6">

          {/* Login Button */}
          <button className="bg-black text-white px-5 py-2 rounded-full font-medium cursor-pointer">
            Login or Sign up
          </button>

          <div className="w-px h-6 bg-gray-400"></div>

          {/* Icons */}
          <div className="flex items-center gap-3">
            {/* Google */}
            <div className="w-10 h-10 bg-white rounded-full shadow flex items-center justify-center">
              <img src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png" alt="Google" className="w-6" />
            </div>

            {/* Facebook */}
            <div className="w-10 h-10 bg-white rounded-full shadow flex items-center justify-center">
              <img src="https://cdn-icons-png.flaticon.com/512/5968/5968764.png" alt="Facebook" className="w-6" />
            </div>

            {/* Apple */}
            <div className="w-10 h-10 bg-white rounded-full shadow flex items-center justify-center">
              <img src="https://cdn-icons-png.flaticon.com/512/179/179309.png" alt="Apple" className="w-6" />
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
