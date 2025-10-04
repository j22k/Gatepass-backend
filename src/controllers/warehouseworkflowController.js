const db = require('../config/database');
const { warehouseTimeSlots, warehouse, warehouseWorkflow, visitorTypes, users, approval, visitorRequest } = require('../schema');
const { eq, and, not, inArray, sql } = require('drizzle-orm');
const { validateUuid } = require('../utils/uuidValidator');

const warehouseworkflowController = {
  /**
   * Retrieves structured workflow data grouped by visitor type for a warehouse.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   */
  getWorkflowDatabyWarehouseId: async (req, res) => {
    try {
      const { warehouseId } = req.params;
      if (!validateUuid(warehouseId)) {
        return res.status(400).json({ success: false, message: 'Invalid warehouse ID format. Please provide a valid UUID.' });
      }
      const rawWorkflows = await db
        .select({
          id: warehouseWorkflow.id,
          visitorTypeId: visitorTypes.id,
          visitorTypeName: visitorTypes.name,
          stepNo: warehouseWorkflow.stepNo,
          approverId: users.id,
          approverName: users.name
        })
        .from(warehouseWorkflow)
        .innerJoin(visitorTypes, eq(warehouseWorkflow.visitorTypeId, visitorTypes.id))
        .innerJoin(users, eq(warehouseWorkflow.approver, users.id))
        .where(eq(warehouseWorkflow.warehouseId, warehouseId))
        .orderBy(visitorTypes.name, warehouseWorkflow.stepNo);

      if (!rawWorkflows.length) {
        return res.status(200).json({ success: true, message: 'No workflow data found for this warehouse.', data: {} });
      }

      // Group by visitor type
      const grouped = rawWorkflows.reduce((acc, row) => {
        const key = row.visitorTypeId;
        if (!acc[key]) {
          acc[key] = {
            visitorType: row.visitorTypeName,
            steps: []
          };
        }
        acc[key].steps.push({
          id: row.id,
          stepNo: row.stepNo,
          approver: row.approverName
        });
        return acc;
      }, {});

      res.json({ success: true, message: 'Workflow data fetched successfully.', data: grouped });
    } catch (error) {
      console.error('Error fetching workflow data:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch workflow data. Please try again later.' });
    }
  },

  /**
   * Adds a new workflow entry after validation.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   */
  addWorkflow: async (req, res) => {
    try {
      const { warehouse_id, visitor_type_id, step_no, approver } = req.body;
      if (!validateUuid(warehouse_id) || !validateUuid(visitor_type_id) || !validateUuid(approver) || !Number.isInteger(step_no) || step_no <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid input: All IDs must be valid UUIDs and step_no must be a positive integer.' });
      }

      // Check for duplicate in a single query
      const existing = await db
        .select({ id: warehouseWorkflow.id })
        .from(warehouseWorkflow)
        .where(
          and(
            eq(warehouseWorkflow.warehouseId, warehouse_id),
            eq(warehouseWorkflow.visitorTypeId, visitor_type_id),
            eq(warehouseWorkflow.stepNo, step_no),
            eq(warehouseWorkflow.approver, approver)
          )
        );

      if (existing.length > 0) {
        return res.status(409).json({ success: false, message: 'A workflow step with the same details already exists for this warehouse and visitor type.' });
      }

      const [newWorkflow] = await db
        .insert(warehouseWorkflow)
        .values({
          warehouseId: warehouse_id,
          visitorTypeId: visitor_type_id,
          stepNo: step_no,
          approver
        })
        .returning();

      // Find all pending requests without approvals in a single query
      const pendingRequests = await db
        .select({ id: visitorRequest.id })
        .from(visitorRequest)
        .leftJoin(approval, eq(visitorRequest.id, approval.visitorRequestId))
        .where(
          and(
            eq(visitorRequest.warehouseId, warehouse_id),
            eq(visitorRequest.visitorTypeId, visitor_type_id),
            eq(visitorRequest.status, 'pending')
          )
        )
        .groupBy(visitorRequest.id)
        .having(sql`COUNT(${approval.id}) = 0`);

      // Fetch full workflow once if needed
      let fullWorkflow = [];
      if (pendingRequests.length > 0) {
        fullWorkflow = await db
          .select({ stepNo: warehouseWorkflow.stepNo, approver: warehouseWorkflow.approver })
          .from(warehouseWorkflow)
          .where(
            and(
              eq(warehouseWorkflow.warehouseId, warehouse_id),
              eq(warehouseWorkflow.visitorTypeId, visitor_type_id)
            )
          )
          .orderBy(warehouseWorkflow.stepNo);
      }

      // Batch insert approvals for all pending requests
      if (pendingRequests.length > 0 && fullWorkflow.length > 0) {
        const approvalInserts = [];
        for (const req of pendingRequests) {
          for (const wf of fullWorkflow) {
            approvalInserts.push({
              visitorRequestId: req.id,
              stepNo: wf.stepNo,
              approver: wf.approver
            });
          }
        }
        if (approvalInserts.length > 0) {
          await db.insert(approval).values(approvalInserts);
        }
      }

      res.status(201).json({ success: true, message: 'Workflow step added successfully.', data: newWorkflow });
    } catch (error) {
      console.error('Error adding workflow:', error);
      if (error.code === '23505') {
        return res.status(409).json({ success: false, message: 'A workflow step with the same details already exists.' });
      }
      res.status(500).json({ success: false, message: 'Failed to add workflow step. Please try again later.' });
    }
  },

  /**
   * Updates an existing workflow entry.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   */
  updateWorkflow: async (req, res) => {
    try {
      const { id } = req.params;
      const { step_no, approver } = req.body;
      if (!validateUuid(id) || !validateUuid(approver) || !Number.isInteger(step_no) || step_no <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid input: ID and approver must be valid UUIDs, step_no must be a positive integer.' });
      }

      const existing = await db.select().from(warehouseWorkflow).where(eq(warehouseWorkflow.id, id));
      if (existing.length === 0) {
        return res.status(404).json({ success: false, message: 'Workflow entry not found.' });
      }

      const { warehouseId, visitorTypeId } = existing[0];

      // Check for conflict in a single query
      const conflict = await db
        .select({ id: warehouseWorkflow.id })
        .from(warehouseWorkflow)
        .where(
          and(
            eq(warehouseWorkflow.warehouseId, warehouseId),
            eq(warehouseWorkflow.visitorTypeId, visitorTypeId),
            eq(warehouseWorkflow.stepNo, step_no),
            eq(warehouseWorkflow.approver, approver),
            not(eq(warehouseWorkflow.id, id))
          )
        );

      if (conflict.length > 0) {
        return res.status(409).json({ success: false, message: 'Another workflow step with the same details already exists for this warehouse and visitor type.' });
      }

      const [updatedWorkflow] = await db
        .update(warehouseWorkflow)
        .set({ stepNo: step_no, approver })
        .where(eq(warehouseWorkflow.id, id))
        .returning();

      res.json({ success: true, message: 'Workflow step updated successfully.', data: updatedWorkflow });
    } catch (error) {
      console.error('Error updating workflow:', error);
      if (error.code === '23505') {
        return res.status(409).json({ success: false, message: 'Workflow step conflict. Please use different details.' });
      }
      res.status(500).json({ success: false, message: 'Failed to update workflow step. Please try again later.' });
    }
  },

  /**
   * Deletes a workflow entry and related approvals.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   */
  deleteWorkflow: async (req, res) => {
    try {
      const { id } = req.params;
      if (!validateUuid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid workflow ID format. Please provide a valid UUID.' });
      }

      const existing = await db.select().from(warehouseWorkflow).where(eq(warehouseWorkflow.id, id));
      if (existing.length === 0) {
        return res.status(404).json({ success: false, message: 'Workflow entry not found.' });
      }

      const { warehouseId, visitorTypeId, stepNo, approver } = existing[0];

      // Get all relevant visitor request IDs in one query
      const relevantRequestIds = await db
        .select({ id: visitorRequest.id })
        .from(visitorRequest)
        .where(and(
          eq(visitorRequest.warehouseId, warehouseId),
          eq(visitorRequest.visitorTypeId, visitorTypeId)
        ));

      if (relevantRequestIds.length > 0) {
        await db
          .delete(approval)
          .where(and(
            inArray(approval.visitorRequestId, relevantRequestIds.map(r => r.id)),
            eq(approval.stepNo, stepNo),
            eq(approval.approver, approver)
          ));
      }

      await db.delete(warehouseWorkflow).where(eq(warehouseWorkflow.id, id));
      res.status(200).json({ success: true, message: 'Workflow step and related approvals deleted successfully.' });
    } catch (error) {
      console.error('Error deleting workflow:', error);
      res.status(500).json({ success: false, message: 'Failed to delete workflow step. Please try again later.' });
    }
  }
};

module.exports = warehouseworkflowController;
