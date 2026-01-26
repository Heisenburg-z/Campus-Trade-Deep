import pg from 'pg';
const { Pool } = pg;

// Parse DATABASE_URL to fix Neon connection
let connectionString = process.env.DATABASE_URL;

// Fix for Neon.tech connection string format
if (connectionString && connectionString.includes('neon.tech')) {
  console.log('🔧 Detected Neon.tech PostgreSQL, adjusting connection...');
  
  // Ensure SSL is properly configured for Neon
  if (!connectionString.includes('sslmode=')) {
    connectionString += '&sslmode=require';
  }
  
  // Add connection timeout for Neon
  if (!connectionString.includes('connect_timeout=')) {
    connectionString += '&connect_timeout=30';
  }
}

const poolConfig = {
  connectionString: connectionString,
  // Connection pool settings
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Increased for Neon
};

// SSL configuration for production (required for Neon)
if (process.env.NODE_ENV === 'production') {
  poolConfig.ssl = {
    rejectUnauthorized: false,
    require: true
  };
}

// For Neon specifically, use this SSL config
if (connectionString && connectionString.includes('neon.tech')) {
  poolConfig.ssl = {
    require: true,
    rejectUnauthorized: false
  };
}

const pool = new Pool(poolConfig);

// Event listeners
pool.on('connect', () => {
  console.log('✅ New database connection established');
});

pool.on('error', (err) => {
  console.error('💥 Database error:', err.message);
  // Don't crash in production
});

export default pool;