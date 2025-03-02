// server/src/routes/listings.js
import express from 'express';
import pg from 'pg';
const { Pool } = pg;

const router = express.Router();

// Configure database connection
const poolConfig = {
  connectionString: process.env.DB_URL,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false }
    : false
};

const pool = new Pool(poolConfig);

// Get paginated active listings
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (Math.max(1, page) - 1) * limit;

    const query = {
      text: `
        SELECT 
          l.listing_id,
          l.price,
          l.condition,
          l.created_at,
          l.status,
          p.title,
          p.description,
          p.image_url,
          u.username,
          u.avatar_url AS seller_avatar,
          u.university AS seller_university
        FROM listings l
        JOIN products p ON l.product_id = p.product_id
        JOIN users u ON l.user_id = u.user_id
        WHERE l.status = 'active'
        ORDER BY l.created_at DESC
        LIMIT $1 OFFSET $2
      `,
      values: [limit, offset]
    };

    const { rows } = await pool.query(query);
    
    if (rows.length === 0) {
      return res.status(404).json({ 
        error: 'No listings found', 
        suggestions: 'Try adjusting your search filters' 
      });
    }

    res.json({
      page: Number(page),
      limit: Number(limit),
      results: rows
    });

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Listings Error:`, error);
    res.status(500).json({
      error: 'Failed to fetch listings',
      ...(process.env.NODE_ENV === 'development' && {
        details: error.message,
        query: error.query
      })
    });
  }
});

// Get single listing details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = {
      text: `
        SELECT 
          l.*,
          p.title,
          p.description,
          p.image_url,
          u.username,
          u.avatar_url AS seller_avatar,
          u.university AS seller_university,
          u.email AS seller_contact
        FROM listings l
        JOIN products p ON l.product_id = p.product_id
        JOIN users u ON l.user_id = u.user_id
        WHERE l.listing_id = $1
      `,
      values: [id]
    };

    const { rows } = await pool.query(query);

    if (!rows[0]) {
      return res.status(404).json({ 
        error: 'Listing not found',
        suggestion: 'Verify the listing ID or try searching again'
      });
    }

    res.json(rows[0]);

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Single Listing Error:`, error);
    res.status(500).json({
      error: 'Failed to fetch listing details',
      ...(process.env.NODE_ENV === 'development' && {
        details: error.message,
        query: error.query
      })
    });
  }
});

// CORS Preflight Handling
router.options('/', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.status(204).end();
});

export default router;