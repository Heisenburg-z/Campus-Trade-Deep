import pg from 'pg';
const { Pool } = pg;

// Database configuration
const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  // Connection pool settings
  max: process.env.NODE_ENV === 'production' ? 20 : 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
};

// SSL for production (Railway PostgreSQL requires SSL)
if (process.env.NODE_ENV === 'production') {
  poolConfig.ssl = {
    rejectUnauthorized: false
  };
}

// Create the pool
const pool = new Pool(poolConfig);

// Event listeners for debugging
pool.on('connect', () => {
  console.log('🔌 New database connection established');
});

pool.on('error', (err) => {
  console.error('💥 Unexpected database error:', err.message);
  // Don't crash in production
  if (process.env.NODE_ENV !== 'production') {
    process.exit(-1);
  }
});

pool.on('remove', () => {
  console.log('🔌 Database connection removed');
});

export default pool;