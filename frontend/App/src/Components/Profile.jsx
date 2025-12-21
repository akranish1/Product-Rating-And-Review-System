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
    <div className="min-h-screen bg-gray-700 text-slate-200 selection:bg-cyan-500/30 font-sans antialiased overflow-x-hidden">
      {/* 1. Ambient Background Glows */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto pt-20 pb-12 px-6">
        {/* 2. Modern Profile Header Card */}
        <div className="relative group bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 mb-6 transition-all hover:border-white/20">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            
            {/* Avatar with Ring Effect */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-tr from-green-400 to-green-800 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative w-32 h-32 rounded-full bg-slate-950 flex items-center justify-center text-5xl font-black text-transparent bg-clip-text bg-gradient-to-tr from-green-400 to-green-500 border-2 border-white/10">
                {user.fullName?.charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Name and Quick Actions */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-4xl font-black text-white tracking-tight">{user.fullName}</h1>
                  <p className="text-slate-400 mt-1 font-medium text-lg">{user.email}</p>
                </div>
                
              </div>

              {/* Badges */}
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-6">
                <span className="px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest bg-cyan-500/10 text-green-400 border border-cyan-500/20">
                  {user.role || "User"}
                </span>
                <span className="px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest bg-white/5 text-slate-400 border border-white/10">
                  Early Adopter
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Bento Grid Stats & Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main Content Area (Bento Big Card) */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8">
              <h3 className="text-lg font-bold text-white mb-6">Activity Overview</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-all">
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Total Reviews</p>
                  <p className="text-3xl font-black text-white mt-2">24</p>
                </div>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-all">
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Helpful Votes</p>
                  <p className="text-3xl font-black text-cyan-400 mt-2">142</p>
                </div>
              </div>
            </div>

            {/* Account Settings List */}
            <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-colors">
                  <span className="text-slate-300 font-medium">Security & Privacy</span>
                  <span className="text-slate-500 group-hover:translate-x-1 transition-transform">→</span>
                </div>
                <div className="p-6 border-b border-white/5 flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-colors">
                  <span className="text-slate-300 font-medium">Notification Preferences</span>
                  <span className="text-slate-500 group-hover:translate-x-1 transition-transform">→</span>
                </div>
                <div onClick={handleLogout} className="p-6 flex items-center justify-between group cursor-pointer hover:bg-red-500/10 transition-colors">
                  <span className="text-red-600 font-bold">Sign Out</span>
                  <span className="text-red-800 group-hover:translate-x-1 transition-transform">⏻</span>
                </div>
            </div>
          </div>

          {/* Sidebar Area (Bento Small Card) */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br  bg-red-500 rounded-[2rem] p-8 text-white">
              <h4 className="font-black text-xl leading-tight">Upgrade to Premium</h4>
              <p className="text-white/80 text-sm mt-3 leading-relaxed">Unlock advanced analytics and verified reviewer badges.</p>
              <button className="w-full mt-6 py-3 rounded-xl bg-white text-slate-950 font-bold text-sm shadow-xl shadow-cyan-900/20 active:scale-95 transition-all">
                Learn More
              </button>
            </div>

            <div className="bg-slate-900/40 border border-white/10 rounded-[2rem] p-6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Account Status</p>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-bold text-white">Verified Account</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-4 leading-relaxed">Member since: <br/>December 2025</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;