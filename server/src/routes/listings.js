// server/src/routes/listings.js
import express from 'express';
import pg from 'pg';
const { Pool } = pg;

const router = express.Router();
const pool = new Pool({
  connectionString: process.env.DB_URL,
  ssl: { rejectUnauthorized: false }
});

// Get all listings
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        l.*, 
        p.title, 
        p.description,
        u.username,
        u.avatar_url
      FROM listings l
      JOIN products p ON l.product_id = p.product_id
      JOIN users u ON l.user_id = u.user_id
      WHERE l.status = 'active'
    `);
    res.json(rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

// Get single listing by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      `SELECT * FROM listings WHERE listing_id = $1`,
      [id]
    );
    res.json(rows[0] || {});
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch listing' });
  }
});

// Create new listing
router.post('/', async (req, res) => {
  // Implementation would go here
});

export default router;