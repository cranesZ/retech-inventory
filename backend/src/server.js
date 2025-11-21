import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { initializeStorage } from './config/supabase.js';
import devicesRouter from './routes/devices.js';
import authRouter from './routes/auth.js';
import sickwRouter from './routes/sickw.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'];
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Retech Inventory Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/devices', devicesRouter);
app.use('/api/sickw', sickwRouter);

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Retech Inventory Management System API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      devices: '/api/devices',
      sickw: '/api/sickw',
      documentation: '/api/docs'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(err.status || 500).json({
    success: false,
    error: isDevelopment ? err.message : 'Internal server error',
    ...(isDevelopment && { stack: err.stack })
  });
});

// Initialize storage buckets and start server
async function startServer() {
  try {
    // Initialize Supabase storage buckets
    console.log('🔧 Initializing Supabase storage...');
    await initializeStorage();

    // Start Express server
    app.listen(PORT, () => {
      console.log('');
      console.log('╔════════════════════════════════════════════════╗');
      console.log('║   Retech Inventory Backend Server Started     ║');
      console.log('╚════════════════════════════════════════════════╝');
      console.log('');
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`📡 API endpoint: http://localhost:${PORT}/api`);
      console.log(`🗄️  Supabase URL: ${process.env.SUPABASE_URL}`);
      console.log('');
      console.log('Ready to accept requests! 🚀');
      console.log('');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();
