// server/src/routes/messages.js
import express from 'express';
import pool from '../db.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get user's conversations
router.get('/conversations', auth, async (req, res) => {
  try {
    const query = {
      text: `
        SELECT 
          c.conversation_id,
          c.listing_id,
          c.created_at,
          u1.username AS participant1,
          u2.username AS participant2,
          m.content AS last_message,
          m.sent_at AS last_message_at
        FROM conversations c
        JOIN users u1 ON c.user1_id = u1.user_id
        JOIN users u2 ON c.user2_id = u2.user_id
        LEFT JOIN LATERAL (
          SELECT * FROM messages 
          WHERE conversation_id = c.conversation_id 
          ORDER BY sent_at DESC 
          LIMIT 1
        ) m ON true
        WHERE c.user1_id = $1 OR c.user2_id = $1
        ORDER BY m.sent_at DESC
      `,
      values: [req.user.userId]
    };

    const { rows } = await pool.query(query);
    res.json(rows);

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Conversations Error:`, error);
    res.status(500).json({
      error: 'Failed to fetch conversations',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
});

// Get conversation messages
router.get('/:conversationId', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    // Verify conversation access
    const convQuery = {
      text: 'SELECT 1 FROM conversations WHERE conversation_id = $1 AND (user1_id = $2 OR user2_id = $2)',
      values: [conversationId, req.user.userId]
    };
    const convCheck = await pool.query(convQuery);
    
    if (!convCheck.rowCount) {
      return res.status(403).json({ error: 'Not authorized for this conversation' });
    }

    // Get messages
    const messagesQuery = {
      text: `
        SELECT 
          m.message_id, m.content, m.sent_at, m.read_at,
          u.username AS sender_name, u.user_id AS sender_id
        FROM messages m
        JOIN users u ON m.sender_id = u.user_id
        WHERE conversation_id = $1
        ORDER BY m.sent_at ASC
      `,
      values: [conversationId]
    };

    const { rows } = await pool.query(messagesQuery);
    res.json(rows);

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Messages Error:`, error);
    res.status(500).json({
      error: 'Failed to fetch messages',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
});

// Send message
router.post('/', auth, async (req, res) => {
  try {
    const { conversationId, content, listingId, recipientId } = req.body;
    
    // Validate required fields
    if (!content?.trim()) {
      return res.status(400).json({ error: 'Message content required' });
    }

    // Handle new conversation
    let convId = conversationId;
    if (!convId) {
      if (!listingId || !recipientId) {
        return res.status(400).json({ error: 'Missing conversation parameters' });
      }

      // Create new conversation
      const users = [req.user.userId, recipientId].sort();
      const newConvQuery = {
        text: `
          INSERT INTO conversations 
          (listing_id, user1_id, user2_id)
          VALUES ($1, $2, $3)
          RETURNING conversation_id
        `,
        values: [listingId, users[0], users[1]]
      };
      
      const convResult = await pool.query(newConvQuery);
      convId = convResult.rows[0].conversation_id;
    }

    // Insert message
    const messageQuery = {
      text: `
        INSERT INTO messages 
        (conversation_id, sender_id, content)
        VALUES ($1, $2, $3)
        RETURNING *
      `,
      values: [convId, req.user.userId, content.trim()]
    };

    const { rows } = await pool.query(messageQuery);
    res.status(201).json(rows[0]);

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Send Message Error:`, error);
    res.status(500).json({
      error: 'Failed to send message',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
});

export default router;