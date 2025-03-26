// server/src/routes/search.js
import express from 'express';
import pool from '../db.js';

const router = express.Router();

// Text search
router.get('/text', async (req, res) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;
    const offset = (Math.max(1, page) - 1) * limit;

    if (!query?.trim()) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const { rows } = await pool.query({
      text: 'SELECT * FROM search_listings($1) LIMIT $2 OFFSET $3',
      values: [query.trim(), limit, offset]
    });

    res.json({
      page: Number(page),
      limit: Number(limit),
      results: rows
    });

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Search Error:`, error);
    res.status(500).json({
      error: 'Search failed',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
});

// Nearby listings search
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 5000, page = 1, limit = 10 } = req.query;
    const offset = (Math.max(1, page) - 1) * limit;

    // Validate coordinates
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    const { rows } = await pool.query({
      text: 'SELECT * FROM find_nearby_listings($1, $2, $3) LIMIT $4 OFFSET $5',
      values: [parseFloat(lat), parseFloat(lng), parseInt(radius), limit, offset]
    });

    res.json({
      page: Number(page),
      limit: Number(limit),
      results: rows
    });

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Nearby Search Error:`, error);
    res.status(500).json({
      error: 'Location search failed',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
});

export default router;