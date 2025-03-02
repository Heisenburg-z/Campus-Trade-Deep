// db.js 
import pg from 'pg';
const { Pool } = pg;

export default new Pool({
  connectionString: process.env.DATABASE_URL, // NOT DB_URL
  ssl: {
    rejectUnauthorized: false // Required for Neon
  },
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 5000
});