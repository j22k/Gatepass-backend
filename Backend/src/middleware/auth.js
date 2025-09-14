// middleware/auth.js

// Auth helper: read user id from JWT in Authorization header or X-User-Id (for dev)
const { getUserById, getUserPermissions } = require("../helpers/authHelpers");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

async function requireAuth(req, res, next) {
  try {
    let userId = null;
    // Prefer X-User-Id for dev/testing
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
    const permissions = await getUserPermissions(user.id);
    req.user = user;
    req.permissions = new Set(permissions);
    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { requireAuth };