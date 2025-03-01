import listingsRouter from './routes/listings.js';
import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';


// Rest of your code remains the same

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DB_URL,
  ssl: { rejectUnauthorized: false }
});

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN }));

//after initializing Express app im so lost
app.use('/api/listings', listingsRouter);

// Example route
//  before other routes
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/api/listings', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM listings');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});