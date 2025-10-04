const db = require('../config/database');
const { warehouse } = require('../schema');
const { eq, sql } = require('drizzle-orm');  // Added sql to import
const { validateUuid } = require('../utils/uuidValidator'); // Import the validator

const warehouseController = {
  /**
   * Retrieves all warehouses.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   */
  async getAllWarehouses(req, res) {
    try {
      const result = await db
        .select({ id: warehouse.id, name: warehouse.name, location: warehouse.location }) // Select only required fields
        .from(warehouse)
        .where(eq(warehouse.isActive, true))
        .orderBy(warehouse.name);
      res.json({ success: true, message: 'Warehouses retrieved successfully', data: result });
    } catch (error) {
      console.error('Error fetching warehouses:', error.message);
      res.status(500).json({ success: false, message: 'Failed to fetch warehouses. Please try again later.' });
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
        return res.status(400).json({ success: false, message: 'Invalid warehouse ID format' });
      }
      const result = await db
        .select({ id: warehouse.id, name: warehouse.name, location: warehouse.location })
        .from(warehouse)
        .where(eq(warehouse.id, id), eq(warehouse.isActive, true))
        .limit(1);
      if (result.length === 0) {
        return res.status(404).json({ success: false, message: 'Warehouse not found or inactive' });
      }
      res.json({ success: true, message: 'Warehouse retrieved successfully', data: result[0] });
    } catch (error) {
      console.error('Error fetching warehouse:', error.message);
      res.status(500).json({ success: false, message: 'Failed to fetch warehouse. Please try again later.' });
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
        return res.status(400).json({ success: false, message: 'Warehouse name is required and must be a valid string' });
      }
      const result = await db
        .insert(warehouse)
        .values({ name: name.trim(), location, isActive: true })
        .returning();
      res.status(201).json({ success: true, message: 'Warehouse created successfully', data: result[0] });
    } catch (error) {
      console.error('Error creating warehouse:', error.message);
      if (error.code === '23505') {
        return res.status(409).json({ success: false, message: 'Warehouse name already exists. Please use a different name.' });
      }
      res.status(500).json({ success: false, message: 'Failed to create warehouse. Please try again later.' });
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
        return res.status(400).json({ success: false, message: 'Invalid warehouse ID format' });
      }
      const { name, location, isActive } = req.body;
      if (name && (typeof name !== 'string' || name.trim().length === 0)) {
        return res.status(400).json({ success: false, message: 'Warehouse name must be a valid non-empty string' });
      }
      const result = await db
        .update(warehouse)
        .set({ name: name?.trim(), location, isActive })
        .where(eq(warehouse.id, id))
        .returning();
      if (result.length === 0) {
        return res.status(404).json({ success: false, message: 'Warehouse not found' });
      }
      res.json({ success: true, message: 'Warehouse updated successfully', data: result[0] });
    } catch (error) {
      console.error('Error updating warehouse:', error.message);
      if (error.code === '23505') {
        return res.status(409).json({ success: false, message: 'Warehouse name already exists. Please use a different name.' });
      }
      res.status(500).json({ success: false, message: 'Failed to update warehouse. Please try again later.' });
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
        return res.status(400).json({ success: false, message: 'Invalid warehouse ID format' });
      }
      const result = await db
        .update(warehouse)
        .set({ isActive: false })
        .where(eq(warehouse.id, id))
        .returning();
      if (result.length === 0) {
        return res.status(404).json({ success: false, message: 'Warehouse not found' });
      }
      res.json({ success: true, message: 'Warehouse disabled successfully', data: result[0] });
    } catch (error) {
      console.error('Error disabling warehouse:', error.message);
      res.status(500).json({ success: false, message: 'Failed to disable warehouse. Please try again later.' });
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
        return res.status(400).json({ success: false, message: 'Invalid warehouse ID format' });
      }
      const result = await db
        .update(warehouse)
        .set({ isActive: true })
        .where(eq(warehouse.id, id))
        .returning();
      if (result.length === 0) {
        return res.status(404).json({ success: false, message: 'Warehouse not found' });
      }
      res.json({ success: true, message: 'Warehouse enabled successfully', data: result[0] });
    } catch (error) {
      console.error('Error enabling warehouse:', error.message);
      res.status(500).json({ success: false, message: 'Failed to enable warehouse. Please try again later.' });
    }
  },

  /**
   * Retrieves all disabled warehouses.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   */
  async getAllDisabledWarehouses(req, res) {
    try {
      const result = await db
        .select({ id: warehouse.id, name: warehouse.name, location: warehouse.location })
        .from(warehouse)
        .where(eq(warehouse.isActive, false))
        .orderBy(warehouse.name);
      res.json({ success: true, message: 'Disabled warehouses retrieved successfully', data: result });
    } catch (error) {
      console.error('Error fetching disabled warehouses:', error.message);
      res.status(500).json({ success: false, message: 'Failed to fetch disabled warehouses. Please try again later.' });
    }
  },
};

module.exports = warehouseController;