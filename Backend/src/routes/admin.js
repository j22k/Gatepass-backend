const express = require("express");
const router = express.Router();
const adminHelpers = require("../helpers/adminHelpers");
const validation = require("../utils/validation");
const { requireAuth } = require("../middleware/auth");
const { requirePermission } = require("../middleware/authorize");

// -------------------- Users CRUD --------------------
router.get("/users", requireAuth, requirePermission("user.read"), async (_req, res) => {
  try {
    const users = await adminHelpers.getAllUsers();
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/users", requireAuth, requirePermission("user.create"), async (req, res) => {
  try {
    const { full_name, email, phone, password, role_id, warehouse_id } = req.body;
    
    const validationErrors = [];
    
    // Required field validation
    if (!full_name) validationErrors.push("full_name is required");
    if (!email) validationErrors.push("email is required");
    if (!password) validationErrors.push("password is required");
    if (!role_id) validationErrors.push("role_id is required");
    if (!warehouse_id) validationErrors.push("warehouse_id is required");
    
    // Field validation
    if (full_name && !validation.isValidName(full_name)) {
      validationErrors.push("full_name must be 2-100 characters and contain only letters, spaces, hyphens, and apostrophes");
    }
    
    if (email && !validation.isValidEmail(email)) {
      validationErrors.push("email must be a valid email address");
    }
    
    if (phone && !validation.isValidPhone(phone)) {
      validationErrors.push("phone must be a valid phone number");
    }
    
    if (password && !validation.isStrongPassword(password)) {
      validationErrors.push("password must be at least 8 characters with uppercase, lowercase, number, and special character");
    }
    
    if (role_id && !validation.isValidUUID(role_id)) {
      validationErrors.push("role_id must be a valid UUID");
    }
    
    if (warehouse_id && !validation.isValidUUID(warehouse_id)) {
      validationErrors.push("warehouse_id must be a valid UUID");
    }
    
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: "Validation failed",
        details: validationErrors
      });
    }
    
    const user = await adminHelpers.createUser({
      full_name: validation.sanitizeString(full_name),
      email: validation.sanitizeString(email).toLowerCase(),
      phone: phone ? validation.sanitizeString(phone) : null,
      password,
      role_id,
      warehouse_id,
    });
    res.status(201).json(user);
  } catch (err) {
    console.error("Error creating user:", err);
    if (err.code === '23505' && err.constraint === 'users_email_key') {
      return res.status(400).json({ error: "Email already exists" });
    }
    if (err.code === '23503') {
      return res.status(400).json({ error: "Invalid role_id or warehouse_id" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/users/:id", requireAuth, requirePermission("user.read"), async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!validation.isValidUUID(id)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }
    
    const user = await adminHelpers.getUserById(id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/users/:id", requireAuth, requirePermission("user.update"), async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email, phone, password, is_active, role_id, warehouse_id } = req.body;
    
    if (!validation.isValidUUID(id)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }
    
    const validationErrors = [];
    
    // Field validation (all optional for updates)
    if (full_name && !validation.isValidName(full_name)) {
      validationErrors.push("full_name must be 2-100 characters and contain only letters, spaces, hyphens, and apostrophes");
    }
    
    if (email && !validation.isValidEmail(email)) {
      validationErrors.push("email must be a valid email address");
    }
    
    if (phone && !validation.isValidPhone(phone)) {
      validationErrors.push("phone must be a valid phone number");
    }
    
    if (password && !validation.isStrongPassword(password)) {
      validationErrors.push("password must be at least 8 characters with uppercase, lowercase, number, and special character");
    }
    
    if (is_active !== undefined && typeof is_active !== 'boolean') {
      validationErrors.push("is_active must be a boolean value");
    }
    
    if (role_id && !validation.isValidUUID(role_id)) {
      validationErrors.push("role_id must be a valid UUID");
    }
    
    if (warehouse_id && !validation.isValidUUID(warehouse_id)) {
      validationErrors.push("warehouse_id must be a valid UUID");
    }
    
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: "Validation failed",
        details: validationErrors
      });
    }
    
    const user = await adminHelpers.updateUser(id, {
      full_name: full_name ? validation.sanitizeString(full_name) : undefined,
      email: email ? validation.sanitizeString(email).toLowerCase() : undefined,
      phone: phone ? validation.sanitizeString(phone) : undefined,
      password,
      is_active,
      role_id,
      warehouse_id,
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Error updating user:", err);
    if (err.code === '23505' && err.constraint === 'users_email_key') {
      return res.status(400).json({ error: "Email already exists" });
    }
    if (err.code === '23503') {
      return res.status(400).json({ error: "Invalid role_id or warehouse_id" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/users/:id", requireAuth, requirePermission("user.delete"), async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!validation.isValidUUID(id)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }
    
    const result = await adminHelpers.deleteUser(id);
    if (!result) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -------------------- Roles CRUD --------------------
router.get("/roles", requireAuth, requirePermission("role.read"), async (_req, res) => {
  try {
    const roles = await adminHelpers.getAllRoles();
    res.json(roles);
  } catch (err) {
    console.error("Error fetching roles:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/roles", requireAuth, requirePermission("role.create"), async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const validationErrors = [];
    
    if (!name) validationErrors.push("name is required");
    
    if (name && !validation.isValidText(name, 2, 50)) {
      validationErrors.push("name must be 2-50 characters");
    }
    
    if (description && !validation.isValidText(description, 1, 200)) {
      validationErrors.push("description must be 1-200 characters");
    }
    
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: "Validation failed",
        details: validationErrors
      });
    }
    
    const role = await adminHelpers.createRole({ 
      name: validation.sanitizeString(name), 
      description: description ? validation.sanitizeString(description) : null 
    });
    res.status(201).json(role);
  } catch (err) {
    console.error("Error creating role:", err);
    if (err.code === '23505' && err.constraint === 'roles_name_key') {
      return res.status(400).json({ error: "Role name already exists" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/roles/:id", requireAuth, requirePermission("role.read"), async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!validation.isValidUUID(id)) {
      return res.status(400).json({ error: "Invalid role ID format" });
    }
    
    const role = await adminHelpers.getRoleById(id);
    if (!role) return res.status(404).json({ error: "Role not found" });
    res.json(role);
  } catch (err) {
    console.error("Error fetching role:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/roles/:id", requireAuth, requirePermission("role.update"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    if (!validation.isValidUUID(id)) {
      return res.status(400).json({ error: "Invalid role ID format" });
    }
    
    const validationErrors = [];
    
    if (name && !validation.isValidText(name, 2, 50)) {
      validationErrors.push("name must be 2-50 characters");
    }
    
    if (description && !validation.isValidText(description, 1, 200)) {
      validationErrors.push("description must be 1-200 characters");
    }
    
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: "Validation failed",
        details: validationErrors
      });
    }
    
    const role = await adminHelpers.updateRole(id, { 
      name: name ? validation.sanitizeString(name) : undefined, 
      description: description ? validation.sanitizeString(description) : undefined 
    });
    if (!role) return res.status(404).json({ error: "Role not found" });
    res.json(role);
  } catch (err) {
    console.error("Error updating role:", err);
    if (err.code === '23505' && err.constraint === 'roles_name_key') {
      return res.status(400).json({ error: "Role name already exists" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/roles/:id", requireAuth, requirePermission("role.delete"), async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!validation.isValidUUID(id)) {
      return res.status(400).json({ error: "Invalid role ID format" });
    }
    
    const result = await adminHelpers.deleteRole(id);
    if (!result) return res.status(404).json({ error: "Role not found" });
    res.json({ message: "Role deleted" });
  } catch (err) {
    console.error("Error deleting role:", err);
    if (err.code === '23503') {
      return res.status(400).json({ error: "Cannot delete role: it is referenced by existing users" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

// -------------------- Warehouses CRUD --------------------
router.get("/warehouses", requireAuth, requirePermission("warehouse.read"), async (_req, res) => {
  try {
    const warehouses = await adminHelpers.getAllWarehouses();
    res.json(warehouses);
  } catch (err) {
    console.error("Error fetching warehouses:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/warehouses", requireAuth, requirePermission("warehouse.create"), async (req, res) => {
  try {
    const { name, address, timezone } = req.body;
    
    const validationErrors = [];
    
    if (!name) validationErrors.push("name is required");
    
    if (name && !validation.isValidText(name, 2, 100)) {
      validationErrors.push("name must be 2-100 characters");
    }
    
    if (address && !validation.isValidText(address, 1, 500)) {
      validationErrors.push("address must be 1-500 characters");
    }
    
    if (timezone && !validation.isValidText(timezone, 1, 50)) {
      validationErrors.push("timezone must be 1-50 characters");
    }
    
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: "Validation failed",
        details: validationErrors
      });
    }
    
    const warehouse = await adminHelpers.createWarehouse({
      name: validation.sanitizeString(name),
      address: address ? validation.sanitizeString(address) : null,
      timezone: timezone ? validation.sanitizeString(timezone) : "UTC",
      created_by: req.user.id,
    });
    res.status(201).json(warehouse);
  } catch (err) {
    console.error("Error creating warehouse:", err);
    if (err.code === '23505' && err.constraint === 'warehouses_name_key') {
      return res.status(400).json({ error: "Warehouse name already exists" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/warehouses/:id", requireAuth, requirePermission("warehouse.read"), async (req, res) => {
  try {
    const warehouse = await adminHelpers.getWarehouseById(req.params.id);
    if (!warehouse) return res.status(404).json({ error: "Warehouse not found" });
    res.json(warehouse);
  } catch (err) {
    console.error("Error fetching warehouse:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/warehouses/:id", requireAuth, requirePermission("warehouse.update"), async (req, res) => {
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

router.delete("/warehouses/:id", requireAuth, requirePermission("warehouse.delete"), async (req, res) => {
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
router.get("/visitor-types", requireAuth, requirePermission("visitor_type.read"), async (_req, res) => {
  try {
    const types = await adminHelpers.getAllVisitorTypes();
    res.json(types);
  } catch (err) {
    console.error("Error fetching visitor types:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/visitor-types", requireAuth, requirePermission("visitor_type.create"), async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const validationErrors = [];
    
    if (!name) validationErrors.push("name is required");
    if (!description) validationErrors.push("description is required");
    
    if (name && !validation.isValidText(name, 2, 50)) {
      validationErrors.push("name must be 2-50 characters");
    }
    
    if (description && !validation.isValidText(description, 5, 200)) {
      validationErrors.push("description must be 5-200 characters");
    }
    
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: "Validation failed",
        details: validationErrors
      });
    }
    
    const type = await adminHelpers.createVisitorType({
      name: validation.sanitizeString(name),
      description: validation.sanitizeString(description),
      created_by: req.user.id,
    });
    res.status(201).json(type);
  } catch (err) {
    console.error("Error creating visitor type:", err);
    if (err.code === '23505' && err.constraint === 'visitor_types_name_key') {
      return res.status(400).json({ error: "Visitor type name already exists" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/visitor-types/:id", requireAuth, requirePermission("visitor_type.read"), async (req, res) => {
  try {
    const type = await adminHelpers.getVisitorTypeById(req.params.id);
    if (!type) return res.status(404).json({ error: "Visitor type not found" });
    res.json(type);
  } catch (err) {
    console.error("Error fetching visitor type:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/visitor-types/:id", requireAuth, requirePermission("visitor_type.update"), async (req, res) => {
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

router.delete("/visitor-types/:id", requireAuth, requirePermission("visitor_type.delete"), async (req, res) => {
  try {
    const result = await adminHelpers.deleteVisitorType(req.params.id);
    if (!result) return res.status(404).json({ error: "Visitor type not found" });
    res.json({ message: "Visitor type deleted" });
  } catch (err) {
    console.error("Error deleting visitor type:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// List all permissions
router.get("/permissions", requireAuth, requirePermission("permission.read"), async (_req, res) => {
  try {
    const permissions = await adminHelpers.getAllPermissions();
    res.json(permissions);
  } catch (err) {
    console.error("Error fetching permissions:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
