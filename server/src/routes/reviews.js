// server/src/routes/reviews.js
import express from 'express';
import pool from '../db.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get reviews for user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const query = {
      text: `
        SELECT 
          r.*, 
          rev.username AS reviewer_name,
          rev.avatar_url AS reviewer_avatar
        FROM reviews r
        JOIN users rev ON r.reviewer_id = rev.user_id
        WHERE r.reviewee_id = $1
        ORDER BY r.created_at DESC
      `,
      values: [userId]
    };

    const { rows } = await pool.query(query);
    res.json(rows);

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Reviews Error:`, error);
    res.status(500).json({
      error: 'Failed to fetch reviews',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
});

// Create review
router.post('/', auth, async (req, res) => {
  try {
    const { revieweeId, listingId, rating, comment } = req.body;
    
    // Validate input
    if (!revieweeId || !listingId || !rating) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (req.user.userId === revieweeId) {
      return res.status(403).json({ error: 'Cannot review yourself' });
    }

    // Check transaction validity
    const transactionCheck = await pool.query({
      text: `
        SELECT 1 FROM listings 
        WHERE listing_id = $1 
          AND user_id = $2 
          AND status IN ('sold', 'traded')
      `,
      values: [listingId, revieweeId]
    });

    if (!transactionCheck.rowCount) {
      return res.status(400).json({ error: 'Invalid transaction for review' });
    }

    // Create review
    const createQuery = {
      text: `
        INSERT INTO reviews 
        (reviewer_id, reviewee_id, listing_id, rating, comment)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `,
      values: [
        req.user.userId, 
        revieweeId, 
        listingId, 
        Math.min(5, Math.max(1, rating)), 
        comment?.trim()
      ]
    };

    const { rows } = await pool.query(createQuery);
    res.status(201).json(rows[0]);

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Create Review Error:`, error);
    res.status(500).json({
      error: 'Failed to create review',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
});

export default router;