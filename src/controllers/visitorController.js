const db = require('../config/database');
const { visitorRequest, visitorTypes, warehouse, warehouseTimeSlots, approval, users } = require('../schema');
const { eq, and, or, sql, ne } = require('drizzle-orm');  // Import operators from drizzle-orm
const { alias } = require('drizzle-orm/pg-core');  // Import alias from pg-core
const { validateUuid } = require('../utils/uuidValidator'); // Import the validator
const { sendApprovalEmail, sendRejectionEmail } = require('../services/emailService'); // Import email service

/**
 * Updates visitor request status based on approvals and sends emails on final status change.
 * @param {string} visitorRequestId - UUID of the visitor request.
 */
async function updateVisitorRequestStatus(visitorRequestId) {
  try {
    const allApprovals = await db.select({ status: approval.status }).from(approval).where(eq(approval.visitorRequestId, visitorRequestId));
    const previousStatus = await db.select({ status: visitorRequest.status }).from(visitorRequest).where(eq(visitorRequest.id, visitorRequestId)).then(res => res[0]?.status);
    let newStatus = 'pending';
    if (allApprovals.some(a => a.status === 'rejected')) {
      newStatus = 'rejected';
    } else if (allApprovals.every(a => a.status === 'approved')) {
      newStatus = 'approved';
    }
    await db.update(visitorRequest).set({ status: newStatus }).where(eq(visitorRequest.id, visitorRequestId));
    
    // Send email only if status changed to 'approved' or 'rejected'
    if (newStatus !== previousStatus && (newStatus === 'approved' || newStatus === 'rejected')) {
      const visitorDetails = await db
        .select({
          email: visitorRequest.email,
          name: visitorRequest.name,
          trackingCode: visitorRequest.trackingCode,
          warehouseName: warehouse.name,
          timeSlotName: warehouseTimeSlots.name,
          from: warehouseTimeSlots.from,
          to: warehouseTimeSlots.to,
          date: visitorRequest.date,
        })
        .from(visitorRequest)
        .leftJoin(warehouse, eq(visitorRequest.warehouseId, warehouse.id))
        .leftJoin(warehouseTimeSlots, eq(visitorRequest.warehouseTimeSlotId, warehouseTimeSlots.id))
        .where(eq(visitorRequest.id, visitorRequestId))
        .limit(1);
      
      if (visitorDetails.length > 0) {
        const { email, name, trackingCode, warehouseName, timeSlotName, from, to, date } = visitorDetails[0];
        if (newStatus === 'approved') {
          await sendApprovalEmail(email, name, trackingCode, warehouseName, timeSlotName, date.toISOString().split('T')[0], from, to);
        } else if (newStatus === 'rejected') {
          // Fetch rejection reason from approvals (use the first rejection reason if multiple)
          const rejectionApproval = await db.select({ reason: approval.reason }).from(approval).where(and(eq(approval.visitorRequestId, visitorRequestId), eq(approval.status, 'rejected'))).limit(1);
          const reason = rejectionApproval[0]?.reason || 'No specific reason provided';
          await sendRejectionEmail(email, name, trackingCode, reason);
        }
      }
    }
  } catch (error) {
    console.error('Error updating status:', error.message);
  }
}

/**
 * Generates a unique tracking code.
 * @returns {string} Unique 8-character code.
 */
async function generateTrackingCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code;
  do {
    code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  } while (await db.select().from(visitorRequest).where(eq(visitorRequest.trackingCode, code)).limit(1).length > 0);
  return code;
}

