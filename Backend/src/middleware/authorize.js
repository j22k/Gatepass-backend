// middleware/authorize.js

function requirePermission(...required) {
  return (req, res, next) => {
    if (!req.permissions) {
      return res.status(500).json({ error: "Permissions not loaded" });
    }
    const missing = required.filter((p) => !req.permissions.has(p));
    if (missing.length > 0) {
      return res.status(403).json({
        error: "Forbidden: missing permissions",
        missing,
      });
    }
    next();
  };
}

function requireAnyPermission(...options) {
  return (req, res, next) => {
    if (!req.permissions) {
      return res.status(500).json({ error: "Permissions not loaded" });
    }
    for (const p of options) {
      if (req.permissions.has(p)) {
        return next();
      }
    }
    return res.status(403).json({
      error: "Forbidden: requires any of the permissions",
      any_of: options,
    });
  };
}

module.exports = { requirePermission, requireAnyPermission };