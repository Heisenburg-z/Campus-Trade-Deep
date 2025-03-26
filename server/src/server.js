import express from 'express';
import cors from 'cors';
import pool from './db.js';
import 'dotenv/config';
import authRouter from './routes/auth.js';

// Import all route handlers
import listingsRouter from './routes/listings.js';
import usersRouter from './routes/users.js';
import messagesRouter from './routes/messages.js';
import searchRouter from './routes/search.js';
import reviewsRouter from './routes/reviews.js';
import categoriesRouter from './routes/categories.js';
import statisticsRouter from './routes/statistics.js';
app.use('/api/auth', authRouter);

const app = express();

// Enhanced security middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400
}));

// Body parsing with limits
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Rate limiting headers (actual rate limiting should be implemented via middleware)
app.use((req, res, next) => {
  res.setHeader('X-RateLimit-Limit', '100');
  res.setHeader('X-RateLimit-Remaining', '99');
  next();
});

// API routes
app.use('/api/listings', listingsRouter);
app.use('/api/users', usersRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/search', searchRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/statistics', statisticsRouter);

// Enhanced health check with DB connection verification
app.get('api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      db: 'connected',
      uptime: process.uptime()
    });
  } catch (err) {
    res.status(503).json({
      status: 'down',
      timestamp: new Date().toISOString(),
      db: 'disconnected',
      error: err.message
    });
  }
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    suggestion: 'Check the API documentation at /api/docs'
  });
});

// Enhanced error handling
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Server Error:`, err.message);
  
  const response = {
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && {
      message: err.message,
      stack: err.stack
    })
  };

  res.status(err.statusCode || 500).json(response);
});

// Server configuration
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Production-grade graceful shutdown
const shutdown = (signal) => {
  console.log(`${signal} received - closing server`);
  server.close(async () => {
    console.log('HTTP server closed');
    await pool.end();
    console.log('Database connection pool closed');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Keep-alive tuning for load balancers
server.keepAliveTimeout = 60000;
server.headersTimeout = 65000;