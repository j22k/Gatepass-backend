const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { users, warehouse } = require('../schema');
const { eq, and } = require('drizzle-orm');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  // Updated: Support both "Bearer token" and plain "token" formats
  const token = authHeader && (authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader);

  if (!token || typeof token !== 'string' || token.trim() === '') {
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
      warehouseId: warehouse.id,  // Add warehouse ID
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
    console.log(req.user);
    
    next();
  } catch (error) {
    console.log("Error in token authentication:", error.message);
    
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
      console.log("Authentication check failed");
      
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    if (!roles.includes(req.user.role)) {
      console.log("Authorization check failed for role:", req.user.role);
      
      return res.status(403).json({ 
        success: false, 
        message: 'Insufficient permissions' 
      });
    }

    next();
  };
};

module.exports = { authenticateToken, authorizeRoles };