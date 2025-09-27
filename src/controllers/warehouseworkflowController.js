const db = require('../config/database');
const { warehouseTimeSlots, warehouse, warehouseWorkflow, visitorTypes, users } = require('../schema');
const { eq, and, not } = require('drizzle-orm');  // ✅ added and, not
const { validateUuid } = require('../utils/uuidValidator');

const warehouseworkflowController = {
    // ======================
    // Get structured workflow by warehouse
    // ======================
    getWorkflowDatabyWarehouseId: async (req, res) => {
        const { warehouseId } = req.params;
        if (!validateUuid(warehouseId)) {
            return res.status(400).json({ error: 'Invalid warehouse ID' });
        }
        try {
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

            res.json(Object.values(grouped));
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // ======================
    // Add workflow
    // ======================
    addWorkflow: async (req, res) => {
        const { warehouse_id, visitor_type_id, step_no, approver } = req.body;
        if (
            !validateUuid(warehouse_id) ||
            !validateUuid(visitor_type_id) ||
            !validateUuid(approver) ||
            !Number.isInteger(step_no) ||
            step_no <= 0
        ) {
            return res.status(400).json({
                error: 'Invalid input: warehouse_id, visitor_type_id, and approver must be valid UUIDs, step_no must be a positive integer'
            });
        }
        try {
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
                return res.status(409).json({ error: 'Workflow step already exists for this warehouse and visitor type' });
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

            res.status(201).json(newWorkflow);
        } catch (error) {
            if (error.code === '23505') { // Duplicate key error
                return res.status(409).json({ error: 'Workflow step already exists for this warehouse and visitor type' });
            }
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // ======================
    // Update workflow
    // ======================
    updateWorkflow: async (req, res) => {
        const { id } = req.params;
        const { step_no, approver } = req.body;

        if (!validateUuid(id) || !validateUuid(approver) || !Number.isInteger(step_no) || step_no <= 0) {
            return res.status(400).json({
                error: 'Invalid input: id and approver must be valid UUIDs, step_no must be a positive integer'
            });
        }

        try {
            const existing = await db.select().from(warehouseWorkflow).where(eq(warehouseWorkflow.id, id));
            if (existing.length === 0) {
                return res.status(404).json({ error: 'Workflow entry not found' });
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
                return res.status(409).json({ error: 'Workflow step already exists for this warehouse and visitor type' });
            }

            const [updatedWorkflow] = await db
                .update(warehouseWorkflow)
                .set({ stepNo: step_no, approver })
                .where(eq(warehouseWorkflow.id, id))
                .returning();

            res.json(updatedWorkflow);
        } catch (error) {
            if (error.code === '23505') { // Duplicate key error
                return res.status(409).json({ error: 'Workflow step already exists for this warehouse and visitor type' });
            }
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // ======================
    // Delete workflow
    // ======================
    deleteWorkflow: async (req, res) => {
        const { id } = req.params;
        if (!validateUuid(id)) {
            return res.status(400).json({ error: 'Invalid workflow ID' });
        }
        try {
            const existing = await db.select().from(warehouseWorkflow).where(eq(warehouseWorkflow.id, id));
            if (existing.length === 0) {
                return res.status(404).json({ error: 'Workflow entry not found' });
            }

            await db.delete(warehouseWorkflow).where(eq(warehouseWorkflow.id, id));
            res.status(204).send();
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

module.exports = warehouseworkflowController;
