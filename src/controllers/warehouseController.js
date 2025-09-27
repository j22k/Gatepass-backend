const db = require('../config/database');
const { warehouse } = require('../schema');
const { eq } = require('drizzle-orm');
const { validateUuid } = require('../utils/uuidValidator'); // Import the validator


const warehouseController = {
  // Get all warehouses
  async getAllWarehouses(req, res) {
    try {
      const result = await db
        .select()
        .from(warehouse)
        .orderBy(warehouse.name);

      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Get all warehouses error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Get warehouse by ID
  async getWarehouseById(req, res) {
    try {
      const { id } = req.params;
      if (!validateUuid(id)) { // Validate ID format
        return res.status(400).json({ success: false, message: 'Invalid ID format' });
      }
      const result = await db
        .select()
        .from(warehouse)
        .where(eq(warehouse.id, id))
        .limit(1);

      if (result.length === 0) {
        return res.status(404).json({ success: false, message: 'Warehouse not found' });
      }

      res.json({ success: true, data: result[0] });
    } catch (error) {
      console.error('Get warehouse by ID error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Create a new warehouse
  async createWarehouse(req, res) {
    try {
      const { name, location } = req.body;
      const result = await db
        .insert(warehouse)
        .values({ name, location })
        .returning();

      res.status(201).json({ success: true, data: result[0] });
    } catch (error) {
      console.error('Create warehouse error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Update a warehouse
  async updateWarehouse(req, res) {
    try {
      const { id } = req.params;
      if (!validateUuid(id)) { // Validate ID format
        return res.status(400).json({ success: false, message: 'Invalid ID format' });
      }
      const { name, location } = req.body;
      const result = await db
        .update(warehouse)
        .set({ name, location })
        .where(eq(warehouse.id, id))
        .returning();

      if (result.length === 0) {
        return res.status(404).json({ success: false, message: 'Warehouse not found' });
      }

      res.json({ success: true, data: result[0] });
    } catch (error) {
      console.error('Update warehouse error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Delete a warehouse
  async deleteWarehouse(req, res) {
    try {
      const { id } = req.params;
      if (!validateUuid(id)) { // Validate ID format
        return res.status(400).json({ success: false, message: 'Invalid ID format' });
      }
      const result = await db
        .delete(warehouse)
        .where(eq(warehouse.id, id))
        .returning();

      if (result.length === 0) {
        return res.status(404).json({ success: false, message: 'Warehouse not found' });
      }

      res.json({ success: true, data: result[0] });
    } catch (error) {
      console.error('Delete warehouse error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
};

module.exports = warehouseController;