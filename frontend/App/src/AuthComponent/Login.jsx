import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const bgImage =
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTWJoDWPExg6e_5FsmJHfozEXqGpZgmr6YtZw&s";

    // ✅ FIXED: real login + redirect
    const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // 🍪 REQUIRED
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.error || 'Login failed');
            setIsLoading(false);
            return;
        }

        // ✅ ONLY store user info (token is in httpOnly cookie)
        localStorage.setItem(
            'currentUser',
            JSON.stringify(data.user)
        );
        localStorage.setItem("isLoggedIn", "true");

        alert('Welcome back!');
        window.location.href = '/';
    } catch (err) {
        console.error('Login error', err);
        alert('Login failed');
    } finally {
        setIsLoading(false);
    }
};


    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-900 relative overflow-hidden font-sans">

            {/* Background */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: `url(${bgImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-[2px]" />
            </div>

            {/* Glass Card */}
            <div className="relative z-10 w-full max-w-md p-8 sm:p-10 bg-white/10 border border-white/20 rounded-3xl backdrop-blur-xl shadow-2xl">

                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-white tracking-tight">Rate<span className="text-green-500">Right</span></h2>
                   
                    
                    <p className="text-blue-200/80 mt-2 text-sm">
                        Review products. Share insights.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Email */}
                    <div className="relative group">
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="peer w-full px-4 py-3.5 rounded-xl bg-black/20 border border-white/10 text-white placeholder-transparent focus:outline-none focus:border-blue-400 focus:bg-black/40 transition-all"
                            placeholder="Email"
                        />
                        <label className="absolute left-2 text-gray-400 text-sm transition-all peer-placeholder-shown:top-3.5 peer-focus:-top-5 peer-focus:text-blue-300 peer-focus:text-xs px-1 pointer-events-none">
                            Email Address
                        </label>
                    </div>

                    {/* Password */}
                    <div className="relative group">
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="peer w-full px-4 py-3.5 rounded-xl bg-black/20 border border-white/10 text-white placeholder-transparent focus:outline-none focus:border-blue-400 focus:bg-black/40 transition-all pr-12"
                            placeholder="Password"
                        />
                        <label className="absolute left-2 text-gray-400 text-sm transition-all peer-placeholder-shown:top-3.5 peer-focus:-top-5 peer-focus:text-blue-300 peer-focus:text-xs px-1 pointer-events-none">
                            Password
                        </label>

                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3.5 text-gray-400 hover:text-white"
                        >
                            👁
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-green-600 to-teal-400 text-white font-semibold transition-all disabled:opacity-70"
                    >
                        {isLoading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-white/10 text-center">
  <p className="text-gray-400 text-sm">
    Don't have an account?{' '}
    <Link to="/auth/signup" className="text-white font-medium hover:underline">
      Sign up for free
    </Link>
  </p>
</div>
            </div>

            <div className="absolute bottom-6 w-full text-center text-white/20 text-xs">
                &copy; 2025 RateRight Inc.
            </div>
        </div>
    );
};

export default Login;
