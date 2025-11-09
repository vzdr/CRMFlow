import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import apiRoutes from './api';
import { errorHandler } from './middleware/errorHandler';
import { prisma } from './config/prisma';
import { ExecutionManager } from './services/execution.manager';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);

// Socket.IO setup
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Initialize ExecutionManager for real-time workflow execution
new ExecutionManager(io);

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging in development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
  });
}

// API Routes
app.use('/api', apiRoutes);

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.SERVER_PORT || 3001;

httpServer.listen(PORT, async () => {
  console.log('');
  console.log('='.repeat(50));
  console.log(`🚀 CRMFlow Backend Server`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log(`💚 Health: http://localhost:${PORT}/api/health`);
  console.log('='.repeat(50));
  console.log('');

  // Test database connection
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');

  httpServer.close(() => {
    console.log('HTTP server closed');
  });

  await prisma.$disconnect();
  console.log('Database connection closed');

  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\nSIGINT received, shutting down gracefully...');

  httpServer.close(() => {
    console.log('HTTP server closed');
  });

  await prisma.$disconnect();
  console.log('Database connection closed');

  process.exit(0);
});

export { io };
