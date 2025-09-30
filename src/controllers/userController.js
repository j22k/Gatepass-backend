const bcrypt = require('bcrypt');
const db = require('../config/database');
const { users, warehouse, warehouseWorkflow, approval } = require('../schema');
const { eq, and } = require('drizzle-orm');
const { validateUuid } = require('../utils/uuidValidator'); // Import the validator

const userController = {
  // Get all users
  async getAllUsers(req, res) {
    try {
      const result = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          phone: users.phone,
          designation: users.designation,
          role: users.role,
          warehouseName: warehouse.name,
          isActive: users.isActive,
        })
        .from(users)
        .leftJoin(warehouse, eq(users.warehouseId, warehouse.id))
        .orderBy(users.name);

      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Get user by ID
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      if (!validateUuid(id)) { // Validate ID format
        return res.status(400).json({ success: false, message: 'Invalid ID format' });
      }
      const result = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          phone: users.phone,
          designation: users.designation,
          role: users.role,
          warehouseName: warehouse.name,
          isActive: users.isActive,
        })
        .from(users)
        .leftJoin(warehouse, eq(users.warehouseId, warehouse.id))
        .where(eq(users.id, id), eq(users.isActive, true))  // Filter active only
        .limit(1);

      if (result.length === 0) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      res.json({ success: true, data: result[0] });
    } catch (error) {
      console.error('Get user by ID error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Create a new user
  async createUser(req, res) {
    try {
      const { name, email, phone, password, designation, role, warehouseId } = req.body;
      console.log('req.body:', req.body);
      
      // Validate warehouseId if provided
      if (warehouseId) {
        if (!validateUuid(warehouseId)) {
          return res.status(400).json({ success: false, message: 'Invalid warehouse ID format' });
        }
        const [warehouseExists] = await db.select().from(warehouse).where(eq(warehouse.id, warehouseId)).limit(1);
        if (!warehouseExists) {
          return res.status(400).json({ success: false, message: 'Invalid warehouse ID' });
        }
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await db
        .insert(users)
        .values({
          name,
          email,
          phone,
          password: hashedPassword,
          designation,
          role,
          warehouseId,
          isActive: true, // Set isActive to true by default
        })
        .returning({
          id: users.id,
          name: users.name,
          email: users.email,
          phone: users.phone,
          designation: users.designation,
          role: users.role,
          isActive: users.isActive,
        });

      res.status(201).json({ success: true, data: result[0] });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Update a user
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      if (!validateUuid(id)) { // Validate ID format
        return res.status(400).json({ success: false, message: 'Invalid ID format' });
      }
      const { name, email, phone, password, designation, role, warehouseId, isActive } = req.body;  // Allow updating isActive

      // Validate warehouseId if provided
      if (warehouseId) {
        if (!validateUuid(warehouseId)) {
          return res.status(400).json({ success: false, message: 'Invalid warehouse ID format' });
        }
        const [warehouseExists] = await db.select().from(warehouse).where(eq(warehouse.id, warehouseId)).limit(1);
        if (!warehouseExists) {
          return res.status(400).json({ success: false, message: 'Invalid warehouse ID' });
        }
      }

      const updateData = { name, email, phone, designation, role, warehouseId, isActive };  // Include isActive
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }

      const result = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, id))
        .returning();

      if (result.length === 0) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      res.json({ success: true, data: result[0] });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Delete a user (soft delete)
  async disableUser(req, res) {
    try {
      const { id } = req.params;
      if (!validateUuid(id)) { // Validate ID format
        return res.status(400).json({ success: false, message: 'Invalid ID format' });
      }
      
      // Check if user is referenced in warehouse_workflow as approver
      const workflowRefs = await db.select().from(warehouseWorkflow).where(eq(warehouseWorkflow.approver, id)).limit(1);
      if (workflowRefs.length > 0) {
        return res.status(400).json({ success: false, message: 'Cannot disable user: User is assigned as an approver in warehouse workflows' });
      }
      
      // Check if user is referenced in approval as approver
      const approvalRefs = await db.select().from(approval).where(eq(approval.approver, id)).limit(1);
      if (approvalRefs.length > 0) {
        return res.status(400).json({ success: false, message: 'Cannot disable user: User is assigned as an approver in pending approvals' });
      }
      
      // Delete pending approvals for this user to prevent workflow blockage
      await db.delete(approval).where(and(eq(approval.approver, id), eq(approval.status, 'pending')));
      
      const result = await db
        .update(users)
        .set({ isActive: false })  // Soft delete: disable instead of delete
        .where(eq(users.id, id))
        .returning();

      if (result.length === 0) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      res.json({ success: true, data: result[0] });
    } catch (error) {
      console.error('Disable user error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Enable a user
  async enableUser(req, res) {
    try {
      const { id } = req.params;
      if (!validateUuid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid ID format' });
      }
      const result = await db
        .update(users)
        .set({ isActive: true })
        .where(eq(users.id, id))
        .returning();

      if (result.length === 0) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      res.json({ success: true, data: result[0] });
    } catch (error) {
      console.error('Enable user error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  // Get users by warehouse ID
  async getUsersByWarehouseId(req, res) {
    try {
      const { warehouseId } = req.params;
      if (!validateUuid(warehouseId)) {
        return res.status(400).json({ success: false, message: 'Invalid warehouse ID format' });
      }
      // Check if warehouse exists
      const [warehouseExists] = await db.select().from(warehouse).where(eq(warehouse.id, warehouseId)).limit(1);
      if (!warehouseExists) {
        return res.status(404).json({ success: false, message: 'Warehouse not found' });
      }
      const result = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          phone: users.phone,
          designation: users.designation,
          role: users.role,
          warehouseName: warehouse.name,
          isActive: users.isActive,
        })
        .from(users)
        .leftJoin(warehouse, eq(users.warehouseId, warehouse.id))
        .where(eq(users.warehouseId, warehouseId), eq(users.isActive, true)) // Filter active only
        .orderBy(users.name);

      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Get users by warehouse ID error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },
};

module.exports = userController;
