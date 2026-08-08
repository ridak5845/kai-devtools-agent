require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const agentRoutes = require('./routes/agent');
const { startScheduler } = require('./jobs/scheduler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/agent', agentRoutes);

// Simple health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Only start the server and scheduler if this file is run directly
// (not when imported by our test files)
if (require.main === module) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => {
      console.log('Connected to MongoDB');
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        startScheduler();
      });
    })
    .catch((error) => {
      console.error('MongoDB connection error:', error.message);
      process.exit(1);
    });
}

module.exports = app;