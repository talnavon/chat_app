import express from 'express';
// controllers
import chatConversation from '../controllers/chatConversation.js';
import chatMessage from '../controllers/chatMessage.js';

const router = express.Router();

router
  .get('/:roomId/:userId/:role/:conversationId', chatMessage.getConversationMessages)

export default router;