const express = require("express");
const router = express.Router();
const adminHelpers = require("../helpers/adminHelpers");

// Users
router.get("/users", async (req, res) => {
  try {
    const users = await adminHelpers.getAllUsers();
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/users", async (req, res) => {
  try {
    const user = await adminHelpers.createUser(req.body);
    res.status(201).json(user);
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Warehouses
router.get("/warehouses", async (req, res) => {
  try {
    const warehouses = await adminHelpers.getAllWarehouses();
    res.json(warehouses);
  } catch (err) {
    console.error("Error fetching warehouses:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/warehouses", async (req, res) => {
  try {
    const warehouse = await adminHelpers.createWarehouse(req.body);
    res.status(201).json(warehouse);
  } catch (err) {
    console.error("Error creating warehouse:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Roles
router.get("/roles", async (req, res) => {
  try {
    const roles = await adminHelpers.getAllRoles();
    res.json(roles);
  } catch (err) {
    console.error("Error fetching roles:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/roles", async (req, res) => {
  try {
    const role = await adminHelpers.createRole(req.body);
    res.status(201).json(role);
  } catch (err) {
    console.error("Error creating role:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// CREATE visitor type
router.post("/visitor-types", async (req, res) => {
  try {
    const type = await adminHelpers.createVisitorType(req.body);
    res.status(201).json(type);
  } catch (err) {
    console.error("Error creating visitor type:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// READ all visitor types
router.get("/visitor-types", async (req, res) => {
  try {
    const types = await adminHelpers.getAllVisitorTypes();
    res.status(200).json(types);
  } catch (err) {
    console.error("Error fetching visitor types:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// READ one visitor type
router.get("/visitor-types/:id", async (req, res) => {
  try {
    const type = await adminHelpers.getVisitorTypeById(req.params.id);
    if (!type) {
      return res.status(404).json({ error: "Visitor type not found" });
    }
    res.status(200).json(type);
  } catch (err) {
    console.error("Error fetching visitor type:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// UPDATE visitor type
router.put("/visitor-types/:id", async (req, res) => {
  try {
    const updatedType = await adminHelpers.updateVisitorType(
      req.params.id,
      req.body
    );
    if (!updatedType) {
      return res.status(404).json({ error: "Visitor type not found" });
    }
    res.status(200).json(updatedType);
  } catch (err) {
    console.error("Error updating visitor type:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE visitor type
router.delete("/visitor-types/:id", async (req, res) => {
  try {
    const deletedType = await adminHelpers.deleteVisitorType(req.params.id);
    if (!deletedType) {
      return res.status(404).json({ error: "Visitor type not found" });
    }
    res.status(200).json({ message: "Visitor type deleted successfully" });
  } catch (err) {
    console.error("Error deleting visitor type:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// CREATE warehouse
router.post("/warehouses", async (req, res) => {
  try {
    const warehouse = await adminHelpers.createWarehouse(req.body);
    res.status(201).json(warehouse);
  } catch (err) {
    console.error("Error creating warehouse:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// READ all warehouses
router.get("/warehouses", async (req, res) => {
  try {
    const warehouses = await adminHelpers.getAllWarehouses();
    res.status(200).json(warehouses);
  } catch (err) {
    console.error("Error fetching warehouses:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// READ one warehouse
router.get("/warehouses/:id", async (req, res) => {
  try {
    const warehouse = await adminHelpers.getWarehouseById(req.params.id);
    if (!warehouse) {
      return res.status(404).json({ error: "Warehouse not found" });
    }
    res.status(200).json(warehouse);
  } catch (err) {
    console.error("Error fetching warehouse:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// UPDATE warehouse
router.put("/warehouses/:id", async (req, res) => {
  try {
    const updated = await adminHelpers.updateWarehouse(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: "Warehouse not found" });
    }
    res.status(200).json(updated);
  } catch (err) {
    console.error("Error updating warehouse:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE warehouse
router.delete("/warehouses/:id", async (req, res) => {
  try {
    const deleted = await adminHelpers.deleteWarehouse(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Warehouse not found" });
    }
    res.status(200).json({ message: "Warehouse deleted successfully" });
  } catch (err) {
    console.error("Error deleting warehouse:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});



module.exports = router;
