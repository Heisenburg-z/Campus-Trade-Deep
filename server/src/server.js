import express from 'express';
import cors from 'cors';
import pool from './db.js';
import listingsRouter from './routes/listings.js';
import 'dotenv/config';

const app = express();

// Enhanced CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Database connection verification with timeout
const dbConnectionTimeout = setTimeout(() => {
  console.error('Database connection timeout');
  process.exit(1);
}, 5000);

pool.query('SELECT 1')
  .then(() => {
    clearTimeout(dbConnectionTimeout);
    console.log('✅ Database connected');
  })
  .catch(err => {
    clearTimeout(dbConnectionTimeout);
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  });

// Routes
app.use('/api/listings', listingsRouter);

// Simplified health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Error handling
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// Server setup with graceful shutdown
const server = app.listen(process.env.PORT || 8080, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${process.env.PORT || 8080}`);
});

// Handle SIGTERM from Railway
process.on('SIGTERM', () => {
  console.log('SIGTERM received - shutting down');
  server.close(() => {
    pool.end();
    console.log('Server closed');
    process.exit(0);
  });
});