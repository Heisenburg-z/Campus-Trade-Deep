import pg from 'pg';
const { Pool } = pg;

const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  // Connection pool settings for production
  max: 20, // maximum number of clients in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
};

// SSL configuration for production
if (process.env.NODE_ENV === 'production' || process.env.DATABASE_URL?.includes('sslmode=require')) {
  poolConfig.ssl = {
    rejectUnauthorized: false
  };
}

const pool = new Pool(poolConfig);

// Log connection events
pool.on('connect', () => {
  console.log('New database connection established');
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
  // In production, don't exit, just log
  if (process.env.NODE_ENV !== 'production') {
    process.exit(-1);
  }
});

export default pool;