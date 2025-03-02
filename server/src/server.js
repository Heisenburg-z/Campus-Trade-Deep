import express from 'express';
import cors from 'cors';
import pool from './db.js'; // Ensure this imports your corrected pool configuration
import listingsRouter from './routes/listings.js';

const app = express();

// Middleware Configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Database Connection Verification
pool.query('SELECT NOW()')
  .then(() => console.log('Connected to Neon PostgreSQL'))
  .catch(err => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });

// Routes
app.use('/api/listings', listingsRouter);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    dbConnected: !pool.ended,
    environment: process.env.NODE_ENV
  });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});

// Server Startup
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});