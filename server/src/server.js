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
// 1. ENVIRONMENT VALIDATION
// ========================
console.log('🚀 Starting Campus Trade Server');
console.log('==============================');
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`Port: ${process.env.PORT || '8080'}`);
console.log(`Database URL configured: ${!!process.env.DATABASE_URL}`);
console.log(`JWT Secret configured: ${!!process.env.JWT_SECRET}`);
console.log('==============================');

// Railway-friendly environment check - don't crash on missing vars
if (process.env.NODE_ENV === 'production') {
  const requiredVars = ['DATABASE_URL', 'JWT_SECRET'];
  let missingVars = [];
  
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
      console.warn(`⚠️  WARNING: Missing environment variable: ${varName}`);
    }
  });
  
  if (missingVars.length > 0) {
    console.warn(`\n⚠️  Server is starting without: ${missingVars.join(', ')}`);
    console.warn('   Some features may not work correctly.');
    console.warn('   Add these variables in Railway dashboard:\n');
    console.warn('   1. Go to your Railway project');
    console.warn('   2. Click "Variables" tab');
    console.warn('   3. Add missing variables\n');
  }
} else {
  // Development - be more strict
  const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      console.error(`❌ Missing environment variable: ${varName}`);
      console.error('   Create a .env file with:');
      console.error('   DATABASE_URL=postgresql://user:pass@localhost:5432/dbname');
      console.error('   JWT_SECRET=your_super_secret_key_here');
    }
  });
}

// ========================
// 2. CORS CONFIGURATION
// ========================
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://campus-trade-deep.vercel.app',
  process.env.FRONTEND_URL,
  process.env.CORS_ORIGIN
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      return callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      return callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Authorization'],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable preflight for all routes

// ========================
// 3. MIDDLEWARE
// ========================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// ========================
// 4. DATABASE CONNECTION
// ========================
const verifyDatabaseConnection = async (retries = 5, delay = 5000) => {
  if (!process.env.DATABASE_URL) {
    console.warn('⚠️  No DATABASE_URL provided. Skipping database connection.');
    return false;
  }

  for (let i = 0; i < retries; i++) {
    try {
      console.log(`🔌 Attempting database connection (attempt ${i + 1}/${retries})...`);
      const client = await pool.connect();
      const result = await client.query('SELECT NOW() as time, version() as version');
      client.release();
      
      console.log('✅ Database connected successfully!');
      console.log(`   Time: ${result.rows[0].time}`);
      console.log(`   PostgreSQL: ${result.rows[0].version.split(' ')[1]}`);
      return true;
      
    } catch (error) {
      console.warn(`⚠️  Database connection failed (attempt ${i + 1}/${retries}):`, error.message);
      
      if (i < retries - 1) {
        console.log(`   Retrying in ${delay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error('❌ All database connection attempts failed');
        if (process.env.NODE_ENV === 'production') {
          console.error('   Server will start without database connection');
          console.error('   Add PostgreSQL plugin in Railway dashboard');
        }
        return false;
      }
    }
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
// 6. HEALTH CHECK ENDPOINT
// ========================
app.get('/api/health', async (req, res) => {
  const healthcheck = {
    status: 'checking',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: 'checking',
    memory: process.memoryUsage(),
    node: process.version
  };

  try {
    if (process.env.DATABASE_URL) {
      await pool.query('SELECT 1');
      healthcheck.database = 'connected';
      healthcheck.status = 'healthy';
    } else {
      healthcheck.database = 'not_configured';
      healthcheck.status = 'degraded';
      healthcheck.warning = 'DATABASE_URL not configured';
    }
    
    res.status(200).json(healthcheck);
  } catch (error) {
    healthcheck.database = 'disconnected';
    healthcheck.status = 'unhealthy';
    healthcheck.error = error.message;
    res.status(503).json(healthcheck);
  }
});

// ========================
// 7. ROOT ENDPOINT
// ========================
app.get('/', (req, res) => {
  res.json({
    message: '🎓 Campus Trade API',
    version: '1.0.0',
    description: 'University marketplace for buying and selling items',
    environment: process.env.NODE_ENV || 'development',
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
    },
    documentation: 'https://github.com/yourusername/campus-trade',
    status: 'operational'
  });
});

// ========================
// 8. ERROR HANDLING
// ========================
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  // JWT Authentication errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token',
      message: 'Authentication token is invalid or expired'
    });
  }

  // Database errors
  if (err.code && err.code.startsWith('23')) {
    return res.status(400).json({
      error: 'Database error',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Invalid data provided'
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    error: err.name || 'InternalServerError',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ========================
// 9. 404 HANDLER
// ========================
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `The requested resource ${req.originalUrl} was not found`,
    timestamp: new Date().toISOString(),
    availableEndpoints: {
      root: '/',
      health: '/api/health',
      apiDocs: 'Check the root endpoint for available routes'
    }
  });
});

// ========================
// 10. SERVER INITIALIZATION
// ========================
const startServer = async () => {
  console.log('\n🔧 Initializing server...');
  
  // Verify database connection (non-blocking for Railway)
  if (process.env.DATABASE_URL) {
    console.log('📊 Checking database connection...');
    verifyDatabaseConnection().then(success => {
      if (success) {
        console.log('✅ Database ready for queries');
      } else {
        console.log('⚠️  Database not available - some features disabled');
      }
    });
  } else {
    console.log('⚠️  No DATABASE_URL - running without database');
  }

  const PORT = process.env.PORT || 8080;
  
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('\n🎉 ====================================');
    console.log(`✅ Server successfully started!`);
    console.log(`   Port: ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   URL: http://localhost:${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health`);
    console.log('====================================\n');
    
    console.log('📋 Available endpoints:');
    console.log('   👤 Auth: /api/users/register, /api/users/login');
    console.log('   🏠 Listings: /api/listings');
    console.log('   📊 Health: /api/health');
    console.log('   📁 Categories: /api/categories');
    console.log('\n💡 Tip: Add PostgreSQL plugin in Railway for database');
  });

  // ========================
  // 11. GRACEFUL SHUTDOWN
  // ========================
  const shutdown = async (signal) => {
    console.log(`\n⚠️  ${signal} received, initiating graceful shutdown...`);
    
    // Stop accepting new connections
    server.close(async () => {
      console.log('✅ HTTP server closed');
      
      try {
        // Close database pool
        await pool.end();
        console.log('✅ Database pool closed');
      } catch (err) {
        console.error('❌ Error closing database pool:', err.message);
      }
      
      console.log('👋 Server shutdown complete');
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      console.error('⏰ Force shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  // Handle termination signals
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Handle uncaught errors
  process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
    shutdown('UNCAUGHT_EXCEPTION');
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    shutdown('UNHANDLED_REJECTION');
  });
};

// Start the server
startServer().catch((error) => {
  console.error('❌ Failed to start server:', error);
  console.error('Stack trace:', error.stack);
  process.exit(1);
});

export default app;