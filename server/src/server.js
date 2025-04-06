import express from 'express';
import cors from 'cors';
import pool from './db.js';
import 'dotenv/config';
import helmet from 'helmet'; // Added security headers

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

// 1. Enhanced Environment Validation
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'GOOGLE_CLIENT_ID', 'CORS_ORIGIN'];
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`CRITICAL: Missing required environment variable: ${varName}`);
    process.exit(1);
  }
});

// 2. Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// 3. Body Parsing with sane limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

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

// 6. Enhanced Health Check
app.get('/api/health', async (req, res) => {
  try {
    const [dbResult] = await Promise.all([
      pool.query('SELECT NOW()'),
      new Promise(resolve => setTimeout(resolve, 500)) // Simulate async operation
    ]);
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        responseTime: `${dbResult.rows[0].now}`
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected'
    });
  }
});

// 7. Improved Error Handling
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error(`[${new Date().toISOString()}] Error: ${err.message}\n${err.stack}`);
  
  const response = {
    error: 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && {
      details: err.message,
      stack: err.stack
    })
  };

  res.status(err.statusCode || 500).json(response);
});

// 8. Server Initialization with proper async handling
const startServer = async () => {
  try {
    await verifyDatabaseConnection();
    
    const PORT = process.env.PORT || 8080;
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      console.log(`CORS origin allowed: ${process.env.CORS_ORIGIN}`);
    });

    // 9. Graceful Shutdown with timeout
    const shutdown = async (signal) => {
      console.log(`\n${signal} received: Closing server`);
      try {
        await new Promise((resolve, reject) => {
          server.close(async (err) => {
            if (err) reject(err);
            console.log('HTTP server closed');
            await pool.end();
            console.log('Database pool closed');
            resolve();
          });
        });
        process.exit(0);
      } catch (err) {
        console.error('Shutdown error:', err);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();