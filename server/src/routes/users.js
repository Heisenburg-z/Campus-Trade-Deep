// server/src/routes/users.js
import express from 'express';
import pool from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, university } = req.body;
    
    // Check existing user
    const existsQuery = {
      text: 'SELECT 1 FROM users WHERE email = $1 OR username = $2',
      values: [email, username]
    };
    const exists = await pool.query(existsQuery);
    if (exists.rowCount > 0) {
      return res.status(409).json({ error: 'Email or username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const createQuery = {
      text: `
        INSERT INTO users 
        (username, email, password_hash, university)
        VALUES ($1, $2, $3, $4)
        RETURNING user_id, username, email, university, created_at
      `,
      values: [username, email, hashedPassword, university]
    };

    const { rows } = await pool.query(createQuery);
    const user = rows[0];
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user.user_id, email: user.email }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.status(201).json({ user, token });

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Registration Error:`, error);
    res.status(500).json({
      error: 'Registration failed',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
});

// User login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const userQuery = {
      text: 'SELECT * FROM users WHERE email = $1',
      values: [email]
    };
    const { rows } = await pool.query(userQuery);
    
    if (!rows[0] || !await bcrypt.compare(password, rows[0].password_hash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];
    const token = jwt.sign(
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
      token 
    });

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Login Error:`, error);
    res.status(500).json({
      error: 'Login failed',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
});

// Get user profile
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = {
      text: `
        SELECT 
          user_id, username, email, university, 
          avatar_url, phone, created_at, last_login
        FROM users 
        WHERE user_id = $1
      `,
      values: [id]
    };

    const { rows } = await pool.query(query);
    
    if (!rows[0]) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(rows[0]);

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Profile Error:`, error);
    res.status(500).json({
      error: 'Failed to fetch profile',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
});

export default router;