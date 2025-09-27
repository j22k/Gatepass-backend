const db = require('../config/database');
const { visitorRequest, visitorTypes, warehouse, warehouseTimeSlots } = require('../schema');
const { eq, and } = require('drizzle-orm');
const { validateUuid } = require('../utils/uuidValidator'); // Import the validator


const visitorController = {
  // Get all visitor requests
  async getAllVisitorRequests(req, res) {
    try {
      const result = await db
        .select({
          id: visitorRequest.id,
          name: visitorRequest.name,
          phone: visitorRequest.phone,
          email: visitorRequest.email,
          visitorTypeId: visitorRequest.visitorTypeId,
          warehouseId: visitorRequest.warehouseId,
          warehouseTimeSlotId: visitorRequest.warehouseTimeSlotId,
          accompanying: visitorRequest.accompanying,
          date: visitorRequest.date,
          status: visitorRequest.status,
          visitorTypeName: visitorTypes.name,
          warehouseName: warehouse.name,
          timeSlotName: warehouseTimeSlots.name,
        })
        .from(visitorRequest)
        .leftJoin(visitorTypes, eq(visitorRequest.visitorTypeId, visitorTypes.id))
        .leftJoin(warehouse, eq(visitorRequest.warehouseId, warehouse.id))
        .leftJoin(warehouseTimeSlots, eq(visitorRequest.warehouseTimeSlotId, warehouseTimeSlots.id))
        .orderBy(visitorRequest.date);

      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Get all visitor requests error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Get visitor request by ID
  async getVisitorRequestById(req, res) {
    try {
      const { id } = req.params;
      if (!validateUuid(id)) { // Validate ID format
        return res.status(400).json({ success: false, message: 'Invalid ID format' });
      }
      const result = await db
        .select({
          id: visitorRequest.id,
          name: visitorRequest.name,
          phone: visitorRequest.phone,
          email: visitorRequest.email,
          visitorTypeId: visitorRequest.visitorTypeId,
          warehouseId: visitorRequest.warehouseId,
          warehouseTimeSlotId: visitorRequest.warehouseTimeSlotId,
          accompanying: visitorRequest.accompanying,
          date: visitorRequest.date,
          status: visitorRequest.status,
          visitorTypeName: visitorTypes.name,
          warehouseName: warehouse.name,
          timeSlotName: warehouseTimeSlots.name,
        })
        .from(visitorRequest)
        .leftJoin(visitorTypes, eq(visitorRequest.visitorTypeId, visitorTypes.id))
        .leftJoin(warehouse, eq(visitorRequest.warehouseId, warehouse.id))
        .leftJoin(warehouseTimeSlots, eq(visitorRequest.warehouseTimeSlotId, warehouseTimeSlots.id))
        .where(eq(visitorRequest.id, id))
        .limit(1);

      if (result.length === 0) {
        return res.status(404).json({ success: false, message: 'Visitor request not found' });
      }

      res.json({ success: true, data: result[0] });
    } catch (error) {
      console.error('Get visitor request by ID error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Create a new visitor request
  // req.body: { name, phone, email, visitorTypeId, warehouseId, warehouseTimeSlotId, accompanying, date }
  // response: { success: true, data: { id, name, phone, email, visitorTypeId, warehouseId, warehouseTimeSlotId, accompanying, date, status } }
  async createVisitorRequest(req, res) {
    try {
      const { name, phone, email, visitorTypeId, warehouseId, warehouseTimeSlotId, accompanying, date } = req.body;

      // Validate foreign keys
      const [visitorTypeExists] = await db.select().from(visitorTypes).where(eq(visitorTypes.id, visitorTypeId)).limit(1);
      if (!visitorTypeExists) {
        return res.status(400).json({ success: false, message: 'Invalid visitor type ID' });
      }

      const [warehouseExists] = await db.select().from(warehouse).where(eq(warehouse.id, warehouseId)).limit(1);
      if (!warehouseExists) {
        return res.status(400).json({ success: false, message: 'Invalid warehouse ID' });
      }

      const [timeSlotExists] = await db.select().from(warehouseTimeSlots).where(eq(warehouseTimeSlots.id, warehouseTimeSlotId)).limit(1);
      if (!timeSlotExists) {
        return res.status(400).json({ success: false, message: 'Invalid warehouse time slot ID' });
      }

      const result = await db
        .insert(visitorRequest)
        .values({
          name,
          phone,
          email,
          visitorTypeId,
          warehouseId,
          warehouseTimeSlotId,
          accompanying: accompanying || [],
          date,
        })
        .returning({
          id: visitorRequest.id,
          name: visitorRequest.name,
          phone: visitorRequest.phone,
          email: visitorRequest.email,
          visitorTypeId: visitorRequest.visitorTypeId,
          warehouseId: visitorRequest.warehouseId,
          warehouseTimeSlotId: visitorRequest.warehouseTimeSlotId,
          accompanying: visitorRequest.accompanying,
          date: visitorRequest.date,
          status: visitorRequest.status,
        });

      res.status(201).json({ success: true, data: result[0] });
    } catch (error) {
      console.error('Create visitor request error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Update a visitor request
  // req.body: { name, phone, email, visitorTypeId, warehouseId, warehouseTimeSlotId, accompanying, date, status }
  // response: { success: true, data: { id, name, phone, email, visitorTypeId, warehouseId, warehouseTimeSlotId, accompanying, date, status } }
  async updateVisitorRequest(req, res) {
    try {
      const { id } = req.params;
      if (!validateUuid(id)) { // Validate ID format
        return res.status(400).json({ success: false, message: 'Invalid ID format' });
      }
      const { name, phone, email, visitorTypeId, warehouseId, warehouseTimeSlotId, accompanying, date, status } = req.body;

      // Validate foreign keys if provided
      if (visitorTypeId) {
        const [visitorTypeExists] = await db.select().from(visitorTypes).where(eq(visitorTypes.id, visitorTypeId)).limit(1);
        if (!visitorTypeExists) {
          return res.status(400).json({ success: false, message: 'Invalid visitor type ID' });
        }
      }

      if (warehouseId) {
        const [warehouseExists] = await db.select().from(warehouse).where(eq(warehouse.id, warehouseId)).limit(1);
        if (!warehouseExists) {
          return res.status(400).json({ success: false, message: 'Invalid warehouse ID' });
        }
      }

      if (warehouseTimeSlotId) {
        const [timeSlotExists] = await db.select().from(warehouseTimeSlots).where(eq(warehouseTimeSlots.id, warehouseTimeSlotId)).limit(1);
        if (!timeSlotExists) {
          return res.status(400).json({ success: false, message: 'Invalid warehouse time slot ID' });
        }
      }

      const result = await db
        .update(visitorRequest)
        .set({ name, phone, email, visitorTypeId, warehouseId, warehouseTimeSlotId, accompanying, date, status })
        .where(eq(visitorRequest.id, id))
        .returning();

      if (result.length === 0) {
        return res.status(404).json({ success: false, message: 'Visitor request not found' });
      }

      res.json({ success: true, data: result[0] });
    } catch (error) {
      console.error('Update visitor request error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

 
};

module.exports = visitorController;