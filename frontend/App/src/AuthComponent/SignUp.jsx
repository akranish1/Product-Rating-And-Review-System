import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildApiUrl, readJsonResponse } from "../lib/api";
import { clearClientAuth } from "../lib/auth";

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: "",
    agreedToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const bgImage =
    "https://ps.w.org/ryviu/assets/banner-1544x500.png?rev=2182075";

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (feedback.message) {
      setFeedback({ type: "", message: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setFeedback({ type: "error", message: "Passwords do not match." });
      return;
    }

    if (!formData.agreedToTerms) {
      setFeedback({
        type: "error",
        message: "Please agree to the terms and privacy policy.",
      });
      return;
    }

    setIsLoading(true);
    setFeedback({ type: "", message: "" });

    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        role: formData.role,
        password: formData.password,
      };

      const res = await fetch(buildApiUrl("/auth/signup"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await readJsonResponse(res);

      if (!res.ok) {
        setFeedback({
          type: "error",
          message: data.error || "Signup failed",
        });
        return;
      }

      clearClientAuth();

      navigate(`/auth/verify-otp?email=${encodeURIComponent(data.email)}`, {
        state: {
          message:
            data.message ||
            "Your account was created. Enter the OTP sent to your email.",
        },
      });
    } catch (err) {
      console.error("Signup error:", err);
      setFeedback({ type: "error", message: "Signup failed" });
    } finally {
      setIsLoading(false);
    }
  };

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
            Create your RateRight profile and verify it with a secure email OTP.
          </p>
        </div>

        {feedback.message ? (
          <div
            className={`mb-5 rounded-2xl border px-4 py-3 text-sm ${
              feedback.type === "error"
                ? "border-red-400/40 bg-red-500/10 text-red-100"
                : "border-emerald-400/40 bg-emerald-500/10 text-emerald-100"
            }`}
          >
            {feedback.message}
          </div>
        ) : null}

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
              Show
            </button>

            <div className="relative group">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                placeholder=" "
                value={formData.password}
                onChange={handleChange}
                className={`${inputBaseClasses} pr-16`}
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
                className={`${inputBaseClasses} pr-16`}
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
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-green-600 to-teal-600 text-white font-bold disabled:opacity-70"
          >
            {isLoading ? "Sending OTP..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
