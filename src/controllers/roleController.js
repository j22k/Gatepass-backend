const { userRole } = require('../schema'); // Import enum for reference


const roleController = {
  // Get all roles (fixed enum values, no database query)
  async getAllRoles(req, res) {
    try {
      // Return fixed roles directly
      res.json({
        success: true,
        data: ['Admin', 'Receptionist', 'Approver']
      });
    } catch (error) {
      console.error('Get all roles error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};

module.exports = roleController;