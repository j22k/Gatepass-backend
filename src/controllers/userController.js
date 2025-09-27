const bcrypt = require('bcrypt');
const db = require('../config/database');
const { users, warehouse } = require('../schema');
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
        .where(eq(users.id, id))
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
      const { name, email, phone, password, designation, role, warehouseId, isActive } = req.body;

      const updateData = { name, email, phone, designation, role, warehouseId, isActive };
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

  // Delete a user
  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      if (!validateUuid(id)) { // Validate ID format
        return res.status(400).json({ success: false, message: 'Invalid ID format' });
      }
      const result = await db.delete(users).where(eq(users.id, id)).returning();

      if (result.length === 0) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      res.json({ success: true, data: result[0] });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
};

module.exports = userController;
