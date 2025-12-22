import React, { useState } from 'react';

const SignUp = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: '',
    password: '',
    confirmPassword: '',
    agreedToTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ FIXED: Added the missing handleChange function
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      // If it's a checkbox, use 'checked', otherwise use 'value'
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const bgImage =
    "https://ps.w.org/ryviu/assets/banner-1544x500.png?rev=2182075";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (!formData.agreedToTerms) {
      alert("Please agree to the terms.");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        role: formData.role,
        password: formData.password,
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", 
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Signup failed");
        setIsLoading(false);
        return;
      }

      if (data.user) {
        localStorage.setItem(
          "currentUser",
          JSON.stringify(data.user)
        );
      }

      alert("Account created successfully!");
      window.location.href = "/auth";
    } catch (err) {
      console.error("Signup error:", err);
      alert("Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  // UI styling variables (kept exactly as you provided)
  const labelBaseClasses =
    "absolute left-4 px-1 transition-all duration-200 pointer-events-none rounded";
  const labelFloatingState = "-top-2.5 text-xs text-blue-300 bg-gray-900";
  const labelRestingState =
    "peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:bg-transparent";
  const labelFocusState =
    "peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-blue-400 peer-focus:bg-gray-900";
  const finalLabelClasses = `${labelBaseClasses} ${labelFloatingState} ${labelRestingState} ${labelFocusState}`;

  const inputBaseClasses =
    "peer w-full px-4 py-3.5 rounded-xl bg-black/20 border border-white/10 text-white focus:outline-none focus:border-blue-400 focus:bg-black/40 transition-all placeholder-transparent";

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-900 relative overflow-hidden font-sans py-12">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gray-900/70 backdrop-blur-[3px]" />
      </div>

      <div className="relative z-10 w-full max-w-lg p-8 sm:p-10 bg-white/10 border border-white/20 rounded-3xl backdrop-blur-xl shadow-3xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Create Account
          </h2>
          <p className="text-blue-200/70 mt-2 text-sm">
            Join the RateMaster community today.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative group">
            <input
              type="text"
              name="fullName"
              required
              placeholder=" "
              value={formData.fullName}
              onChange={handleChange}
              className={inputBaseClasses}
            />
            <label className={finalLabelClasses}>Full Name</label>
          </div>

          <div className="relative group">
            <input
              type="email"
              name="email"
              required
              placeholder=" "
              value={formData.email}
              onChange={handleChange}
              className={inputBaseClasses}
            />
            <label className={finalLabelClasses}>Email Address</label>
          </div>

          <div className="relative group">
            <input
              type="text"
              name="role"
              placeholder=" "
              value={formData.role}
              onChange={handleChange}
              className={inputBaseClasses}
            />
            <label className={finalLabelClasses}>
              Job Title / Role (Optional)
            </label>
          </div>

          <div className="space-y-5 relative">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-4 z-20 text-gray-400 hover:text-white"
              tabIndex="-1"
            >
              👁
            </button>

            <div className="relative group">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                placeholder=" "
                value={formData.password}
                onChange={handleChange}
                className={`${inputBaseClasses} pr-12`}
              />
              <label className={finalLabelClasses}>Password</label>
            </div>

            <div className="relative group">
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                required
                placeholder=" "
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`${inputBaseClasses} pr-12`}
              />
              <label className={finalLabelClasses}>Confirm Password</label>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              name="agreedToTerms"
              checked={formData.agreedToTerms}
              onChange={handleChange}
              required
            />
            <span className="text-gray-300 text-sm">
              I agree to the Terms & Privacy Policy
            </span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-green-600 to-teal-600 text-white font-bold"
          >
            {isLoading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUp;