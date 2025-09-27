const db = require('../config/database');
const { visitorTypes } = require('../schema');
const { eq } = require('drizzle-orm');
const { validateUuid } = require('../utils/uuidValidator'); // Import the validator


const visitortypeController = {
  // Get all visitor types
  async getAllVisitorTypes(req, res) {
    try {
      const result = await db
        .select()
        .from(visitorTypes)
        .orderBy(visitorTypes.name);

      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Get all visitor types error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },


  // Get visitor type by ID
  async getVisitorTypeById(req, res) {
    try {
      const { id } = req.params;
      if (!validateUuid(id)) { // Validate ID format
        return res.status(400).json({ success: false, message: 'Invalid ID format' });
      }
      const result = await db
        .select()
        .from(visitorTypes)
        .where(eq(visitorTypes.id, id))
        .limit(1);

      if (result.length === 0) {
        return res.status(404).json({ success: false, message: 'Visitor type not found' });
      }

      res.json({ success: true, data: result[0] });
    } catch (error) {
      console.error('Get visitor type by ID error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

    // Create a new visitor type
    async createVisitorType(req, res) {
      try {
        const { name, description } = req.body;
        const result = await db
          .insert(visitorTypes)
          .values({ name, description })
          .returning();

        res.status(201).json({ success: true, data: result[0] });
      } catch (error) {
        console.error('Create visitor type error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    },

    // Update a visitor type
    async updateVisitorType(req, res) {
      try {
        const { id } = req.params;
        if (!validateUuid(id)) { // Validate ID format
          return res.status(400).json({ success: false, message: 'Invalid ID format' });
        }
        const { name, description } = req.body;
        const result = await db
          .update(visitorTypes)
          .set({ name, description })
          .where(eq(visitorTypes.id, id))
          .returning();

        if (result.length === 0) {
          return res.status(404).json({ success: false, message: 'Visitor type not found' });
        }

        res.json({ success: true, data: result[0] });
      } catch (error) {
        console.error('Update visitor type error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    },

    // Delete a visitor type
    async deleteVisitorType(req, res) {
      try {
        const { id } = req.params;
        if (!validateUuid(id)) { // Validate ID format
          return res.status(400).json({ success: false, message: 'Invalid ID format' });
        }
        const result = await db
          .delete(visitorTypes)
          .where(eq(visitorTypes.id, id))
          .returning();

        if (result.length === 0) {
          return res.status(404).json({ success: false, message: 'Visitor type not found' });
        }

        res.json({ success: true, data: result[0] });
      } catch (error) {
        console.error('Delete visitor type error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }

};

module.exports = visitortypeController;