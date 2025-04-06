// server/src/routes/users.js
import express from 'express';
import pool from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { auth } from '../middleware/auth.js';
import { OAuth2Client } from 'google-auth-library';

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, university } = req.body;
    
    // Validate university email domain
    const universityDomains = {
      'uct.ac.za': 'University of Cape Town (UCT)',
      'sun.ac.za': 'Stellenbosch University (SU)',
      'up.ac.za': 'University of Pretoria (UP)',
      'wits.ac.za': 'University of the Witwatersrand (Wits)',
      'ru.ac.za': 'Rhodes University (RU)',
      'ufs.ac.za': 'University of the Free State (UFS)',
      'ukzn.ac.za': 'University of KwaZulu-Natal (UKZN)',
      'uwc.ac.za': 'University of the Western Cape (UWC)',
      'uj.ac.za': 'University of Johannesburg (UJ)',
      'nwu.ac.za': 'North-West University (NWU)',
      'mandela.ac.za': 'Nelson Mandela University (NMU)',
      'ul.ac.za': 'University of Limpopo (UL)',
      'univen.ac.za': 'University of Venda (UNIVEN)',
      'unizulu.ac.za': 'University of Zululand (UNIZULU)',
      'wsu.ac.za': 'Walter Sisulu University (WSU)',
      'ufh.ac.za': 'University of Fort Hare (UFH)',
      'smu.ac.za': 'Sefako Makgatho Health Sciences University (SMU)',
      'spu.ac.za': 'Sol Plaatje University (SPU)',
      'ump.ac.za': 'University of Mpumalanga (UMP)',
      'unisa.ac.za': 'University of South Africa (UNISA)',
      'cput.ac.za': 'Cape Peninsula University of Technology (CPUT)',
      'tut.ac.za': 'Tshwane University of Technology (TUT)',
      'dut.ac.za': 'Durban University of Technology (DUT)',
      'cut.ac.za': 'Central University of Technology (CUT)',
      'mut.ac.za': 'Mangosuthu University of Technology (MUT)',
      'vut.ac.za': 'Vaal University of Technology (VUT)'
    };

    const domain = email.split('@')[1];
    if (!Object.keys(universityDomains).some(d => domain.includes(d))) {
      return res.status(400).json({ error: 'Invalid university email' });
    }

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

// Google authentication
router.post('/auth/google', async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name } = payload;

    // Check for existing user
    const userQuery = {
      text: 'SELECT * FROM users WHERE email = $1',
      values: [email]
    };
    const { rows } = await pool.query(userQuery);

    let user = rows[0];

    // Create new user if doesn't exist
    if (!user) {
      // Extract university from email domain
      const domain = email.split('@')[1];
      const university = Object.entries({
        'uct.ac.za': 'University of Cape Town (UCT)',
        'sun.ac.za': 'Stellenbosch University (SU)',
        'up.ac.za': 'University of Pretoria (UP)',
        'wits.ac.za': 'University of the Witwatersrand (Wits)',
        'ru.ac.za': 'Rhodes University (RU)',
        'ufs.ac.za': 'University of the Free State (UFS)',
        'ukzn.ac.za': 'University of KwaZulu-Natal (UKZN)',
        'uwc.ac.za': 'University of the Western Cape (UWC)',
        'uj.ac.za': 'University of Johannesburg (UJ)',
        'nwu.ac.za': 'North-West University (NWU)',
        'mandela.ac.za': 'Nelson Mandela University (NMU)',
        'ul.ac.za': 'University of Limpopo (UL)',
        'univen.ac.za': 'University of Venda (UNIVEN)',
        'unizulu.ac.za': 'University of Zululand (UNIZULU)',
        'wsu.ac.za': 'Walter Sisulu University (WSU)',
        'ufh.ac.za': 'University of Fort Hare (UFH)',
        'smu.ac.za': 'Sefako Makgatho Health Sciences University (SMU)',
        'spu.ac.za': 'Sol Plaatje University (SPU)',
        'ump.ac.za': 'University of Mpumalanga (UMP)',
        'unisa.ac.za': 'University of South Africa (UNISA)',
        'cput.ac.za': 'Cape Peninsula University of Technology (CPUT)',
        'tut.ac.za': 'Tshwane University of Technology (TUT)',
        'dut.ac.za': 'Durban University of Technology (DUT)',
        'cut.ac.za': 'Central University of Technology (CUT)',
        'mut.ac.za': 'Mangosuthu University of Technology (MUT)',
        'vut.ac.za': 'Vaal University of Technology (VUT)'
      }).find(([d]) => domain.includes(d))?.[1] || 'Unknown University';

      const createQuery = {
        text: `
          INSERT INTO users 
          (username, email, university, verified)
          VALUES ($1, $2, $3, true)
          RETURNING user_id, username, email, university
        `,
        values: [name, email, university]
      };

      const { rows } = await pool.query(createQuery);
      user = rows[0];
    }

    // Generate JWT
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
      token: jwtToken 
    });

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Google Auth Error:`, error);
    res.status(500).json({
      error: 'Google authentication failed',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
});

// Get current user profile
router.get('/me', auth, async (req, res) => {
  try {
    const query = {
      text: `
        SELECT 
          user_id, username, email, university, 
          avatar_url, phone, created_at, last_login
        FROM users 
        WHERE user_id = $1
      `,
      values: [req.user.userId]
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

// Get user by ID
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