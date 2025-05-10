const jwt = require("jsonwebtoken");

// 🛡️ تحقق من التوكن
const authenticateJWT = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({ message: "Missing Authorization header." });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Missing token." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.id || !decoded.role) {
      return res.status(400).json({ message: "Invalid token payload." });
    }

    req.user = {
      id: decoded.id,
      role: decoded.role,
      orphanage_id: decoded.orphanage_id || null,
    };

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(403).json({ message: "Token expired. Please log in again." });
    } else if (err.name === "JsonWebTokenError") {
      return res.status(403).json({ message: "Invalid token." });
    } else {
      return res.status(500).json({ message: "Token verification error." });
    }
  }
};

// 🧩 التحقق من الدور
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied." });
    }
    next();
  };
};

// ✅ اختصار لمشرف دار الأيتام فقط
const verifyOrphanage = [authenticateJWT, authorizeRoles("orphanage")];

module.exports = {
  authenticateJWT,
  authorizeRoles,
  verifyOrphanage,
};
