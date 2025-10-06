import express from 'express';
import { generateChatResponse, getDailyMessage } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/chat', protect, generateChatResponse);
router.get('/daily-message', protect, getDailyMessage);

export default router;