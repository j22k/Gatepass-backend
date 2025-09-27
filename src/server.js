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
app.use(cors());
app.use(express.json());
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
    timestamp: new Date().toISOString()
  });
});


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

// 404 handler (fixed)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📱 API Health Check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth Login: http://localhost:${PORT}/api/auth/login`);
});

module.exports = app;