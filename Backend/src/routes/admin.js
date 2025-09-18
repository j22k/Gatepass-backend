const express = require("express");
const router = express.Router();
const adminHelpers = require("../helpers/adminHelpers");
const validation = require("../utils/validation");
const { requireAuth } = require("../middleware/auth");
const { requirePermission } = require("../middleware/authorize");

// -------------------- Warehouses CRUD --------------------
router.get("/warehouses", requireAuth, requirePermission("warehouse.read"), async (_req, res) => {
  try {
    const warehouses = await adminHelpers.getAllWarehouses();
    res.json({ success: true, message: "Warehouses retrieved successfully", data: warehouses });
  } catch (err) {
    console.error("Error fetching warehouses:", err);
    res.status(500).json({ error: "Internal server error", message: "Failed to retrieve warehouses" });
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
    res.status(201).json({ success: true, message: "Warehouse created successfully", data: warehouse });
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
    const { id } = req.params;
    if (!validation.isValidUUID(id)) {
      return res.status(400).json({ error: "Invalid warehouse ID format" });
    }
    const warehouse = await adminHelpers.getWarehouseById(id);
    if (!warehouse) return res.status(404).json({ error: "Warehouse not found" });
    res.json({ success: true, message: "Warehouse retrieved successfully", data: warehouse });
  } catch (err) {
    console.error("Error fetching warehouse:", err);
    res.status(500).json({ error: "Internal server error", message: "Failed to retrieve warehouse" });
  }
});

router.put("/warehouses/:id", requireAuth, requirePermission("warehouse.update"), async (req, res) => {
  try {
    const { id } = req.params;
    if (!validation.isValidUUID(id)) {
      return res.status(400).json({ error: "Invalid warehouse ID format" });
    }
    const { name, address, timezone } = req.body;
    const warehouse = await adminHelpers.updateWarehouse(id, {
      name,
      address,
      timezone,
      updated_by: req.user.id,
    });
    if (!warehouse) return res.status(404).json({ error: "Warehouse not found" });
    res.json({ success: true, message: "Warehouse updated successfully", data: warehouse });
  } catch (err) {
    console.error("Error updating warehouse:", err);
    res.status(500).json({ error: "Internal server error", message: "Failed to update warehouse" });
  }
});

router.delete("/warehouses/:id", requireAuth, requirePermission("warehouse.delete"), async (req, res) => {
  try {
    const { id } = req.params;
    if (!validation.isValidUUID(id)) {
      return res.status(400).json({ error: "Invalid warehouse ID format" });
    }
    const result = await adminHelpers.deleteWarehouse(id);
    if (!result) return res.status(404).json({ error: "Warehouse not found" });
    res.json({ success: true, message: "Warehouse deleted successfully" });
  } catch (err) {
    console.error("Error deleting warehouse:", err);
    res.status(500).json({ error: "Internal server error", message: "Failed to delete warehouse" });
  }
});

// -------------------- Visitor Types CRUD --------------------
router.get("/visitor-types", requireAuth, requirePermission("visitor_type.read"), async (_req, res) => {
  try {
    const types = await adminHelpers.getAllVisitorTypes();
    res.json({ success: true, message: "Visitor types retrieved successfully", data: types });
  } catch (err) {
    console.error("Error fetching visitor types:", err.message, "Code:", err.code);
    // Handle DB schema errors (e.g., missing 'name' column)
    if (err.code === '42703') {
      return res.status(500).json({ error: "Database schema error", message: "Column 'name' does not exist. Run migrations to fix." });
    }
    res.status(500).json({ error: "Internal server error", message: err.message || "Failed to retrieve visitor types", code: err.code });
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
    res.status(201).json({ success: true, message: "Visitor type created successfully", data: type });
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
    const { id } = req.params;
    if (!validation.isValidUUID(id)) {
      return res.status(400).json({ error: "Invalid visitor type ID format" });
    }
    const type = await adminHelpers.getVisitorTypeById(id);
    if (!type) return res.status(404).json({ error: "Visitor type not found" });
    res.json({ success: true, message: "Visitor type retrieved successfully", data: type });
  } catch (err) {
    console.error("Error fetching visitor type:", err);
    res.status(500).json({ error: "Internal server error", message: "Failed to retrieve visitor type" });
  }
});

router.put("/visitor-types/:id", requireAuth, requirePermission("visitor_type.update"), async (req, res) => {
  try {
    const { id } = req.params;
    if (!validation.isValidUUID(id)) {
      return res.status(400).json({ error: "Invalid visitor type ID format" });
    }
    const { name, description } = req.body;
    const type = await adminHelpers.updateVisitorType(id, {
      name,
      description,
      updated_by: req.user.id,
    });
    if (!type) return res.status(404).json({ error: "Visitor type not found" });
    res.json({ success: true, message: "Visitor type updated successfully", data: type });
  } catch (err) {
    console.error("Error updating visitor type:", err);
    res.status(500).json({ error: "Internal server error", message: "Failed to update visitor type" });
  }
});

