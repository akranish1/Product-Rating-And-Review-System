const jwt = require("jsonwebtoken");


const authMiddleware = (req, res, next) => {
  const token = req.cookies?.token; // 🍪 read from cookie

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secret"
    );

    req.user = decoded; // { id, email }
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = authMiddleware;
