const db = require('../config/database');
const { visitorTypes } = require('../schema');
const { eq, and } = require('drizzle-orm');
const { validateUuid } = require('../utils/uuidValidator'); // Import the validator

const visitortypeController = {
  /**
   * Retrieves all visitor types.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   */
  async getAllVisitorTypes(req, res) {
    try {
      const result = await db
        .select()
        .from(visitorTypes)
        .where(eq(visitorTypes.isActive, true))
        .orderBy(visitorTypes.name);  // Filter active only

      res.json({ success: true, message: 'Visitor types fetched successfully', data: result });
    } catch (error) {
      console.error('Error fetching visitor types:', error.message);
      res.status(500).json({ success: false, message: 'Failed to fetch visitor types. Please try again later.' });
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
        return res.status(400).json({ success: false, message: 'Invalid visitor type ID format' });
      }

      const result = await db
        .select()
        .from(visitorTypes)
        .where(and(eq(visitorTypes.id, id), eq(visitorTypes.isActive, true)))
        .limit(1);  // Filter active only

      if (result.length === 0) {
        return res.status(404).json({ success: false, message: 'Visitor type not found' });
      }

      res.json({ success: true, message: 'Visitor type fetched successfully', data: result[0] });
    } catch (error) {
      console.error('Error fetching visitor type:', error.message);
      res.status(500).json({ success: false, message: 'Failed to fetch visitor type. Please try again later.' });
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

      const result = await db
        .insert(visitorTypes)
        .values({ name: name.trim(), description, isActive: true })  // Set active on create
        .returning();

      res.status(201).json({ success: true, message: 'Visitor type created successfully', data: result[0] });
    } catch (error) {
      console.error('Error creating visitor type:', error.message);
      if (error.code === '23505') {
        return res.status(409).json({ success: false, message: 'Visitor type name already exists' });
      }
      res.status(500).json({ success: false, message: 'Failed to create visitor type. Please try again later.' });
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
        return res.status(400).json({ success: false, message: 'Invalid visitor type ID format' });
      }

      const { name, description, isActive } = req.body;
      if (name && (typeof name !== 'string' || name.trim().length === 0)) {
        return res.status(400).json({ success: false, message: 'Name must be a non-empty string' });
      }

      const result = await db
        .update(visitorTypes)
        .set({ name: name?.trim(), description, isActive })
        .where(eq(visitorTypes.id, id))
        .returning();

      if (result.length === 0) {
        return res.status(404).json({ success: false, message: 'Visitor type not found' });
      }

      res.json({ success: true, message: 'Visitor type updated successfully', data: result[0] });
    } catch (error) {
      console.error('Error updating visitor type:', error.message);
      if (error.code === '23505') {
        return res.status(409).json({ success: false, message: 'Visitor type name already exists' });
      }
      res.status(500).json({ success: false, message: 'Failed to update visitor type. Please try again later.' });
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
        return res.status(400).json({ success: false, message: 'Invalid visitor type ID format' });
      }

      const result = await db
        .update(visitorTypes)
        .set({ isActive: false })
        .where(eq(visitorTypes.id, id))
        .returning();  // Soft delete: disable instead of delete

      if (result.length === 0) {
        return res.status(404).json({ success: false, message: 'Visitor type not found' });
      }

      res.json({ success: true, message: 'Visitor type disabled successfully', data: result[0] });
    } catch (error) {
      console.error('Error disabling visitor type:', error.message);
      res.status(500).json({ success: false, message: 'Failed to disable visitor type. Please try again later.' });
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
        return res.status(400).json({ success: false, message: 'Invalid visitor type ID format' });
      }

      const result = await db
        .update(visitorTypes)
        .set({ isActive: true })
        .where(eq(visitorTypes.id, id))
        .returning();

      if (result.length === 0) {
        return res.status(404).json({ success: false, message: 'Visitor type not found' });
      }

      res.json({ success: true, message: 'Visitor type enabled successfully', data: result[0] });
    } catch (error) {
      console.error('Error enabling visitor type:', error.message);
      res.status(500).json({ success: false, message: 'Failed to enable visitor type. Please try again later.' });
    }
  },

  /**
   * Retrieves all disabled visitor types.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   */
  async getAllDisabledVisitorTypes(req, res) {
    try {
      const result = await db
        .select()
        .from(visitorTypes)
        .where(eq(visitorTypes.isActive, false))
        .orderBy(visitorTypes.name);  // Filter disabled only

      res.json({ success: true, message: 'Disabled visitor types fetched successfully', data: result });
    } catch (error) {
      console.error('Error fetching disabled visitor types:', error.message);
      res.status(500).json({ success: false, message: 'Failed to fetch disabled visitor types. Please try again later.' });
    }
  },
};

module.exports = visitortypeController;