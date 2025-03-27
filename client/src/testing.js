import express from 'express';
import cors from 'cors';
import pool from './db.js';
import 'dotenv/config';

// Route imports
import authRouter from './routes/auth.js';
import listingsRouter from './routes/listings.js';
import usersRouter from './routes/users.js';
import messagesRouter from './routes/messages.js';
import searchRouter from './routes/search.js';
import reviewsRouter from './routes/reviews.js';
import categoriesRouter from './routes/categories.js';
import statisticsRouter from './routes/statistics.js';

const app = express();

// 1. Environment Validation with Detailed Logging
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'GOOGLE_CLIENT_ID'];
requiredEnvVars.forEach(varName => {
  console.log(`Checking environment variable: ${varName}`);
  console.log(`Value exists: ${!!process.env[varName]}`);
  console.log(`Actual value length: ${process.env[varName]?.length || 0}`);
  
  if (!process.env[varName]) {
    console.error(`CRITICAL: Missing required environment variable: ${varName}`);
    console.error('Current environment variables:', JSON.stringify(process.env, null, 2));
    
    // Instead of exiting, throw an error that can be caught
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});

// Rest of the code remains the same...

// Modify startServer to catch and log any environment variable errors
startServer().catch(error => {
  console.error('Failed to start server:', error);
  console.error('Detailed error:', error.stack);
  process.exit(1);
});