// server/src/routes/statistics.js
import express from 'express';
import pool from '../db.js';

const router = express.Router();

// Get user statistics
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify user exists
    const userExists = await pool.query(
      'SELECT 1 FROM users WHERE user_id = $1',
      [userId]
    );
    
    if (!userExists.rowCount) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get statistics from materialized view
    const { rows } = await pool.query(
      `SELECT 
        total_listings,
        active_listings,
        completed_transactions,
        avg_rating,
        total_reviews
       FROM user_statistics
       WHERE user_id = $1`,
      [userId]
    );

    res.json(rows[0] || {});
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Statistics Error:`, error);
    res.status(500).json({
      error: 'Failed to fetch statistics',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
});

// Get platform-wide statistics
router.get('/', async (req, res) => {
  try {
    const stats = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query('SELECT COUNT(*) FROM listings WHERE status = \'active\''),
      pool.query('SELECT COUNT(*) FROM transactions'),
      pool.query('SELECT AVG(rating) FROM reviews')
    ]);

    res.json({
      total_users: parseInt(stats[0].rows[0].count),
      active_listings: parseInt(stats[1].rows[0].count),
      total_transactions: parseInt(stats[2].rows[0].count),
      average_rating: parseFloat(stats[3].rows[0].avg || 0)
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Platform Stats Error:`, error);
    res.status(500).json({
      error: 'Failed to fetch platform statistics',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
});

export default router;