// server/src/routes/categories.js
import express from 'express';
import pool from '../db.js';

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json(rows);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Categories Error:`, error);
    res.status(500).json({
      error: 'Failed to fetch categories',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
});

// Create new category (admin only)
router.post('/', async (req, res) => {
  try {
    const { name, icon_url } = req.body;
    
    const { rows } = await pool.query(
      'INSERT INTO categories (name, icon_url) VALUES ($1, $2) RETURNING *',
      [name, icon_url]
    );
    
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Create Category Error:`, error);
    res.status(500).json({
      error: 'Failed to create category',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
});

export default router;