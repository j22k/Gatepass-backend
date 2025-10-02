const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { users, warehouse } = require('../schema');
const { eq, and } = require('drizzle-orm');

const authController = {
  // Login user
  async login(req, res) {
    try {
      const { email, password } = req.body;

      const result = await db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        password: users.password,
        designation: users.designation,
        role: users.role,
        warehouseName: warehouse.name,
        isActive: users.isActive,
      })
      .from(users)
      .leftJoin(warehouse, eq(users.warehouseId, warehouse.id))
      .where(and(eq(users.email, email.toLowerCase()), eq(users.isActive, true)))
      .limit(1);

      if (result.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      const user = result[0];

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      const token = jwt.sign(
        { 
          userId: user.id,
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      delete user.password;
     
      if (user.role === 'Admin') {
        user.redirectTo = '/admin/admin-dashboard';
      } else if (user.role === 'Receptionist') {
        user.redirectTo = '/reception/reception-dashboard';
      } else{
        user.redirectTo = '/approver/approver-dashboard'
      }
      
      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            designation: user.designation,
            role: user.role,
            warehouse: user.warehouseName,
            isActive: user.isActive
          },
          redirectTo: user.redirectTo,
          // Updated: Return only the JWT token (client should prefix "Bearer")
          token: token
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

    // Verify token and return current user
  async verifyToken(req, res) {
    try {
      // authenticateToken middleware sets req.user
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
      }

      res.json({
        success: true,
        user: {
          ...req.user,
          redirectTo: req.user.role === 'Admin' ? '/admin/admin-dashboard' :
                      req.user.role === 'Receptionist' ? '/reception/reception-dashboard' :
                      '/approver/approver-dashboard',
        },
      });
    } catch (error) {
      console.error('Verify token error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },
  
  // Get current user profile
  async getProfile(req, res) {
    try {
      const userId = req.user.id;

      const result = await db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        designation: users.designation,
        role: users.role,
        warehouseName: warehouse.name,
        warehouseLocation: warehouse.location,
        isActive: users.isActive,
      })
      .from(users)
      .leftJoin(warehouse, eq(users.warehouseId, warehouse.id))
      .where(eq(users.id, userId))
      .limit(1);

      if (result.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const user = result[0];

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            designation: user.designation,
            role: user.role,
            warehouse: {
              name: user.warehouseName,
              location: user.warehouseLocation
            },
            isActive: user.isActive
          }
        }
      });

    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Logout user (optional - mainly for token blacklisting if implemented)
  async logout(req, res) {
    try {
      // In a more advanced setup, you might want to blacklist the token
      // For now, just return a success message
      res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};

module.exports = authController;