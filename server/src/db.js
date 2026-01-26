import pg from 'pg';
const { Pool } = pg;

const poolConfig = {
  connectionString: process.env.DATABASE_URL,
};

// Only use SSL in production (not in development)
if (process.env.NODE_ENV === 'production') {
  poolConfig.ssl = {
    rejectUnauthorized: false // Set to true if you have proper certificates
  };
}

const pool = new Pool(poolConfig);

// Connection error handling
pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

export default pool;