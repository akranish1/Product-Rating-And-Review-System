import React from "react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("currentUser"));

  if (!user) {
    navigate("/auth");
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 text-white">

        {/* Avatar */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-3xl font-bold shadow-lg">
            {user.fullName?.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* User Info */}
        <div className="text-center mt-6">
          <h2 className="text-2xl font-semibold">{user.fullName}</h2>
          <p className="text-gray-300 mt-1">{user.email}</p>

          {user.role && (
            <span className="inline-block mt-3 px-4 py-1 rounded-full text-sm bg-green-500/20 text-green-300">
              {user.role}
            </span>
          )}
        </div>

        {/* Divider */}
        <div className="my-6 border-t border-white/10" />

        {/* Details */}
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Account Status</span>
            <span className="text-green-400">Active</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Logged In</span>
            <span className="text-blue-400">Yes</span>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="mt-8 w-full py-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-400 hover:to-pink-500 transition-all font-semibold shadow-lg"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;
