import React, { useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { buildApiUrl, readJsonResponse } from "../lib/api";
import { storeClientSession } from "../lib/auth";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [feedback, setFeedback] = useState(() => ({
    type: location.state?.message ? "info" : "",
    message: location.state?.message || "",
  }));

  useEffect(() => {
    const queryEmail = searchParams.get("email") || "";

    if (queryEmail && queryEmail !== email) {
      setEmail(queryEmail);
    }
  }, [email, searchParams]);

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setFeedback({ type: "error", message: "Enter your email address first." });
      return;
    }

    if (otp.trim().length !== 6) {
      setFeedback({ type: "error", message: "Enter the 6-digit OTP." });
      return;
    }

    setIsSubmitting(true);
    setFeedback({ type: "", message: "" });

    try {
      const res = await fetch(buildApiUrl("/auth/verify-otp"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          otp,
        }),
      });

      const data = await readJsonResponse(res);

      if (!res.ok) {
        setFeedback({
          type: "error",
          message: data.error || "Verification failed",
        });
        return;
      }

      storeClientSession(data);

      setFeedback({
        type: "success",
        message: data.message || "Email verified successfully.",
      });

      setTimeout(() => navigate("/"), 900);
    } catch (err) {
      console.error("Verify OTP error:", err);
      setFeedback({ type: "error", message: "Verification failed" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      setFeedback({ type: "error", message: "Enter your email to resend the OTP." });
      return;
    }

    setIsResending(true);
    setFeedback({ type: "", message: "" });

    try {
      const normalizedEmail = email.trim();
      setSearchParams({ email: normalizedEmail });

      const res = await fetch(buildApiUrl("/auth/resend-otp"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: normalizedEmail }),
      });

      const data = await readJsonResponse(res);

      setFeedback({
        type: res.ok ? "success" : "error",
        message: data.message || data.error || "Unable to resend OTP",
      });
    } catch (err) {
      console.error("Resend OTP error:", err);
      setFeedback({ type: "error", message: "Unable to resend OTP" });
    } finally {
      setIsResending(false);
    }
  };

  const handleOtpChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(digitsOnly);
  };

  return (
    <div className="min-h-screen bg-[#04111f] text-white relative overflow-hidden font-sans">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-10 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute top-24 right-[-40px] h-96 w-96 rounded-full bg-emerald-400/15 blur-3xl" />
        <div className="absolute bottom-[-80px] left-1/3 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_40%),linear-gradient(135deg,_rgba(8,47,73,0.96),_rgba(2,6,23,0.98))]" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/65 shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
            <div className="p-8 sm:p-10 lg:p-12 border-b lg:border-b-0 lg:border-r border-white/10">
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">
                Secure Onboarding
              </p>
              <h1 className="mt-4 text-4xl sm:text-5xl font-semibold leading-tight">
                Verify your
                <span className="block bg-gradient-to-r from-cyan-200 via-emerald-200 to-blue-300 bg-clip-text text-transparent">
                  RateRight account
                </span>
              </h1>
              <p className="mt-6 max-w-xl text-sm sm:text-base leading-7 text-slate-300">
                We sent a 6-digit OTP to your email address. Enter it below to
                activate your profile, unlock login, and start posting reviews.
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm text-slate-400">Code length</p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    6 digits
                  </p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm text-slate-400">OTP validity</p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    10 minutes
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 sm:p-10 lg:p-12">
              <div className="max-w-md mx-auto">
                <p className="text-sm uppercase tracking-[0.3em] text-emerald-200/60">
                  One-Time Password
                </p>
                <h2 className="mt-3 text-2xl font-semibold">Enter your code</h2>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  You can open this page directly later too. Just enter your
                  email and latest OTP.
                </p>

                {feedback.message ? (
                  <div
                    className={`mt-6 rounded-2xl border px-4 py-3 text-sm ${
                      feedback.type === "error"
                        ? "border-red-400/40 bg-red-500/10 text-red-100"
                        : feedback.type === "success"
                          ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-100"
                          : "border-cyan-400/40 bg-cyan-500/10 text-cyan-100"
                    }`}
                  >
                    {feedback.message}
                  </div>
                ) : null}

                <form onSubmit={handleVerify} className="mt-8 space-y-5">
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Email address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none transition focus:border-cyan-300 focus:bg-white/10"
                      placeholder="you@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Verification OTP
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={handleOtpChange}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-center text-2xl tracking-[0.45em] font-mono text-white outline-none transition focus:border-emerald-300 focus:bg-white/10"
                      placeholder="000000"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-emerald-500 px-4 py-3.5 font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSubmitting ? "Verifying..." : "Verify and continue"}
                  </button>
                </form>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isResending}
                    className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isResending ? "Sending..." : "Resend OTP"}
                  </button>
                  <Link
                    to="/auth"
                    className="flex-1 rounded-2xl border border-white/10 px-4 py-3 text-center text-sm font-medium text-slate-300 transition hover:bg-white/5"
                  >
                    Back to login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