const visitorController = {
  /**
   * Retrieves all visitor requests with joined data.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   */
  async getAllVisitorRequests(req, res) {
    try {
      const result = await db
        .select({
          id: visitorRequest.id,
          name: visitorRequest.name,
          phone: visitorRequest.phone,
          email: visitorRequest.email,
          accompanying: visitorRequest.accompanying,
          date: visitorRequest.date,
          status: visitorRequest.status,
          visitorTypeName: visitorTypes.name,
          warehouseName: warehouse.name,
          timeSlotName: warehouseTimeSlots.name,
          from: warehouseTimeSlots.from,
          to: warehouseTimeSlots.to,
        })
        .from(visitorRequest)
        .leftJoin(visitorTypes, eq(visitorRequest.visitorTypeId, visitorTypes.id))
        .leftJoin(warehouse, eq(visitorRequest.warehouseId, warehouse.id))
        .leftJoin(warehouseTimeSlots, eq(visitorRequest.warehouseTimeSlotId, warehouseTimeSlots.id))
        .orderBy(visitorRequest.date);

      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Error fetching visitor requests:', error.message);
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

  // Get visitor requests by user ID (where user is an approver)
  async getVisitorRequestsByUserId(req, res) {
    try {
      const { userId } = req.params;
      if (!validateUuid(userId)) {
        return res.status(400).json({ success: false, message: 'Invalid user ID format' });
      }
      const result = await db
        .select({
          id: visitorRequest.id,
          name: visitorRequest.name,
          phone: visitorRequest.phone,
          email: visitorRequest.email,
          accompanying: visitorRequest.accompanying,
          date: visitorRequest.date,
          status: visitorRequest.status,
          visitorTypeName: visitorTypes.name,
          warehouseName: warehouse.name,
          timeSlotName: warehouseTimeSlots.name,
          from: warehouseTimeSlots.from,
          to: warehouseTimeSlots.to,
        })
        .from(visitorRequest)
        .innerJoin(approval, eq(visitorRequest.id, approval.visitorRequestId))
        .leftJoin(visitorTypes, eq(visitorRequest.visitorTypeId, visitorTypes.id))
        .leftJoin(warehouse, eq(visitorRequest.warehouseId, warehouse.id))
        .leftJoin(warehouseTimeSlots, eq(visitorRequest.warehouseTimeSlotId, warehouseTimeSlots.id))
        .where(eq(approval.approver, userId))
        .orderBy(visitorRequest.date);

      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Get visitor requests by user ID error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Get pending visitor requests by user ID (where user is an approver)
  async getPendingVisitorRequestsByUserId(req, res) {
    try {
      const { userId } = req.params;
      if (!validateUuid(userId)) {
        return res.status(400).json({ success: false, message: 'Invalid user ID format' });
      }
      const prevApproval = alias(approval, 'prev_approval');  // Alias for previous approval
      const result = await db
        .select({
          id: visitorRequest.id,
          name: visitorRequest.name,
          phone: visitorRequest.phone,
          email: visitorRequest.email,
          accompanying: visitorRequest.accompanying,
          date: visitorRequest.date,
          status: visitorRequest.status,
          visitorTypeName: visitorTypes.name,
          warehouseName: warehouse.name,
          timeSlotName: warehouseTimeSlots.name,
          from: warehouseTimeSlots.from,
          to: warehouseTimeSlots.to,
        })
        .from(visitorRequest)
        .innerJoin(approval, eq(visitorRequest.id, approval.visitorRequestId))
        .leftJoin(prevApproval, and(
          eq(prevApproval.visitorRequestId, visitorRequest.id),
          eq(prevApproval.stepNo, sql`${approval.stepNo} - 1`)
        ))
        .leftJoin(visitorTypes, eq(visitorRequest.visitorTypeId, visitorTypes.id))
        .leftJoin(warehouse, eq(visitorRequest.warehouseId, warehouse.id))
        .leftJoin(warehouseTimeSlots, eq(visitorRequest.warehouseTimeSlotId, warehouseTimeSlots.id))
        .where(and(
          eq(approval.approver, userId),
          eq(approval.status, 'pending'),
          or(
            eq(approval.stepNo, 1),  // No previous step for step 1
            eq(prevApproval.status, 'approved')  // Previous step approved
          )
        ))
        .orderBy(visitorRequest.date);

      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Get pending visitor requests by user ID error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Get approved visitor requests by user ID (where user is an approver)
  async getApprovedVisitorRequestsByUserId(req, res) {
    try {
      const { userId } = req.params;
      if (!validateUuid(userId)) {
        return res.status(400).json({ success: false, message: 'Invalid user ID format' });
      }
      const result = await db
        .select({
          id: visitorRequest.id,
          name: visitorRequest.name,
          phone: visitorRequest.phone,
          email: visitorRequest.email,
          accompanying: visitorRequest.accompanying,
          date: visitorRequest.date,
          status: visitorRequest.status,
          visitorTypeName: visitorTypes.name,
          warehouseName: warehouse.name,
          timeSlotName: warehouseTimeSlots.name,
          from: warehouseTimeSlots.from,
          to: warehouseTimeSlots.to,
        })
        .from(visitorRequest)
        .innerJoin(approval, eq(visitorRequest.id, approval.visitorRequestId))
        .leftJoin(visitorTypes, eq(visitorRequest.visitorTypeId, visitorTypes.id))
        .leftJoin(warehouse, eq(visitorRequest.warehouseId, warehouse.id))
        .leftJoin(warehouseTimeSlots, eq(visitorRequest.warehouseTimeSlotId, warehouseTimeSlots.id))
        .where(and(eq(approval.approver, userId), eq(approval.status, 'approved')))
        .orderBy(visitorRequest.date);

      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Get approved visitor requests by user ID error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Get rejected visitor requests by user ID (where user is an approver)
  async getRejectedVisitorRequestsByUserId(req, res) {
    try {
      const { userId } = req.params;
      
      if (!validateUuid(userId)) {
        return res.status(400).json({ success: false, message: 'Invalid user ID format' });
      }
      const result = await db
        .select({
          id: visitorRequest.id,
          name: visitorRequest.name,
          phone: visitorRequest.phone,
          email: visitorRequest.email,
          accompanying: visitorRequest.accompanying,
          date: visitorRequest.date,
          status: visitorRequest.status,
          visitorTypeName: visitorTypes.name,
          warehouseName: warehouse.name,
          timeSlotName: warehouseTimeSlots.name,
          from: warehouseTimeSlots.from,
          to: warehouseTimeSlots.to,
        })
        .from(visitorRequest)
        .innerJoin(approval, eq(visitorRequest.id, approval.visitorRequestId))
        .leftJoin(visitorTypes, eq(visitorRequest.visitorTypeId, visitorTypes.id))
        .leftJoin(warehouse, eq(visitorRequest.warehouseId, warehouse.id))
        .leftJoin(warehouseTimeSlots, eq(visitorRequest.warehouseTimeSlotId, warehouseTimeSlots.id))
        .where(and(eq(approval.approver, userId), eq(approval.status, 'rejected')))
        .orderBy(visitorRequest.date);

      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Get rejected visitor requests by user ID error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Create a new visitor request
  // req.body: { name, phone, email, visitorTypeId, warehouseId, warehouseTimeSlotId, accompanying, date }
  // response: { success: true, data: { id, name, phone, email, visitorTypeId, warehouseId, warehouseTimeSlotId, accompanying, date, status, trackingCode } }
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

      // Check for duplicate request (same name, date, warehouse, time slot)
      const existingRequest = await db
        .select()
        .from(visitorRequest)
        .where(
          and(
            eq(visitorRequest.name, name),
            eq(visitorRequest.date, date),
            eq(visitorRequest.warehouseId, warehouseId),
            eq(visitorRequest.warehouseTimeSlotId, warehouseTimeSlotId)
          )
        )
        .limit(1);

      if (existingRequest.length > 0) {
        return res.status(409).json({ success: false, message: 'A visitor request with the same name, date, warehouse, and time slot already exists' });
      }

      // Check if time slot is already booked (approved request)
      const bookedSlot = await db
        .select()
        .from(visitorRequest)
        .where(
          and(
            eq(visitorRequest.date, date),
            eq(visitorRequest.warehouseId, warehouseId),
            eq(visitorRequest.warehouseTimeSlotId, warehouseTimeSlotId),
            eq(visitorRequest.status, 'approved')
          )
        )
        .limit(1);

      if (bookedSlot.length > 0) {
        return res.status(409).json({ success: false, message: 'Time slot already booked for this date' });
      }

      const trackingCode = await generateTrackingCode();

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
          trackingCode,
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
          trackingCode: visitorRequest.trackingCode,
        });

      res.status(201).json({ success: true, data: result[0] });
    } catch (error) {
      console.error('Create visitor request error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Get visitor request by tracking code (public access)
  async getVisitorRequestByTrackingCode(req, res) {
    try {
      const { trackingCode } = req.params;
      const result = await db
        .select({
          id: visitorRequest.id,
          name: visitorRequest.name,
          status: visitorRequest.status,
          date: visitorRequest.date,
          visitorTypeName: visitorTypes.name,
          warehouseName: warehouse.name,
          timeSlotName: warehouseTimeSlots.name,
        })
        .from(visitorRequest)
        .leftJoin(visitorTypes, eq(visitorRequest.visitorTypeId, visitorTypes.id))
        .leftJoin(warehouse, eq(visitorRequest.warehouseId, warehouse.id))
        .leftJoin(warehouseTimeSlots, eq(visitorRequest.warehouseTimeSlotId, warehouseTimeSlots.id))
        .where(eq(visitorRequest.trackingCode, trackingCode))
        .limit(1);

      if (result.length === 0) {
        return res.status(404).json({ success: false, message: 'Visitor request not found' });
      }

      const request = result[0];

      // Fetch approvals for this request, including reason
      const approvals = await db
        .select({
          stepNo: approval.stepNo,
          status: approval.status,
          approverName: users.name,
          reason: approval.reason,  // New: Include reason
        })
        .from(approval)
        .leftJoin(users, eq(approval.approver, users.id))
        .where(eq(approval.visitorRequestId, request.id))
        .orderBy(approval.stepNo);

      request.approvals = approvals;

      res.json({ success: true, data: request });
    } catch (error) {
      console.error('Get visitor request by tracking code error:', error);
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

  // Approve a visitor request
  async approveVisitorRequest(req, res) {
    try {
      const { id } = req.params;
      const approverId = req.user.id;
      if (!validateUuid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid visitor request ID format' });
      }

      // Fetch request details
      const request = await db
        .select({
          date: visitorRequest.date,
          warehouseId: visitorRequest.warehouseId,
          warehouseTimeSlotId: visitorRequest.warehouseTimeSlotId
        })
        .from(visitorRequest)
        .where(eq(visitorRequest.id, id))
        .limit(1);

      if (request.length === 0) {
        return res.status(404).json({ success: false, message: 'Visitor request not found' });
      }

      const { date, warehouseId, warehouseTimeSlotId } = request[0];

      // Check if time slot is already booked by another approved request
      const booked = await db
        .select()
        .from(visitorRequest)
        .where(and(
          eq(visitorRequest.date, date),
          eq(visitorRequest.warehouseId, warehouseId),
          eq(visitorRequest.warehouseTimeSlotId, warehouseTimeSlotId),
          eq(visitorRequest.status, 'approved'),
          ne(visitorRequest.id, id)
        ))
        .limit(1);

      if (booked.length > 0) {
        return res.status(409).json({ success: false, message: 'Time slot already booked' });
      }

      // Check if approval exists for this user and request
      const [existingApproval] = await db
        .select()
        .from(approval)
        .where(and(eq(approval.visitorRequestId, id), eq(approval.approver, approverId)))
        .limit(1);
      if (!existingApproval) {
        return res.status(404).json({ success: false, message: 'Approval not found for this user' });
      }
      // Update approval status
      await db
        .update(approval)
        .set({ status: 'approved' })
        .where(and(eq(approval.visitorRequestId, id), eq(approval.approver, approverId)));
      // Update visitor request status based on all approvals (emails sent here if status changes)
      await updateVisitorRequestStatus(id);

      res.json({ success: true, message: 'Visitor request approved' });
    } catch (error) {
      console.error('Error approving request:', error.message);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Reject a visitor request
  async rejectVisitorRequest(req, res) {
    try {
      const { id } = req.params;
      const approverId = req.user.id;
      const { reason } = req.body;  // Accept reason from request body
      if (!validateUuid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid visitor request ID format' });
      }
      // Validate reason if provided
      if (reason && (typeof reason !== 'string' || reason.trim().length === 0)) {
        return res.status(400).json({ success: false, message: 'Reason must be a non-empty string' });
      }
      // Check if approval exists for this user and request
      const [existingApproval] = await db
        .select()
        .from(approval)
        .where(and(eq(approval.visitorRequestId, id), eq(approval.approver, approverId)))
        .limit(1);
      if (!existingApproval) {
        return res.status(404).json({ success: false, message: 'Approval not found for this user' });
      }
      // Update approval status and reason
      await db
        .update(approval)
        .set({ status: 'rejected', reason: reason?.trim() || null })
        .where(and(eq(approval.visitorRequestId, id), eq(approval.approver, approverId)));
      // Update visitor request status based on all approvals (emails sent here if status changes)
      await updateVisitorRequestStatus(id);

      res.json({ success: true, message: 'Visitor request rejected' });
    } catch (error) {
      console.error('Reject visitor request error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Get all visitor requests by logged-in receptionist's warehouse
  async getAllVisitorRequestsByReceptionistWarehouse(req, res) {
    try {
      if (req.user.role !== 'Receptionist') {
        return res.status(403).json({ success: false, message: 'Access denied: Only receptionists can access this' });
      }
      const userWarehouseId = req.user.warehouseId;
      if (!userWarehouseId) {
        return res.status(400).json({ success: false, message: 'User does not have an assigned warehouse' });
      }
      const result = await db
        .select({
          id: visitorRequest.id,
          name: visitorRequest.name,
          phone: visitorRequest.phone,
          email: visitorRequest.email,
          accompanying: visitorRequest.accompanying,
          date: visitorRequest.date,
          status: visitorRequest.status,
          trackingCode: visitorRequest.trackingCode,
          visitStatus: visitorRequest.visitStatus,
          punctuality: visitorRequest.punctuality,
          arrivedAt: visitorRequest.arrivedAt,
          checkedOutAt: visitorRequest.checkedOutAt,
          visitorTypeName: visitorTypes.name,
          warehouseName: warehouse.name,
          timeSlotName: warehouseTimeSlots.name,
          from: warehouseTimeSlots.from,
          to: warehouseTimeSlots.to,
        })
        .from(visitorRequest)
        .leftJoin(visitorTypes, eq(visitorRequest.visitorTypeId, visitorTypes.id))
        .leftJoin(warehouse, eq(visitorRequest.warehouseId, warehouse.id))
        .leftJoin(warehouseTimeSlots, eq(visitorRequest.warehouseTimeSlotId, warehouseTimeSlots.id))
        .where(and(eq(visitorRequest.warehouseId, userWarehouseId), eq(visitorRequest.status, 'approved')))  // Filter approved only
        .orderBy(visitorRequest.date);
      
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Get all visitor requests by receptionist warehouse error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Get today's visitor requests by logged-in receptionist's warehouse
  async getTodayVisitorRequestsByReceptionistWarehouse(req, res) {
    try {
      if (req.user.role !== 'Receptionist') {
        return res.status(403).json({ success: false, message: 'Access denied: Only receptionists can access this' });
      }
      const userWarehouseId = req.user.warehouseId;
      if (!userWarehouseId) {
        return res.status(400).json({ success: false, message: 'User does not have an assigned warehouse' });
      }
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const result = await db
        .select({
          id: visitorRequest.id,
          name: visitorRequest.name,
          phone: visitorRequest.phone,
          email: visitorRequest.email,
          accompanying: visitorRequest.accompanying,
          date: visitorRequest.date,
          status: visitorRequest.status,
          trackingCode: visitorRequest.trackingCode,
          visitStatus: visitorRequest.visitStatus,
          punctuality: visitorRequest.punctuality,
          arrivedAt: visitorRequest.arrivedAt,
          checkedOutAt: visitorRequest.checkedOutAt,
          visitorTypeName: visitorTypes.name,
          warehouseName: warehouse.name,
          timeSlotName: warehouseTimeSlots.name,
          from: warehouseTimeSlots.from,
          to: warehouseTimeSlots.to,
        })
        .from(visitorRequest)
        .leftJoin(visitorTypes, eq(visitorRequest.visitorTypeId, visitorTypes.id))
        .leftJoin(warehouse, eq(visitorRequest.warehouseId, warehouse.id))
        .leftJoin(warehouseTimeSlots, eq(visitorRequest.warehouseTimeSlotId, warehouseTimeSlots.id))
        .where(and(eq(visitorRequest.date, today), eq(visitorRequest.warehouseId, userWarehouseId), eq(visitorRequest.status, 'approved')))  // Filter approved only
        .orderBy(visitorRequest.date);

      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Get today visitor requests by receptionist warehouse error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Update visitor status by receptionist (only for today's approved requests in their warehouse)
  async updateVisitorStatusByReceptionist(req, res) {
    try {
      if (req.user.role !== 'Receptionist') {
        return res.status(403).json({ success: false, message: 'Access denied: Only receptionists can access this' });
      }
      const { id } = req.params;
      if (!validateUuid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid visitor request ID format' });
      }
      const { visitStatus, arrivedAt, checkedOutAt, punctuality } = req.body;

      // Ensure at least one field is provided
      if (visitStatus === undefined && arrivedAt === undefined && checkedOutAt === undefined && punctuality === undefined) {
        return res.status(400).json({ success: false, message: 'At least one field must be provided' });
      }

      const userWarehouseId = req.user.warehouseId;
      if (!userWarehouseId) {
        return res.status(400).json({ success: false, message: 'User does not have an assigned warehouse' });
      }
      const today = new Date().toISOString().split('T')[0];

      // Check if request exists, is approved, in user's warehouse, and for today
      const [existingRequest] = await db
        .select()
        .from(visitorRequest)
        .where(and(
          eq(visitorRequest.id, id),
          eq(visitorRequest.status, 'approved'),
          eq(visitorRequest.warehouseId, userWarehouseId),
          eq(visitorRequest.date, today)
        ))
        .limit(1);

      if (!existingRequest) {
        return res.status(404).json({ success: false, message: 'Visitor request not found or not eligible for update' });
      }

      // Validate fields
      if (visitStatus && !['pending', 'visited', 'no_show'].includes(visitStatus)) {
        return res.status(400).json({ success: false, message: 'Invalid visit status' });
      }
      if (punctuality && !['on_time', 'late'].includes(punctuality)) {
        return res.status(400).json({ success: false, message: 'Invalid punctuality' });
      }

      const updateData = {};
      if (visitStatus !== undefined && visitStatus !== '') updateData.visitStatus = visitStatus;
      if (arrivedAt != null && arrivedAt !== '') {  // Skip null or empty string
        let arrivedDate;
        if (arrivedAt.includes('T') || arrivedAt.includes('-')) {
          arrivedDate = new Date(arrivedAt);
        } else {
          // Assume time string, combine with today
          const today = new Date().toISOString().split('T')[0];
          arrivedDate = new Date(`${today}T${arrivedAt}`);
        }
        if (isNaN(arrivedDate.getTime())) {
          return res.status(400).json({ success: false, message: 'Invalid arrivedAt date/time' });
        }
        updateData.arrivedAt = arrivedDate;
      }
      if (checkedOutAt != null && checkedOutAt !== '') {  // Skip null or empty string
        let checkedOutDate;
        if (checkedOutAt.includes('T') || checkedOutAt.includes('-')) {
          checkedOutDate = new Date(checkedOutAt);
        } else {
          // Assume time string, combine with today
          const today = new Date().toISOString().split('T')[0];
          checkedOutDate = new Date(`${today}T${checkedOutAt}`);
        }
        if (isNaN(checkedOutDate.getTime())) {
          return res.status(400).json({ success: false, message: 'Invalid checkedOutAt date/time' });
        }
        updateData.checkedOutAt = checkedOutDate;
      }
      if (punctuality !== undefined && punctuality !== '') updateData.punctuality = punctuality;

      const result = await db
        .update(visitorRequest)
        .set(updateData)
        .where(eq(visitorRequest.id, id))
        .returning();

      if (result.length === 0) {
        return res.status(404).json({ success: false, message: 'Visitor request not found' });
      }

      res.json({ success: true, data: result[0] });
    } catch (error) {
      console.error('Update visitor status by receptionist error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Get total pending visitor requests
  async getTotalPendingRequests(req, res) {
    try {
      const result = await db.select({ count: sql`COUNT(*)` }).from(visitorRequest).where(eq(visitorRequest.status, 'pending'));
      res.json({ success: true, total: parseInt(result[0].count) });
    } catch (error) {
      console.error('Error fetching total pending requests:', error.message);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Get total approved visitor requests for today
  async getTotalApprovedToday(req, res) {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const result = await db.select({ count: sql`COUNT(*)` }).from(visitorRequest).where(and(eq(visitorRequest.status, 'approved'), eq(visitorRequest.date, today)));
      res.json({ success: true, total: parseInt(result[0].count) });
    } catch (error) {
      console.error('Error fetching total approved today:', error.message);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

};

module.exports = visitorController;