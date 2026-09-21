const jwt = require("jsonwebtoken");
const { User } = require("../models");

async function protect(req, res, next) {
  try {
    const h = req.headers.authorization || "";
    const t = h.startsWith("Bearer ") ? h.slice(7) : null;

    if (!t) {
      return res.status(401).json({
        message: "Authentication required"
      });
    }

    const d = jwt.verify(t, process.env.JWT_SECRET);

    // Admin login uses the Render environment credentials.
    if (d.id === "admin") {
      req.user = {
        id: "admin",
        _id: "admin",
        name: process.env.ADMIN_USER,
        email: process.env.ADMIN_EMAIL,
        role: "author"
      };

      return next();
    }

    const u = await User.findById(d.id).select("-password");

    if (!u) {
      throw new Error();
    }

    req.user = u;
    next();

  } catch (e) {
    res.status(401).json({
      message: "Invalid or expired session"
    });
  }
}

function authorOnly(req, res, next) {
  req.user?.role === "author"
    ? next()
    : res.status(403).json({
        message: "Author access required"
      });
}

module.exports = {
  protect,
  authorOnly
};