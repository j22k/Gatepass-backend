const express = require("express");
const router = express.Router();
const visitorHelper = require("../helpers/visitorHelpers");
const { requireAuth } = require("../middleware/auth");
// const { requirePermission } = require("../middleware/authorize");

// As per migration, Visitors only have 'visitor.create' by default.
// If a Visitor needs to read warehouses, grant 'warehouse.read' to their role.

// READ all warehouses (permission: warehouse.read)
router.get(
  "/warehouses",
  // requirePermission("warehouse.read"),
  async (_req, res) => {
    try {
      const warehouses = await visitorHelper.getAllWarehouses();
      res.status(200).json(warehouses);
    } catch (err) {
      console.error("Error fetching warehouses:", err.message);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// READ visitor types for selection when creating a visit.
// If you want to restrict this via permissions, add:
//   requirePermission("visitor_type.read")
// and grant that permission to roles that need it.
router.get(
  "/visitor-types",
  async (_req, res) => {
    try {
      const types = await visitorHelper.getAllVisitorTypes();
      res.status(200).json(types);
    } catch (err) {
      console.error("Error fetching visitor types:", err.message);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

module.exports = router;