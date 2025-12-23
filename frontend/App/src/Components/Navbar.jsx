import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [isLogged, setIsLogged] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const check = () => {
      const u = localStorage.getItem('currentUser') || localStorage.getItem('user');
      setIsLogged(Boolean(u));
    };
    check();
    window.addEventListener('storage', check);
    return () => window.removeEventListener('storage', check);
  }, []);

 const handleLogout = async () => {
  try {
    await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include", // 🍪 REQUIRED
    });

    // UI cleanup (not security)
    localStorage.removeItem("currentUser");
    localStorage.removeItem("user");

    setIsLogged(false);
    navigate("/auth");
  } catch (err) {
    console.error("Logout failed", err);
  }
};

  // Helper to check active route
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-md text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* LOGO */}
          
          <div className="flex items-center shrink-0">
            <Link to="/" className="text-2xl font-black tracking-tighter hover:opacity-80 transition-opacity">
              Rate<span className="text-green-500">Right</span>
            </Link>
          </div>

          {/* DESKTOP NAVIGATION */}
          <div className="hidden md:flex items-center bg-white/5 border border-white/10 px-2 py-1.5 rounded-full backdrop-blur-sm">
            {[
              { name: 'Home', path: '/' },
              { name: 'About', path: '/about' },
              { name: 'Reviews', path: '/review' },
            ].map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive(item.path) 
                  ? 'bg-white text-black shadow-lg' 
                  : 'hover:text-gray-300'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* ACTION BUTTONS */}
          <div className="hidden md:flex items-center gap-4">
            {isLogged ? (
              <>
                <Link 
                  to="/profile" 
                  className={`text-sm font-medium ${isActive('/profile') ? 'text-blue-400' : 'text-gray-300 hover:text-white'}`}
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-5 py-2 rounded-xl text-sm font-bold border border-red-500/20 transition-all duration-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* MOBILE TOGGLE */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setOpen(!open)}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-300"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {open ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${open ? 'max-h-96 border-t border-white/10' : 'max-h-0'}`}>
        <div className="px-4 py-6 space-y-3 bg-black">
          <Link onClick={() => setOpen(false)} to="/" className="block text-lg font-medium hover:text-blue-500">Home</Link>
          <Link onClick={() => setOpen(false)} to="/about" className="block text-lg font-medium hover:text-blue-500">About</Link>
          <Link onClick={() => setOpen(false)} to="/review" className="block text-lg font-medium hover:text-blue-500">Reviews</Link>
          <hr className="border-white/5 my-4" />
          {isLogged ? (
            <>
              <Link onClick={() => setOpen(false)} to="/profile" className="block text-lg font-medium">Profile</Link>
              <button onClick={() => { setOpen(false); handleLogout(); }} className="w-full text-left text-red-500 text-lg font-medium">Logout</button>
            </>
          ) : (
            <Link onClick={() => setOpen(false)} to="/auth" className="block text-center bg-blue-600 py-3 rounded-xl font-bold">Sign In</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;