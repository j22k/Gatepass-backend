const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { users, warehouse } = require('../schema');
const { eq, and } = require('drizzle-orm');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access token is required' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const result = await db.select({
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
    .where(and(eq(users.id, decoded.userId), eq(users.isActive, true)))
    .limit(1);

    if (result.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }

    req.user = result[0];
    next();
  } catch (error) {
    return res.status(403).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
};

// Middleware to check user roles
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Insufficient permissions' 
      });
    }

    next();
  };
};

module.exports = { authenticateToken, authorizeRoles };