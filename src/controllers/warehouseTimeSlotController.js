const db = require('../config/database');
const { warehouseTimeSlots, warehouse, visitorRequest } = require('../schema'); // Add visitorRequest import
const { eq, and } = require('drizzle-orm');
const { validateUuid } = require('../utils/uuidValidator'); // Import the validator

const warehouseTimeSlotController = {
  /**
   * Retrieves all warehouse time slots with joined warehouse data.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   */
  async getAllWarehouseTimeSlots(req, res) {
    try {
      const result = await db
        .select({
          id: warehouseTimeSlots.id,
          name: warehouseTimeSlots.name,
          from: warehouseTimeSlots.from,
          to: warehouseTimeSlots.to,
          warehouseId: warehouseTimeSlots.warehouseId,
          warehouseName: warehouse.name,
        })
        .from(warehouseTimeSlots)
        .leftJoin(warehouse, eq(warehouseTimeSlots.warehouseId, warehouse.id))
        .where(eq(warehouseTimeSlots.isActive, true)) // Filter active only
        .orderBy(warehouseTimeSlots.name);
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Error fetching warehouse time slots:', error.message);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  /**
   * Retrieves a warehouse time slot by ID.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   */
  async getWarehouseTimeSlotById(req, res) {
    try {
      const { id } = req.params;
      if (!validateUuid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid ID format' });
      }
      const result = await db
        .select({
          id: warehouseTimeSlots.id,
          name: warehouseTimeSlots.name,
          from: warehouseTimeSlots.from,
          to: warehouseTimeSlots.to,
          warehouseId: warehouseTimeSlots.warehouseId,
          warehouseName: warehouse.name,
        })
        .from(warehouseTimeSlots)
        .leftJoin(warehouse, eq(warehouseTimeSlots.warehouseId, warehouse.id))
        .where(and(eq(warehouseTimeSlots.id, id), eq(warehouseTimeSlots.isActive, true))) // Filter active only
        .limit(1);
      if (result.length === 0) {
        return res.status(404).json({ success: false, message: 'Warehouse time slot not found' });
      }
      res.json({ success: true, data: result[0] });
    } catch (error) {
      console.error('Error fetching warehouse time slot:', error.message);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  /**
   * Retrieves warehouse time slots by warehouse ID.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   */
  async getWarehouseTimeSlotsByWarehouseId(req, res) {
    try {
      const { warehouseId } = req.params;
      if (!validateUuid(warehouseId)) {
        return res.status(400).json({ success: false, message: 'Invalid warehouse ID format' });
      }
      const [warehouseExists] = await db.select().from(warehouse).where(eq(warehouse.id, warehouseId)).limit(1);
      if (!warehouseExists) {
        return res.status(404).json({ success: false, message: 'Warehouse not found' });
      }
      const result = await db
        .select({
          id: warehouseTimeSlots.id,
          name: warehouseTimeSlots.name,
          from: warehouseTimeSlots.from,
          to: warehouseTimeSlots.to,
          warehouseId: warehouseTimeSlots.warehouseId,
          warehouseName: warehouse.name,
        })
        .from(warehouseTimeSlots)
        .leftJoin(warehouse, eq(warehouseTimeSlots.warehouseId, warehouse.id))
        .where(and(eq(warehouseTimeSlots.warehouseId, warehouseId), eq(warehouseTimeSlots.isActive, true))) // Filter active only
        .orderBy(warehouseTimeSlots.name);
      if (result.length === 0) {
        return res.status(404).json({ success: false, message: 'No active time slots found for this warehouse' });
      }
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Error fetching warehouse time slots by warehouse ID:', error.message);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  /**
   * Creates a new warehouse time slot.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   */
  async createWarehouseTimeSlot(req, res) {
    try {
      const { name, from, to, warehouseId } = req.body;
      if (!validateUuid(warehouseId)) {
        return res.status(400).json({ success: false, message: 'Invalid warehouse ID format' });
      }
      const [warehouseExists] = await db.select().from(warehouse).where(eq(warehouse.id, warehouseId)).limit(1);
      if (!warehouseExists) {
        return res.status(400).json({ success: false, message: 'Warehouse not found' });
      }
      // Validate time slot does not overlap
      const existingSlots = await db.select().from(warehouseTimeSlots).where(and(eq(warehouseTimeSlots.warehouseId, warehouseId), eq(warehouseTimeSlots.isActive, true)));
      for (const slot of existingSlots) {
        if ((from < slot.to && to > slot.from)) {
          return res.status(409).json({ success: false, message: 'Time slot overlaps with an existing slot' });
        }
      }
      // Ensure from < to
      if (from >= to) {
        return res.status(400).json({ success: false, message: 'Start time must be before end time' });
      }
      const result = await db
        .insert(warehouseTimeSlots)
        .values({ name, from, to, warehouseId, isActive: true }) // Set active on create
        .returning({
          id: warehouseTimeSlots.id,
          name: warehouseTimeSlots.name,
          from: warehouseTimeSlots.from,
          to: warehouseTimeSlots.to,
          warehouseId: warehouseTimeSlots.warehouseId,
        });
      res.status(201).json({ success: true, data: result[0] });
    } catch (error) {
      console.error('Error creating warehouse time slot:', error.message);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  /**
   * Creates a warehouse time slot by warehouse ID.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   */
  async createWarehouseTimeSlotByWarehouseId(req, res) {
    try {
      const { warehouseId } = req.params;
      const { name, from, to } = req.body;
      if (!validateUuid(warehouseId)) {
        return res.status(400).json({ success: false, message: 'Invalid warehouse ID format' });
      }
      const [warehouseExists] = await db.select().from(warehouse).where(eq(warehouse.id, warehouseId)).limit(1);
      if (!warehouseExists) {
        return res.status(400).json({ success: false, message: 'Warehouse not found' });
      }
      // Validate time slot does not overlap
      const existingSlots = await db.select().from(warehouseTimeSlots).where(and(eq(warehouseTimeSlots.warehouseId, warehouseId), eq(warehouseTimeSlots.isActive, true)));
      for (const slot of existingSlots) {
        if ((from < slot.to && to > slot.from)) {
          return res.status(409).json({ success: false, message: 'Time slot overlaps with an existing slot' });
        }
      }
      // Ensure from < to
      if (from >= to) {
        return res.status(400).json({ success: false, message: 'Start time must be before end time' });
      }
      const result = await db
        .insert(warehouseTimeSlots)
        .values({ name, from, to, warehouseId, isActive: true }) // Set active on create
        .returning({
          id: warehouseTimeSlots.id,
          name: warehouseTimeSlots.name,
          from: warehouseTimeSlots.from,
          to: warehouseTimeSlots.to,
          warehouseId: warehouseTimeSlots.warehouseId,
        });
      res.status(201).json({ success: true, data: result[0] });
    } catch (error) {
      console.error('Error creating warehouse time slot by warehouse ID:', error.message);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  /**
   * Updates a warehouse time slot.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   */
  async updateWarehouseTimeSlot(req, res) {
    try {
      const { id } = req.params;
      if (!validateUuid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid ID format' });
      }
      const { name, from, to, warehouseId, isActive } = req.body; // Allow updating isActive
      if (warehouseId && !validateUuid(warehouseId)) {
        return res.status(400).json({ success: false, message: 'Invalid warehouse ID format' });
      }
      if (warehouseId) {
        const [warehouseExists] = await db.select().from(warehouse).where(eq(warehouse.id, warehouseId)).limit(1);
        if (!warehouseExists) {
          return res.status(400).json({ success: false, message: 'Warehouse not found' });
        }
      }
      const result = await db
        .update(warehouseTimeSlots)
        .set({ name, from, to, warehouseId, isActive })
        .where(eq(warehouseTimeSlots.id, id))
        .returning();
      if (result.length === 0) {
        return res.status(404).json({ success: false, message: 'Warehouse time slot not found' });
      }
      res.json({ success: true, data: result[0] });
    } catch (error) {
      console.error('Error updating warehouse time slot:', error.message);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  /**
   * Disables a warehouse time slot (soft delete).
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   */
  async deleteWarehouseTimeSlot(req, res) {
    try {
      const { id } = req.params;
      if (!validateUuid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid ID format' });
      }

      const result = await db
        .update(warehouseTimeSlots)
        .set({ isActive: false }) // Soft delete: disable instead of delete
        .where(eq(warehouseTimeSlots.id, id))
        .returning();
      if (result.length === 0) {
        return res.status(404).json({ success: false, message: 'Warehouse time slot not found' });
      }
      res.json({ success: true, data: result[0] });
    } catch (error) {
      console.error('Error disabling warehouse time slot:', error.message);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
};



module.exports = warehouseTimeSlotController;
