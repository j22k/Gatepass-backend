const db = require('../config/database');
const { warehouseTimeSlots, warehouse } = require('../schema');
const { eq } = require('drizzle-orm');
const { validateUuid } = require('../utils/uuidValidator'); // Import the validator

const warehouseTimeSlotController = {
  // Get all warehouse time slots
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
        .orderBy(warehouseTimeSlots.name);

      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Get all warehouse time slots error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Get warehouse time slot by ID
  async getWarehouseTimeSlotById(req, res) {
    try {
      const { id } = req.params;
      // console.log(id); // Removed for conciseness
      
      if (!validateUuid(id)) { // Validate ID format
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
        .where(eq(warehouseTimeSlots.id, id))
        .limit(1);
      // console.log(result); // Removed for conciseness
      
      if (result.length === 0) {
        return res.status(404).json({ success: false, message: 'Warehouse time slot not found' });
      }

      res.json({ success: true, data: result[0] });
    } catch (error) {
      console.error('Get warehouse time slot by ID error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Get all warehouse time slots by warehouse ID
  async getWarehouseTimeSlotsByWarehouseId(req, res) {
    try {
      const { warehouseId } = req.params;
      if (!validateUuid(warehouseId)) {
        return res.status(400).json({ success: false, message: 'Invalid Warehouse ID format' });
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
        .where(eq(warehouseTimeSlots.warehouseId, warehouseId))
        .orderBy(warehouseTimeSlots.name);

      if (result.length === 0) {
        return res.status(404).json({ success: false, message: 'No time slots found for this warehouse' });
      }

      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Get warehouse time slots by warehouse ID error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Create a new warehouse time slot
  async createWarehouseTimeSlot(req, res) {
    try {
      const { name, from, to, warehouseId } = req.body;

      // Validate warehouseId
      if (!validateUuid(warehouseId)) {
        return res.status(400).json({ success: false, message: 'Invalid Warehouse ID format' });
      }
      const [warehouseExists] = await db.select().from(warehouse).where(eq(warehouse.id, warehouseId)).limit(1);
      if (!warehouseExists) {
        return res.status(400).json({ success: false, message: 'Warehouse not found' });
      }

      const result = await db
        .insert(warehouseTimeSlots)
        .values({
          name,
          from,
          to,
          warehouseId,
        })
        .returning({
          id: warehouseTimeSlots.id,
          name: warehouseTimeSlots.name,
          from: warehouseTimeSlots.from,
          to: warehouseTimeSlots.to,
          warehouseId: warehouseTimeSlots.warehouseId,
        });

      res.status(201).json({ success: true, data: result[0] });
    } catch (error) {
      console.error('Create warehouse time slot error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Create a new warehouse time slot by warehouse ID (warehouseId in params)
  async createWarehouseTimeSlotByWarehouseId(req, res) {
    try {
      const { warehouseId } = req.params;
      const { name, from, to } = req.body;
      // Validate warehouseId
      if (!validateUuid(warehouseId)) {
        return res.status(400).json({ success: false, message: 'Invalid Warehouse ID format' });
      }
      const [warehouseExists] = await db.select().from(warehouse).where(eq(warehouse.id, warehouseId)).limit(1);
      if (!warehouseExists) {
        return res.status(400).json({ success: false, message: 'Warehouse not found' });
      }

      const result = await db
        .insert(warehouseTimeSlots)
        .values({
          name,
          from,
          to,
          warehouseId,
        })
        .returning({
          id: warehouseTimeSlots.id,
          name: warehouseTimeSlots.name,
          from: warehouseTimeSlots.from,
          to: warehouseTimeSlots.to,
          warehouseId: warehouseTimeSlots.warehouseId,
        });

      res.status(201).json({ success: true, data: result[0] });
    } catch (error) {
      console.error('Create warehouse time slot by warehouse ID error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Update a warehouse time slot
  async updateWarehouseTimeSlot(req, res) {
    try {
      const { id } = req.params;
      if (!validateUuid(id)) { // Validate ID format
        return res.status(400).json({ success: false, message: 'Invalid ID format' });
      }
      const { name, from, to, warehouseId } = req.body;

      // Validate warehouseId if provided
      if (warehouseId) {
        if (!validateUuid(warehouseId)) {
          return res.status(400).json({ success: false, message: 'Invalid Warehouse ID format' });
        }
        const [warehouseExists] = await db.select().from(warehouse).where(eq(warehouse.id, warehouseId)).limit(1);
        if (!warehouseExists) {
          return res.status(400).json({ success: false, message: 'Warehouse not found' });
        }
      }

      const result = await db
        .update(warehouseTimeSlots)
        .set({ name, from, to, warehouseId })
        .where(eq(warehouseTimeSlots.id, id))
        .returning();

      if (result.length === 0) {
        return res.status(404).json({ success: false, message: 'Warehouse time slot not found' });
      }

      res.json({ success: true, data: result[0] });
    } catch (error) {
      console.error('Update warehouse time slot error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Delete a warehouse time slot
  async deleteWarehouseTimeSlot(req, res) {
    try {
      const { id } = req.params;
      if (!validateUuid(id)) { // Validate ID format
        return res.status(400).json({ success: false, message: 'Invalid ID format' });
      }
      const result = await db.delete(warehouseTimeSlots).where(eq(warehouseTimeSlots.id, id)).returning();

      if (result.length === 0) {
        return res.status(404).json({ success: false, message: 'Warehouse time slot not found' });
      }

      res.json({ success: true, data: result[0] });
    } catch (error) {
      console.error('Delete warehouse time slot error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
};

module.exports = warehouseTimeSlotController;
