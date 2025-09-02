import express from 'express';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// POST /api/chat/ask
// Protected route - requires Authorization: Bearer <token>
router.post('/ask', auth, async (req, res) => {
  try {
    const { message } = req.body || {};
    if (!message) return res.status(400).json({ message: 'message is required' });

    // Mock chatbot reply — replace with real LLM/service later
    const reply = `🤖 Echo: ${String(message).trim()}`;

    res.json({ reply });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
