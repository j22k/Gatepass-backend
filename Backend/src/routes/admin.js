const express = require("express");
const router = express.Router();

const adminHelpers = require("../helpers/adminHelpers");
const { requireAuth } = require("../middleware/auth");
const { requirePermission, requireAnyPermission } = require("../middleware/authorize");

// -------------------- Users --------------------

// List users (permission: user.read)
router.get(
  "/users",
  requireAuth,
  requirePermission("user.read"),
  async (req, res) => {
    try {
      const users = await adminHelpers.getAllUsers();
      res.json(users);
    } catch (err) {
      console.error("Error fetching users:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Create user (permission: user.create)
// Accepts body: { full_name, email, phone, password, is_active?, roles?: [role_id] }
router.post(
  "/users",
  requireAuth,
  requirePermission("user.create"),
  async (req, res) => {
    try {
      const { full_name, email, phone, password, is_active, roles } = req.body;
      if (!full_name || !email || !password) {
        return res.status(400).json({ error: "full_name, email, and password are required" });
      }
      const user = await adminHelpers.createUser({
        full_name,
        email,
        phone,
        password,
        is_active: typeof is_active === "boolean" ? is_active : true,
      });

      if (Array.isArray(roles) && roles.length) {
        for (const roleId of roles) {
          await adminHelpers.assignRoleToUser(user.id, roleId, req.user.id);
        }
      }

      res.status(201).json(user);
    } catch (err) {
      console.error("Error creating user:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Assign role to a user (permission: user.update)
router.post(
  "/users/:id/roles",
  requireAuth,
  requirePermission("user.update"),
  async (req, res) => {
    try {
      const { role_id } = req.body;
      if (!role_id) {
        return res.status(400).json({ error: "role_id is required" });
      }
      const assigned = await adminHelpers.assignRoleToUser(
        req.params.id,
        role_id,
        req.user.id
      );
      res.status(201).json(assigned);
    } catch (err) {
      console.error("Error assigning role to user:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Get a user's roles (permission: user.read)
router.get(
  "/users/:id/roles",
  requireAuth,
  requirePermission("user.read"),
  async (req, res) => {
    try {
      const roles = await adminHelpers.getUserRoles(req.params.id);
      res.json(roles);
    } catch (err) {
      console.error("Error fetching user roles:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// -------------------- Roles --------------------

// List roles (permission: user.read)
router.get(
  "/roles",
  requireAuth,
  requirePermission("user.read"),
  async (_req, res) => {
    try {
      const roles = await adminHelpers.getAllRoles();
      res.json(roles);
    } catch (err) {
      console.error("Error fetching roles:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Create role (require ability to manage users -> user.update)
router.post(
  "/roles",
  requireAuth,
  requirePermission("user.update"),
  async (req, res) => {
    try {
      const { name, description } = req.body;
      if (!name) {
        return res.status(400).json({ error: "name is required" });
      }
      const role = await adminHelpers.createRole({ name, description });
      res.status(201).json(role);
    } catch (err) {
      console.error("Error creating role:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// -------------------- Warehouses --------------------

// List warehouses (permission: warehouse.read)
router.get(
  "/warehouses",
  requireAuth,
  requirePermission("warehouse.read"),
  async (_req, res) => {
    try {
      const warehouses = await adminHelpers.getAllWarehouses();
      res.json(warehouses);
    } catch (err) {
      console.error("Error fetching warehouses:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Get one warehouse (permission: warehouse.read)
router.get(
  "/warehouses/:id",
  requireAuth,
  requirePermission("warehouse.read"),
  async (req, res) => {
    try {
      const warehouse = await adminHelpers.getWarehouseById(req.params.id);
      if (!warehouse) {
        return res.status(404).json({ error: "Warehouse not found" });
      }
      res.json(warehouse);
    } catch (err) {
      console.error("Error fetching warehouse:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Create warehouse (permission: warehouse.create)
// Body: { name, address, timezone? }
router.post(
  "/warehouses",
  requireAuth,
  requirePermission("warehouse.create"),
  async (req, res) => {
    try {
      const { name, address, timezone } = req.body;
      if (!name) return res.status(400).json({ error: "name is required" });

      const warehouse = await adminHelpers.createWarehouse({
        name,
        address,
        timezone,
        created_by: req.user.id,
      });

      res.status(201).json(warehouse);
    } catch (err) {
      console.error("Error creating warehouse:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Update warehouse (permission: warehouse.update)
router.put(
  "/warehouses/:id",
  requireAuth,
  requirePermission("warehouse.update"),
  async (req, res) => {
    try {
      const updated = await adminHelpers.updateWarehouse(
        req.params.id,
        { ...req.body, updated_by: req.user.id }
      );
      if (!updated) {
        return res.status(404).json({ error: "Warehouse not found" });
      }
      res.json(updated);
    } catch (err) {
      console.error("Error updating warehouse:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Delete warehouse (permission: warehouse.delete)
router.delete(
  "/warehouses/:id",
  requireAuth,
  requirePermission("warehouse.delete"),
  async (req, res) => {
    try {
      const deleted = await adminHelpers.deleteWarehouse(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Warehouse not found" });
      }
      res.json({ message: "Warehouse deleted successfully" });
    } catch (err) {
      console.error("Error deleting warehouse:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// -------------------- Visitor Types (Admin managed) --------------------

// List visitor types (permission: visitor_type.read)
router.get(
  "/visitor-types",
  requireAuth,
  requirePermission("visitor_type.read"),
  async (_req, res) => {
    try {
      const types = await adminHelpers.getAllVisitorTypes();
      res.json(types);
    } catch (err) {
      console.error("Error fetching visitor types:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Get a visitor type (permission: visitor_type.read)
router.get(
  "/visitor-types/:id",
  requireAuth,
  requirePermission("visitor_type.read"),
  async (req, res) => {
    try {
      const type = await adminHelpers.getVisitorTypeById(req.params.id);
      if (!type) return res.status(404).json({ error: "Visitor type not found" });
      res.json(type);
    } catch (err) {
      console.error("Error fetching visitor type:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Create visitor type (permission: visitor_type.create)
router.post(
  "/visitor-types",
  requireAuth,
  requirePermission("visitor_type.create"),
  async (req, res) => {
    try {
      const { name, description } = req.body;
      if (!name || !description) {
        return res.status(400).json({ error: "name and description are required" });
      }
      const created = await adminHelpers.createVisitorType({
        name,
        description,
        created_by: req.user.id,
      });
      res.status(201).json(created);
    } catch (err) {
      console.error("Error creating visitor type:", err);
      if (err.code === "23505") {
        return res.status(409).json({ error: "Visitor type name must be unique" });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Update visitor type (permission: visitor_type.update)
router.put(
  "/visitor-types/:id",
  requireAuth,
  requirePermission("visitor_type.update"),
  async (req, res) => {
    try {
      const { name, description } = req.body;
      const updated = await adminHelpers.updateVisitorType(req.params.id, {
        name,
        description,
        updated_by: req.user.id,
      });
      if (!updated) return res.status(404).json({ error: "Visitor type not found" });
      res.json(updated);
    } catch (err) {
      console.error("Error updating visitor type:", err);
      if (err.code === "23505") {
        return res.status(409).json({ error: "Visitor type name must be unique" });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Delete visitor type (permission: visitor_type.delete)
router.delete(
  "/visitor-types/:id",
  requireAuth,
  requirePermission("visitor_type.delete"),
  async (req, res) => {
    try {
      const deleted = await adminHelpers.deleteVisitorType(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Visitor type not found" });
      res.json({ message: "Visitor type deleted successfully" });
    } catch (err) {
      console.error("Error deleting visitor type:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

module.exports = router;