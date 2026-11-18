import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import topologyRoutes from './routes/topologyRoutes.js';
import algorithmRoutes from './routes/algorithmRoutes.js';
import { notFoundHandler, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend development
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());

// API health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'NetRoute Backend API',
  });
});

// Mount routes
app.use('/api/topology', topologyRoutes);
app.use('/api/algorithm', algorithmRoutes);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start server and connect to MongoDB
const startServer = async () => {
  try {
    await connectDB();
    console.log('[NetRoute] Connected to MongoDB database.');
  } catch (err) {
    console.error('[NetRoute] WARNING: Could not establish MongoDB connection:', err.message);
    console.error('[NetRoute] Please make sure your local MongoDB instance is running at', process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/network_routing_sim');
  }

  app.listen(PORT, () => {
    console.log(`[NetRoute] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`[NetRoute] API Endpoint: http://localhost:${PORT}/api/topology/current`);
  });
};

startServer();
