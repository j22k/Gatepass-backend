require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const warehouseRoutes = require('./routes/warehouseRoute');
const userRoutes = require('./routes/userRoutes');
const roleRoutes = require('./routes/roleRoutes');
const visitortypeRoutes = require('./routes/visitortypeRoutes');
const visitorRoutes = require('./routes/visitorRoutes');
const warehouseTimeSlotRoutes = require('./routes/warehouseTimeSlotRoutes');
const warehouseworkflowRoutes = require('./routes/warehouseworkflowRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.ALLOWED_ORIGINS : '*', // Restrict in production
  credentials: true,
}));
app.use(express.json({ limit: '10mb' })); // Add payload limit for security
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/warehouse', warehouseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/role/', roleRoutes)
app.use('/api/visitortypes', visitortypeRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/warehouse-time-slots', warehouseTimeSlotRoutes);
app.use('/api/warehouse-workflow', warehouseworkflowRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Gatepass Backend API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { error: err.message }), // Expose error in dev only
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

const HOST = '0.0.0.0';  // <-- listen on all network interfaces
app.listen(PORT, HOST, () => {
  console.log(`🚀 Server is running on http://${HOST}:${PORT}`);
  console.log(`📱 API Health Check: http://${HOST}:${PORT}/health`);
  console.log(`🔐 Auth Login: http://${HOST}:${PORT}/api/auth/login`);
  if (process.env.NODE_ENV === 'development') {
    console.log(`Environment: ${process.env.NODE_ENV}`);
  }
});


module.exports = app;