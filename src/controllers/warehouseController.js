const db = require('../config/database');
const { warehouse } = require('../schema');
const { eq } = require('drizzle-orm');
const { validateUuid } = require('../utils/uuidValidator'); // Import the validator

const warehouseController = {
  /**
   * Retrieves all warehouses.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   */
  async getAllWarehouses(req, res) {
    try {
      const result = await db.select().from(warehouse).where(eq(warehouse.isActive, true)).orderBy(warehouse.name);  // Filter active only
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Error fetching warehouses:', error.message);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  /**
   * Retrieves a warehouse by ID.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   */
  async getWarehouseById(req, res) {
    try {
      const { id } = req.params;
      if (!validateUuid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid ID format' });
      }
      const result = await db
        .select()
        .from(warehouse)
        .where(eq(warehouse.id, id), eq(warehouse.isActive, true))  // Filter active only
        .limit(1);
      if (result.length === 0) {
        return res.status(404).json({ success: false, message: 'Warehouse not found' });
      }
      res.json({ success: true, data: result[0] });
    } catch (error) {
      console.error('Error fetching warehouse:', error.message);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  /**
   * Creates a new warehouse.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   */
  async createWarehouse(req, res) {
    try {
      const { name, location } = req.body;
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ success: false, message: 'Name is required and must be a non-empty string' });
      }
      const result = await db
        .insert(warehouse)
        .values({ name: name.trim(), location, isActive: true })  // Set active on create
        .returning();
      res.status(201).json({ success: true, data: result[0] });
    } catch (error) {
      console.error('Error creating warehouse:', error.message);
      if (error.code === '23505') { // Unique constraint violation
        return res.status(409).json({ success: false, message: 'Warehouse name already exists' });
      }
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  /**
   * Updates a warehouse.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   */
  async updateWarehouse(req, res) {
    try {
      const { id } = req.params;
      if (!validateUuid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid ID format' });
      }
      const { name, location, isActive } = req.body;  // Allow updating isActive
      if (name && (typeof name !== 'string' || name.trim().length === 0)) {
        return res.status(400).json({ success: false, message: 'Name must be a non-empty string' });
      }
      const result = await db
        .update(warehouse)
        .set({ name: name?.trim(), location, isActive })
        .where(eq(warehouse.id, id))
        .returning();
      if (result.length === 0) {
        return res.status(404).json({ success: false, message: 'Warehouse not found' });
      }
      res.json({ success: true, data: result[0] });
    } catch (error) {
      console.error('Error updating warehouse:', error.message);
      if (error.code === '23505') {
        return res.status(409).json({ success: false, message: 'Warehouse name already exists' });
      }
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  /**
   * Disables a warehouse (soft delete).
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   */
  async disableWarehouse(req, res) {
    try {
      const { id } = req.params;
      if (!validateUuid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid ID format' });
      }
      const result = await db
        .update(warehouse)
        .set({ isActive: false })  // Soft delete: disable instead of delete
        .where(eq(warehouse.id, id))
        .returning();
      if (result.length === 0) {
        return res.status(404).json({ success: false, message: 'Warehouse not found' });
      }
      res.json({ success: true, data: result[0] });
    } catch (error) {
      console.error('Error disabling warehouse:', error.message);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  /**
   * Enables a warehouse.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   */
  async enableWarehouse(req, res) {
    try {
      const { id } = req.params;
      if (!validateUuid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid ID format' });
      }
      const result = await db
        .update(warehouse)
        .set({ isActive: true })
        .where(eq(warehouse.id, id))
        .returning();
      if (result.length === 0) {
        return res.status(404).json({ success: false, message: 'Warehouse not found' });
      }
      res.json({ success: true, data: result[0] });
    } catch (error) {
      console.error('Error enabling warehouse:', error.message);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  /**
   * Retrieves all disabled warehouses.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   */
  async getAllDisabledWarehouses(req, res) {
    try {
      const result = await db.select().from(warehouse).where(eq(warehouse.isActive, false)).orderBy(warehouse.name);  // Filter disabled only
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Error fetching disabled warehouses:', error.message);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
};

module.exports = warehouseController;