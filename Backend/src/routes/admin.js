const express = require("express");
const router = express.Router();
const adminHelpers = require("../helpers/adminHelpers");
const { requireAuth, requireRole } = require("../middleware/auth");

// -------------------- Users CRUD --------------------
router.get("/users", requireAuth, requireRole("Admin"), async (_req, res) => {
  try {
    const users = await adminHelpers.getAllUsers();
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/users", requireAuth, requireRole("Admin"), async (req, res) => {
  try {
    const { full_name, email, phone, password, role_id, warehouse_id } = req.body;
    if (!full_name || !email || !password || !role_id || !warehouse_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const user = await adminHelpers.createUser({
      full_name,
      email,
      phone,
      password,
      role_id,
      warehouse_id,
    });
    res.status(201).json(user);
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/users/:id", requireAuth, requireRole("Admin"), async (req, res) => {
  try {
    const user = await adminHelpers.getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/users/:id", requireAuth, requireRole("Admin"), async (req, res) => {
  try {
    const { full_name, email, phone, password, is_active, role_id, warehouse_id } = req.body;
    const user = await adminHelpers.updateUser(req.params.id, {
      full_name,
      email,
      phone,
      password,
      is_active,
      role_id,
      warehouse_id,
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/users/:id", requireAuth, requireRole("Admin"), async (req, res) => {
  try {
    const result = await adminHelpers.deleteUser(req.params.id);
    if (!result) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -------------------- Roles CRUD --------------------
router.get("/roles", requireAuth, requireRole("Admin"), async (_req, res) => {
  try {
    const roles = await adminHelpers.getAllRoles();
    res.json(roles);
  } catch (err) {
    console.error("Error fetching roles:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/roles", requireAuth, requireRole("Admin"), async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });
    const role = await adminHelpers.createRole({ name, description });
    res.status(201).json(role);
  } catch (err) {
    console.error("Error creating role:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/roles/:id", requireAuth, requireRole("Admin"), async (req, res) => {
  try {
    const role = await adminHelpers.getRoleById(req.params.id);
    if (!role) return res.status(404).json({ error: "Role not found" });
    res.json(role);
  } catch (err) {
    console.error("Error fetching role:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/roles/:id", requireAuth, requireRole("Admin"), async (req, res) => {
  try {
    const { name, description } = req.body;
    const role = await adminHelpers.updateRole(req.params.id, { name, description });
    if (!role) return res.status(404).json({ error: "Role not found" });
    res.json(role);
  } catch (err) {
    console.error("Error updating role:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/roles/:id", requireAuth, requireRole("Admin"), async (req, res) => {
  try {
    const result = await adminHelpers.deleteRole(req.params.id);
    if (!result) return res.status(404).json({ error: "Role not found" });
    res.json({ message: "Role deleted" });
  } catch (err) {
    console.error("Error deleting role:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -------------------- Warehouses CRUD --------------------
router.get("/warehouses", requireAuth, requireRole("Admin"), async (_req, res) => {
  try {
    const warehouses = await adminHelpers.getAllWarehouses();
    res.json(warehouses);
  } catch (err) {
    console.error("Error fetching warehouses:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/warehouses", requireAuth, requireRole("Admin"), async (req, res) => {
  try {
    const { name, address, timezone } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });
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
});

router.get("/warehouses/:id", requireAuth, requireRole("Admin"), async (req, res) => {
  try {
    const warehouse = await adminHelpers.getWarehouseById(req.params.id);
    if (!warehouse) return res.status(404).json({ error: "Warehouse not found" });
    res.json(warehouse);
  } catch (err) {
    console.error("Error fetching warehouse:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/warehouses/:id", requireAuth, requireRole("Admin"), async (req, res) => {
  try {
    const { name, address, timezone } = req.body;
    const warehouse = await adminHelpers.updateWarehouse(req.params.id, {
      name,
      address,
      timezone,
      updated_by: req.user.id,
    });
    if (!warehouse) return res.status(404).json({ error: "Warehouse not found" });
    res.json(warehouse);
  } catch (err) {
    console.error("Error updating warehouse:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/warehouses/:id", requireAuth, requireRole("Admin"), async (req, res) => {
  try {
    const result = await adminHelpers.deleteWarehouse(req.params.id);
    if (!result) return res.status(404).json({ error: "Warehouse not found" });
    res.json({ message: "Warehouse deleted" });
  } catch (err) {
    console.error("Error deleting warehouse:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -------------------- Visitor Types CRUD --------------------
router.get("/visitor-types", requireAuth, requireRole("Admin"), async (_req, res) => {
  try {
    const types = await adminHelpers.getAllVisitorTypes();
    res.json(types);
  } catch (err) {
    console.error("Error fetching visitor types:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/visitor-types", requireAuth, requireRole("Admin"), async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !description) return res.status(400).json({ error: "Name and description are required" });
    const type = await adminHelpers.createVisitorType({
      name,
      description,
      created_by: req.user.id,
    });
    res.status(201).json(type);
  } catch (err) {
    console.error("Error creating visitor type:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/visitor-types/:id", requireAuth, requireRole("Admin"), async (req, res) => {
  try {
    const type = await adminHelpers.getVisitorTypeById(req.params.id);
    if (!type) return res.status(404).json({ error: "Visitor type not found" });
    res.json(type);
  } catch (err) {
    console.error("Error fetching visitor type:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/visitor-types/:id", requireAuth, requireRole("Admin"), async (req, res) => {
  try {
    const { name, description } = req.body;
    const type = await adminHelpers.updateVisitorType(req.params.id, {
      name,
      description,
      updated_by: req.user.id,
    });
    if (!type) return res.status(404).json({ error: "Visitor type not found" });
    res.json(type);
  } catch (err) {
    console.error("Error updating visitor type:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/visitor-types/:id", requireAuth, requireRole("Admin"), async (req, res) => {
  try {
    const result = await adminHelpers.deleteVisitorType(req.params.id);
    if (!result) return res.status(404).json({ error: "Visitor type not found" });
    res.json({ message: "Visitor type deleted" });
  } catch (err) {
    console.error("Error deleting visitor type:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
