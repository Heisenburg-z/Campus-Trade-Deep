import express from 'express';
import cors from 'cors';
import pool from './db.js';
import 'dotenv/config';

// Route imports
import authRouter from './routes/auth.js';
import listingsRouter from './routes/listings.js';
import usersRouter from './routes/users.js';
import messagesRouter from './routes/messages.js';
import searchRouter from './routes/search.js';
import reviewsRouter from './routes/reviews.js';
import categoriesRouter from './routes/categories.js';
import statisticsRouter from './routes/statistics.js';

const app = express();

// 1. Environment Validation
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'GOOGLE_CLIENT_ID'];
requiredEnvVars.forEach(varName => {
  console.log(`Checking environment variable: ${varName}`);
  console.log(`Value exists: ${!!process.env[varName]}`);
  console.log(`Actual value length: ${process.env[varName]?.length || 0}`);
  
  if (!process.env[varName]) {
    console.error(`CRITICAL: Missing required environment variable: ${varName}`);
    console.error('Current environment variables:', JSON.stringify(process.env, null, 2));
    
    // Instead of exiting, throw an error that can be caught
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});
// 2. Enhanced Security Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// 3. Body Parsing with Limits
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true, limit: '50kb' }));

// 4. Database Connection Verification
const verifyDatabaseConnection = async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log('Database connection verified');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

// 5. Route Configuration
app.use('/api/auth', authRouter);
app.use('/api/listings', listingsRouter);
app.use('/api/users', usersRouter);
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
      database: 'connected'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected'
    });
  }
});

// 7. Error Handling
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error:`, err.message);
  res.status(500).json({
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// 8. Server Initialization
const startServer = async () => {
  await verifyDatabaseConnection();
  
  const PORT = process.env.PORT || 8080;
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });

  // 9. Graceful Shutdown
  const shutdown = async (signal) => {
    console.log(`${signal} received: Closing server`);
    server.close(async () => {
      await pool.end();
      console.log('Server and database pool closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

startServer().catch(error => {
  console.error('Failed to start server:', error);
  console.error('Detailed error:', error.stack);
  process.exit(1);
});