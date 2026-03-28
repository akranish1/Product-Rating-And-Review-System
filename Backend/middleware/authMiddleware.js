const jwt = require("jsonwebtoken");
const User = require("../models/User");

const clearAuthCookie = (res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
};

const rejectAuth = (res, message) => {
  clearAuthCookie(res);
  return res.status(401).json({ error: message });
};

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return rejectAuth(res, "Unauthorized: No token");
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secret"
    );

    const user = await User.findById(decoded.id).select(
      "fullName email role isVerified"
    );

    if (!user) {
      return rejectAuth(res, "User no longer exists");
    }

    if (user.isVerified === false) {
      return rejectAuth(res, "Please verify your email to continue");
    }

    req.user = user;

    return next();
  } catch (err) {
    return rejectAuth(res, "Invalid or expired token");
  }
};

module.exports = authMiddleware;
