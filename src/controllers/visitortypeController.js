const db = require('../config/database');
const { visitorTypes } = require('../schema');
const { eq } = require('drizzle-orm');
const { validateUuid } = require('../utils/uuidValidator'); // Import the validator

const visitortypeController = {
  /**
   * Retrieves all visitor types.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   */
  async getAllVisitorTypes(req, res) {
    try {
      const result = await db.select().from(visitorTypes).where(eq(visitorTypes.isActive, true)).orderBy(visitorTypes.name);  // Filter active only
      console.log("Result : ",result);
      
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Error fetching visitor types:', error.message);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  /**
   * Retrieves a visitor type by ID.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   */
  async getVisitorTypeById(req, res) {
    try {
      const { id } = req.params;
      if (!validateUuid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid ID format' });
      }
      const result = await db.select().from(visitorTypes).where(eq(visitorTypes.id, id), eq(visitorTypes.isActive, true)).limit(1);  // Filter active only
      if (result.length === 0) {
        return res.status(404).json({ success: false, message: 'Visitor type not found' });
      }
      res.json({ success: true, data: result[0] });
    } catch (error) {
      console.error('Error fetching visitor type:', error.message);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  /**
   * Creates a new visitor type.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   */
  async createVisitorType(req, res) {
    try {
      const { name, description } = req.body;
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ success: false, message: 'Name is required and must be a non-empty string' });
      }
      const result = await db.insert(visitorTypes).values({ name: name.trim(), description, isActive: true }).returning();  // Set active on create
      res.status(201).json({ success: true, data: result[0] });
    } catch (error) {
      console.error('Error creating visitor type:', error.message);
      if (error.code === '23505') {
        return res.status(409).json({ success: false, message: 'Visitor type name already exists' });
      }
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  /**
   * Updates a visitor type.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   */
  async updateVisitorType(req, res) {
    try {
      const { id } = req.params;
      if (!validateUuid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid ID format' });
      }
      const { name, description, isActive } = req.body;  // Allow updating isActive
      if (name && (typeof name !== 'string' || name.trim().length === 0)) {
        return res.status(400).json({ success: false, message: 'Name must be a non-empty string' });
      }
      const result = await db.update(visitorTypes).set({ name: name?.trim(), description, isActive }).where(eq(visitorTypes.id, id)).returning();
      if (result.length === 0) {
        return res.status(404).json({ success: false, message: 'Visitor type not found' });
      }
      res.json({ success: true, data: result[0] });
    } catch (error) {
      console.error('Error updating visitor type:', error.message);
      if (error.code === '23505') {
        return res.status(409).json({ success: false, message: 'Visitor type name already exists' });
      }
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  /**
   * Disables a visitor type (soft delete).
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   */
  async disableVisitorType(req, res) {
    try {
      const { id } = req.params;
      if (!validateUuid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid ID format' });
      }
      const result = await db.update(visitorTypes).set({ isActive: false }).where(eq(visitorTypes.id, id)).returning();  // Soft delete: disable instead of delete
      if (result.length === 0) {
        return res.status(404).json({ success: false, message: 'Visitor type not found' });
      }
      res.json({ success: true, data: result[0] });
    } catch (error) {
      console.error('Error disabling visitor type:', error.message);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  /**
   * Enables a visitor type.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   */
  async enableVisitorType(req, res) {
    try {
      const { id } = req.params;
      if (!validateUuid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid ID format' });
      }
      const result = await db.update(visitorTypes).set({ isActive: true }).where(eq(visitorTypes.id, id)).returning();
      if (result.length === 0) {
        return res.status(404).json({ success: false, message: 'Visitor type not found' });
      }
      res.json({ success: true, data: result[0] });
    } catch (error) {
      console.error('Error enabling visitor type:', error.message);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  /**
   * Retrieves all disabled visitor types.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   */
  async getAllDisabledVisitorTypes(req, res) {
    try {
      const result = await db.select().from(visitorTypes).where(eq(visitorTypes.isActive, false)).orderBy(visitorTypes.name);  // Filter disabled only
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Error fetching disabled visitor types:', error.message);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
};

module.exports = visitortypeController;