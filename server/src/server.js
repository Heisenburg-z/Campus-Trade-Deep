import express from 'express';
import cors from 'cors';
import pool from './db.js';
import 'dotenv/config';

// Route imports
import listingsRouter from './routes/listings.js';
import usersRouter from './routes/users.js';
import messagesRouter from './routes/messages.js';
import searchRouter from './routes/search.js';
import reviewsRouter from './routes/reviews.js';
import categoriesRouter from './routes/categories.js';
import statisticsRouter from './routes/statistics.js';

const app = express();

// ========================
// 1. ENVIRONMENT VALIDATION - RAILWAY FRIENDLY
// ========================
console.log('🚀 Starting Campus Trade Server');
console.log('==============================');
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`Port: ${process.env.PORT || '8080'}`);
console.log(`Database URL: ${process.env.DATABASE_URL ? 'Configured' : 'NOT Configured'}`);
console.log(`JWT Secret: ${process.env.JWT_SECRET ? 'Configured' : 'NOT Configured'}`);
console.log('==============================');

// Don't crash on missing vars - just warn
if (!process.env.DATABASE_URL) {
  console.warn('⚠️  WARNING: DATABASE_URL not set');
  console.warn('   Add PostgreSQL plugin in Railway dashboard');
}

if (!process.env.JWT_SECRET) {
  console.warn('⚠️  WARNING: JWT_SECRET not set');
  console.warn('   Add JWT_SECRET variable in Railway dashboard');
}

// ========================
// 2. CORS CONFIGURATION
// ========================
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://campus-trade-deep.vercel.app'
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors());

// ========================
// 3. MIDDLEWARE
// ========================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ========================
// 4. DATABASE CONNECTION
// ========================
const checkDatabase = async () => {
  if (!process.env.DATABASE_URL) {
    console.log('📊 Database: Not configured (running in limited mode)');
    return false;
  }

  try {
    console.log('📊 Attempting database connection...');
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Database connected!');
    return true;
  } catch (error) {
    console.warn(`⚠️  Database connection failed: ${error.message}`);
    console.log('   Running without database (some features disabled)');
    return false;
  }
};

// ========================
// 5. ROUTES
// ========================
app.use('/api/users', usersRouter);
app.use('/api/listings', listingsRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/search', searchRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/statistics', statisticsRouter);

// ========================
// 6. HEALTH CHECK
// ========================
app.get('/api/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: process.env.DATABASE_URL ? 'configured' : 'not_configured',
    services: {
      api: 'running',
      database: process.env.DATABASE_URL ? 'unknown' : 'not_configured'
    }
  };

  // Try to check database if configured
  if (process.env.DATABASE_URL) {
    try {
      await pool.query('SELECT 1');
      health.services.database = 'connected';
    } catch (error) {
      health.services.database = 'disconnected';
      health.status = 'degraded';
    }
  }

  res.status(200).json(health);
});

// ========================
// 7. ROOT ENDPOINT
// ========================
app.get('/', (req, res) => {
  res.json({
    message: '🎓 Campus Trade API',
    version: '1.0.0',
    status: 'running',
    database: process.env.DATABASE_URL ? 'configured' : 'not_configured',
    endpoints: {
      health: '/api/health',
      users: '/api/users',
      listings: '/api/listings',
      categories: '/api/categories'
    }
  });
});

// ========================
// 8. ERROR HANDLING
// ========================
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// ========================
// 9. 404 HANDLER
// ========================
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path
  });
});

// ========================
// 10. START SERVER
// ========================
const startServer = async () => {
  const PORT = process.env.PORT || 8080;
  
  // Check database (non-blocking)
  checkDatabase().then(connected => {
    if (connected) {
      console.log('✅ Server running with database support');
    } else {
      console.log('⚠️  Server running without database');
    }
  });

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('\n🎉 ====================================');
    console.log(`✅ Server started successfully!`);
    console.log(`   Port: ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Health check: /api/health`);
    console.log('====================================\n');
  });

  // Graceful shutdown
  const shutdown = async (signal) => {
    console.log(`\n⚠️  ${signal} received, shutting down...`);
    server.close(async () => {
      console.log('✅ HTTP server closed');
      try {
        await pool.end();
        console.log('✅ Database pool closed');
      } catch (err) {
        console.error('Error closing pool:', err.message);
      }
      process.exit(0);
    });

    setTimeout(() => {
      console.error('⏰ Force shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

// Start the server
startServer().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

export default app;