const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { sendOTPEmail } = require("../utils/email");
const {
  buildVerificationExpiryDate,
  buildUserResponse,
  clearVerificationFields,
  ensureVerificationExpiry,
  generateOTP,
  generateToken,
  hasVerificationExpired,
  hasVerifiedEmail,
  setAuthCookie,
} = require("../services/authService");
const {
  clearOtpRecord,
  getOtpRecord,
  getResendCooldown,
  setOtpRecord,
} = require("../services/otpService");

const signup = async (req, res) => {
  try {
    const { fullName, email, role, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();
    const cleanedFullName = fullName?.trim();
    const cleanedRole = role?.trim() || "User";

    if (!normalizedEmail || !password || !cleanedFullName) {
      return res.status(400).json({
        error: "Full name, email and password are required",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let user = await User.findOne({ email: normalizedEmail }).select(
      "+verificationExpiresAt"
    );
    let statusCode = 201;

    if (user && hasVerifiedEmail(user)) {
      return res.status(409).json({ error: "User already exists" });
    }

    if (user && hasVerificationExpired(user)) {
      await user.deleteOne();
      await clearOtpRecord(normalizedEmail);
      user = null;
    }

    if (user) {
      const cooldown = await getResendCooldown(normalizedEmail);
      if (!cooldown.canResend) {
        return res.status(429).json({
          error: `Please wait ${cooldown.retryAfterSeconds} seconds before requesting another OTP.`,
          retryAfterSeconds: cooldown.retryAfterSeconds,
        });
      }

      ensureVerificationExpiry(user);
      user.fullName = cleanedFullName;
      user.role = cleanedRole;
      user.password = hashedPassword;
      await user.save();
      statusCode = 200;
    } else {
      user = await User.create({
        fullName: cleanedFullName,
        email: normalizedEmail,
        role: cleanedRole,
        password: hashedPassword,
        isVerified: false,
        verificationExpiresAt: buildVerificationExpiryDate(),
      });
    }

    const otp = generateOTP();
    await setOtpRecord(normalizedEmail, otp);
    await sendOTPEmail(user.email, otp, user.fullName);

    return res.status(statusCode).json({
      message:
        "Signup successful. Please verify your email with the OTP we sent.",
      email: user.email,
      requiresVerification: true,
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const normalizedEmail = req.body.email?.trim().toLowerCase();
    const otp = String(req.body.otp || "").trim();

    if (!normalizedEmail || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    const user = await User.findOne({ email: normalizedEmail }).select(
      "+verificationExpiresAt"
    );

    if (!user) {
      await clearOtpRecord(normalizedEmail);
      return res.status(404).json({ error: "User not found" });
    }

    if (hasVerifiedEmail(user)) {
      return res
        .status(400)
        .json({ error: "Email already verified. Please log in." });
    }

    if (hasVerificationExpired(user)) {
      await user.deleteOne();
      await clearOtpRecord(normalizedEmail);
      return res.status(410).json({
        error: "Your verification window has expired. Please sign up again.",
      });
    }

    const storedOtp = await getOtpRecord(normalizedEmail);

    if (!storedOtp) {
      return res
        .status(400)
        .json({ error: "OTP expired. Please request a new one." });
    }

    if (storedOtp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    user.isVerified = true;
    clearVerificationFields(user);
    await user.save();
    await clearOtpRecord(normalizedEmail);

    const token = generateToken(user);
    setAuthCookie(res, token);

    return res.json({
      message: "Email verified successfully",
      user: buildUserResponse(user),
      token,
    });
  } catch (err) {
    console.error("Verify OTP error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

const resendOtp = async (req, res) => {
  try {
    const normalizedEmail = req.body.email?.trim().toLowerCase();

    if (!normalizedEmail) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await User.findOne({ email: normalizedEmail }).select(
      "+verificationExpiresAt"
    );

    if (!user) {
      await clearOtpRecord(normalizedEmail);
      return res.status(404).json({ error: "User not found" });
    }

    if (hasVerifiedEmail(user)) {
      return res
        .status(400)
        .json({ error: "This email is already verified. Please log in." });
    }

    if (hasVerificationExpired(user)) {
      await user.deleteOne();
      await clearOtpRecord(normalizedEmail);
      return res.status(410).json({
        error: "Your verification window has expired. Please sign up again.",
      });
    }

    const cooldown = await getResendCooldown(normalizedEmail);
    if (!cooldown.canResend) {
      return res.status(429).json({
        error: `Please wait ${cooldown.retryAfterSeconds} seconds before requesting another OTP.`,
        retryAfterSeconds: cooldown.retryAfterSeconds,
      });
    }

    const otp = generateOTP();
    await setOtpRecord(normalizedEmail, otp);
    await sendOTPEmail(user.email, otp, user.fullName);

    return res.json({
      message: "A new OTP has been sent to your email address.",
      email: user.email,
    });
  } catch (err) {
    console.error("Resend OTP error:", err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email: normalizedEmail }).select(
      "+verificationExpiresAt"
    );

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.password);

    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    ensureVerificationExpiry(user);

    if (hasVerificationExpired(user)) {
      await user.deleteOne();
      await clearOtpRecord(normalizedEmail);
      return res.status(410).json({
        error: "Your verification window has expired. Please sign up again.",
        code: "VERIFICATION_EXPIRED",
      });
    }

    if (user.isVerified === undefined) {
      user.isVerified = true;
      await user.save();
    }

    if (!hasVerifiedEmail(user)) {
      return res.status(403).json({
        error: "Please verify your email before logging in.",
        code: "EMAIL_NOT_VERIFIED",
        email: user.email,
      });
    }

    const token = generateToken(user);
    setAuthCookie(res, token);

    return res.json({
      user: buildUserResponse(user),
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

const me = (req, res) => {
  return res.json({
    user: buildUserResponse(req.user),
  });
};

const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  res.status(200).json({ message: "Logged out successfully" });
};

module.exports = {
  login,
  logout,
  me,
  resendOtp,
  signup,
  verifyOtp,
};
