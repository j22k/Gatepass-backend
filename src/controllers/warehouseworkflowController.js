const db = require('../config/database');
const { warehouseTimeSlots, warehouse, warehouseWorkflow, visitorTypes, users, approval, visitorRequest } = require('../schema');
const { eq, and, not, inArray, sql } = require('drizzle-orm');  // ✅ added sql
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
        return res.status(400).json({ success: false, message: 'Invalid warehouse ID format' });
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

      res.json(grouped);
    } catch (error) {
      console.error('Error fetching workflow data:', error.message);
      res.status(500).json({ success: false, message: 'Internal server error' });
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
        return res.status(400).json({ success: false, message: 'Invalid input: All IDs must be valid UUIDs, step_no must be a positive integer' });
      }

      const existing = await db
        .select()
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
        return res.status(409).json({ success: false, message: 'Workflow step already exists for this warehouse and visitor type' });
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

      // After adding workflow, check for existing pending requests without approvals
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
        .having(sql`COUNT(${approval.id}) = 0`);  // No approvals exist

      // For each such request, create approvals based on the full workflow
      for (const req of pendingRequests) {
        const fullWorkflow = await db
          .select({ stepNo: warehouseWorkflow.stepNo, approver: warehouseWorkflow.approver })
          .from(warehouseWorkflow)
          .where(
            and(
              eq(warehouseWorkflow.warehouseId, warehouse_id),
              eq(warehouseWorkflow.visitorTypeId, visitor_type_id)
            )
          )
          .orderBy(warehouseWorkflow.stepNo);

        for (const wf of fullWorkflow) {
          await db.insert(approval).values({
            visitorRequestId: req.id,
            stepNo: wf.stepNo,
            approver: wf.approver
          });
        }
      }

      res.status(201).json({ success: true, data: newWorkflow });
    } catch (error) {
      console.error('Error adding workflow:', error.message);
      if (error.code === '23505') {
        return res.status(409).json({ success: false, message: 'Workflow step already exists for this warehouse and visitor type' });
      }
      res.status(500).json({ success: false, message: 'Internal server error' });
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
        return res.status(400).json({ success: false, message: 'Invalid input: ID and approver must be valid UUIDs, step_no must be a positive integer' });
      }

      const existing = await db.select().from(warehouseWorkflow).where(eq(warehouseWorkflow.id, id));
      if (existing.length === 0) {
        return res.status(404).json({ success: false, message: 'Workflow entry not found' });
      }

      const { warehouseId, visitorTypeId } = existing[0];

      const conflict = await db
        .select()
        .from(warehouseWorkflow)
        .where(
          and(
            eq(warehouseWorkflow.warehouseId, warehouseId),
            eq(warehouseWorkflow.visitorTypeId, visitorTypeId),
            eq(warehouseWorkflow.stepNo, step_no),
            eq(warehouseWorkflow.approver, approver),
            not(eq(warehouseWorkflow.id, id)) // ✅ replaced whereNot
          )
        );

      if (conflict.length > 0) {
        return res.status(409).json({ success: false, message: 'Workflow step already exists for this warehouse and visitor type' });
      }

      const [updatedWorkflow] = await db
        .update(warehouseWorkflow)
        .set({ stepNo: step_no, approver })
        .where(eq(warehouseWorkflow.id, id))
        .returning();

      res.json({ success: true, data: updatedWorkflow });
    } catch (error) {
      console.error('Error updating workflow:', error.message);
      if (error.code === '23505') {
        return res.status(409).json({ success: false, message: 'Workflow step conflict' });
      }
      res.status(500).json({ success: false, message: 'Internal server error' });
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
        return res.status(400).json({ success: false, message: 'Invalid workflow ID format' });
      }

      const existing = await db.select().from(warehouseWorkflow).where(eq(warehouseWorkflow.id, id));
      if (existing.length === 0) {
        return res.status(404).json({ success: false, message: 'Workflow entry not found' });
      }

      const { warehouseId, visitorTypeId, stepNo, approver } = existing[0];

      // Delete matching approvals before deleting the workflow
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
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting workflow:', error.message);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
};

module.exports = warehouseworkflowController;
module.exports = warehouseworkflowController;