router.delete("/visitor-types/:id", requireAuth, requirePermission("visitor_type.delete"), async (req, res) => {
  try {
    const { id } = req.params;
    if (!validation.isValidUUID(id)) {
      return res.status(400).json({ error: "Invalid visitor type ID format" });
    }
    const result = await adminHelpers.deleteVisitorType(id);
    if (!result) return res.status(404).json({ error: "Visitor type not found" });
    res.json({ success: true, message: "Visitor type deleted successfully" });
  } catch (err) {
    console.error("Error deleting visitor type:", err);
    res.status(500).json({ error: "Internal server error", message: "Failed to delete visitor type" });
  }
});

// -------------------- Permissions --------------------
router.get("/permissions", requireAuth, requirePermission("permission.read"), async (_req, res) => {
  try {
    const permissions = await adminHelpers.getAllPermissions();
    res.json({ success: true, message: "Permissions retrieved successfully", data: permissions });
  } catch (err) {
    console.error("Error fetching permissions:", err);
    res.status(500).json({ error: "Internal server error", message: "Failed to retrieve permissions" });
  }
});

// -------------------- Visit Requests CRUD --------------------
router.get("/visit-requests", requireAuth, requirePermission("visit_request.read"), async (_req, res) => {
  try {
    const requests = await adminHelpers.getAllVisitRequests();
    res.json({ success: true, message: "Visit requests retrieved successfully", data: requests });
  } catch (err) {
    console.error("Error fetching visit requests:", err);
    res.status(500).json({ error: "Internal server error", message: "Failed to retrieve visit requests" });
  }
});

router.get("/visit-requests/:id", requireAuth, requirePermission("visit_request.read"), async (req, res) => {
  try {
    const { id } = req.params;
    if (!validation.isValidUUID(id)) {
      return res.status(400).json({ error: "Invalid visit request ID format" });
    }
    const request = await adminHelpers.getVisitRequestById(id);
    if (!request) return res.status(404).json({ error: "Visit request not found" });
    res.json({ success: true, message: "Visit request retrieved successfully", data: request });
  } catch (err) {
    console.error("Error fetching visit request:", err);
    res.status(500).json({ error: "Internal server error", message: "Failed to retrieve visit request" });
  }
});

router.put("/visit-requests/:id", requireAuth, requirePermission("visit_request.update"), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!validation.isValidUUID(id)) {
      return res.status(400).json({ error: "Invalid visit request ID format" });
    }
    
    const validationErrors = [];
    if (status && !['pending', 'approved', 'rejected'].includes(status)) {
      validationErrors.push("status must be 'pending', 'approved', or 'rejected'");
    }
    if (validationErrors.length > 0) {
      return res.status(400).json(validation.createValidationError(validationErrors));
    }
    
    // Check for approve permission if status is changing to approved/rejected
    if (status === 'approved' || status === 'rejected') {
      if (!req.permissions.has('visit_request.approve')) {
        return res.status(403).json({ error: "Forbidden: missing permissions", missing: ["visit_request.approve"] });
      }
    }
    
    const request = await adminHelpers.updateVisitRequest(id, { status, updated_by: req.user.id });
    if (!request) return res.status(404).json({ error: "Visit request not found" });
    res.json({ success: true, message: "Visit request updated successfully", data: request });
  } catch (err) {
    console.error("Error updating visit request:", err);
    res.status(500).json({ error: "Internal server error", message: "Failed to update visit request" });
  }
});

// Note: No DELETE for visit-requests, as migration lacks visit_request.delete permission.

// -------------------- Roles CRUD --------------------
router.get("/roles", requireAuth, requirePermission("role.read"), async (_req, res) => {
  try {
    const roles = await adminHelpers.getAllRoles();
    res.json({ success: true, message: "Roles retrieved successfully", data: roles });
  } catch (err) {
    console.error("Error fetching roles:", err);
    res.status(500).json({ error: "Internal server error", message: "Failed to retrieve roles" });
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
    res.status(201).json({ success: true, message: "Role created successfully", data: role });
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
    res.json({ success: true, message: "Role retrieved successfully", data: role });
  } catch (err) {
    console.error("Error fetching role:", err);
    res.status(500).json({ error: "Internal server error", message: "Failed to retrieve role" });
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
    res.json({ success: true, message: "Role updated successfully", data: role });
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
    res.json({ success: true, message: "Role deleted successfully" });
  } catch (err) {
    console.error("Error deleting role:", err);
    if (err.code === '23503') {
      return res.status(400).json({ error: "Invalid reference", message: "Cannot delete role: it is referenced by existing users" });
    }
    res.status(500).json({ error: "Internal server error", message: "Failed to delete role" });
  }
});

// -------------------- Users CRUD --------------------
router.get("/users", requireAuth, requirePermission("user.read"), async (_req, res) => {
  try {
    const users = await adminHelpers.getAllUsers();
    res.json({ success: true, message: "Users retrieved successfully", data: users });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Internal server error", message: "Failed to retrieve users" });
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
    res.status(201).json({ success: true, message: "User created successfully", data: user });
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
    res.json({ success: true, message: "User retrieved successfully", data: user });
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
    res.json({ success: true, message: "User updated successfully", data: user });
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
    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
