// middleware/auth.js
const { getUserById } = require("../helpers/authHelpers");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

// Require authentication
async function requireAuth(req, res, next) {
  try {
    let userId = null;

    if (req.headers["x-user-id"]) {
      userId = req.headers["x-user-id"];
    } else if (req.headers.authorization) {
      const [scheme, token] = req.headers.authorization.split(" ");
      if (scheme?.toLowerCase() === "bearer" && token) {
        try {
          const payload = jwt.verify(token, JWT_SECRET);
          userId = payload.userId;
        } catch (err) {
          return res.status(401).json({ error: "Unauthorized: invalid or expired token" });
        }
      }
    }

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: missing user identity" });
    }

    const user = await getUserById(userId);
    if (!user || user.is_active === false) {
      return res.status(401).json({ error: "Unauthorized: user not found or inactive" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Require role(s)
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!allowedRoles.includes(req.user.role_name)) {
      return res.status(403).json({ error: "Forbidden: insufficient role" });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
