const jwt = require("jsonwebtoken");
const User = require("../models/User");

const VERIFICATION_EXPIRY_HOURS = 24;
const AUTH_COOKIE_NAME = "authToken";

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const buildVerificationExpiryDate = (baseDate = new Date()) =>
  new Date(baseDate.getTime() + VERIFICATION_EXPIRY_HOURS * 60 * 60 * 1000);

const buildUserResponse = (user) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  isVerified: user.isVerified !== false,
});

const hasVerifiedEmail = (user) => user.isVerified !== false;

const hasVerificationExpired = (user) => {
  if (!user || hasVerifiedEmail(user) || !user.verificationExpiresAt) {
    return false;
  }

  return user.verificationExpiresAt.getTime() <= Date.now();
};

const ensureVerificationExpiry = (user) => {
  if (user && !hasVerifiedEmail(user) && !user.verificationExpiresAt) {
    user.verificationExpiresAt = buildVerificationExpiryDate(
      user.createdAt || new Date()
    );
  }
};

const clearVerificationFields = (user) => {
  user.verificationExpiresAt = null;
};

const generateToken = (user) =>
  jwt.sign(
    {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isVerified: hasVerifiedEmail(user),
    },
    process.env.JWT_SECRET || "secret",
    { expiresIn: "7d" }
  );

const buildAuthCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

const setAuthCookie = (res, token) => {
  res.cookie(AUTH_COOKIE_NAME, token, buildAuthCookieOptions());
};

const clearAuthCookie = (res) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  res.clearCookie(AUTH_COOKIE_NAME, cookieOptions);
  res.clearCookie("token", cookieOptions);
};

const backfillVerificationExpiryDates = async () => {
  const legacyUsers = await User.find({
    isVerified: false,
    $or: [
      { verificationExpiresAt: { $exists: false } },
      { verificationExpiresAt: null },
    ],
  }).select("_id createdAt");

  if (!legacyUsers.length) {
    return;
  }

  await User.bulkWrite(
    legacyUsers.map((user) => ({
      updateOne: {
        filter: { _id: user._id },
        update: {
          $set: {
            verificationExpiresAt: buildVerificationExpiryDate(
              user.createdAt || new Date()
            ),
          },
        },
      },
    }))
  );

  console.log(`Backfilled verification expiry for ${legacyUsers.length} users`);
};

module.exports = {
  AUTH_COOKIE_NAME,
  backfillVerificationExpiryDates,
  buildUserResponse,
  buildVerificationExpiryDate,
  clearAuthCookie,
  clearVerificationFields,
  ensureVerificationExpiry,
  generateToken,
  generateOTP,
  hasVerificationExpired,
  hasVerifiedEmail,
  setAuthCookie,
};
