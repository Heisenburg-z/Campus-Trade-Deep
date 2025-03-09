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

// Routes
app.use('/api/listings', listingsRouter);

// Enhanced health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// Server configuration
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received - closing server');
  server.close(() => {
    console.log('Server closed');
    pool.end();
    process.exit(0);
  });
});

// Add keep-alive headers
server.keepAliveTimeout = 60000;
server.headersTimeout = 65000;