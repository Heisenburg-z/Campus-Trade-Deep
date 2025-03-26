// server/src/routes/auth.js
import express from 'express';
import jwt from 'jsonwebtoken';
import pool from '../db.js';
import { OAuth2Client } from 'google-auth-library';

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google authentication
router.post('/google', async (req, res) => {
  try {
    const { token: googleToken, email, name } = req.body; // Renamed here
    
    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: googleToken, // Updated reference
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();

    // Check if user exists
    const userQuery = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    let user = userQuery.rows[0];
    
    // Create user if doesn't exist
    if (!user) {
      const newUser = await pool.query(
        `INSERT INTO users 
        (username, email, password_hash, university, verified)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING user_id, username, email, university, created_at`,
        [name, email, 'google-auth', 'Unknown University', true]
      );
      user = newUser.rows[0];
    }

    // Generate JWT - renamed variable
    const jwtToken = jwt.sign(
      { userId: user.user_id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ 
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        university: user.university
      },
      token: jwtToken // Updated property name
    });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Google authentication failed' });
  }
});

export default router;