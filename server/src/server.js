import express from 'express';
import cors from 'cors';
import pool from './db.js';
import 'dotenv/config';

// Route imports - REMOVE authRouter since auth is in users.js
import listingsRouter from './routes/listings.js';
import usersRouter from './routes/users.js';
import messagesRouter from './routes/messages.js';
import searchRouter from './routes/search.js';
import reviewsRouter from './routes/reviews.js';
import categoriesRouter from './routes/categories.js';
import statisticsRouter from './routes/statistics.js';

const app = express();

// 1. Environment Validation - FIXED to check if running
if (process.env.NODE_ENV !== 'test') {
  const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      console.error(`CRITICAL: Missing required environment variable: ${varName}`);
      // Don't throw, just warn for development
      if (process.env.NODE_ENV === 'production') {
        throw new Error(`Missing required environment variable: ${varName}`);
      }
    }
  });
}

// 2. CORS Configuration
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'https://campus-trade-deep.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', cors());

// 3. Body Parsing
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true, limit: '50kb' }));

// 4. Database Connection Verification
const verifyDatabaseConnection = async () => {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('Database connection verified');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    // Don't exit in development
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

// 5. Route Configuration - REMOVED authRouter
app.use('/api/users', usersRouter); // This handles /register, /login, /auth/google
app.use('/api/listings', listingsRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/search', searchRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/statistics', statisticsRouter);

// 6. Health Check Endpoint
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Database connection error'
    });
  }
});

// 7. Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Campus Trade API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/users/register, /api/users/login, /api/users/auth/google',
      users: '/api/users/me, /api/users/:id',
      listings: '/api/listings',
      categories: '/api/categories',
      messages: '/api/messages',
      search: '/api/search',
      reviews: '/api/reviews',
      statistics: '/api/statistics',
      health: '/api/health'
    }
  });
});

// 8. Error Handling
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error:`, err.message);
  
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
    status: err.status || 500
  });
});

// 9. 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    status: 404,
    path: req.path
  });
});

// 10. Server Initialization
const startServer = async () => {
  await verifyDatabaseConnection();
  
  const PORT = process.env.PORT || 8080;
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });

  // Graceful Shutdown
  const shutdown = async (signal) => {
    console.log(`${signal} received: Closing server`);
    server.close(async () => {
      await pool.end();
      console.log('Server and database pool closed');
      process.exit(0);
    });
    
    setTimeout(() => {
      console.log('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});