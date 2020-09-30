import express from 'express';
// controllers
import chatRoom from '../controllers/chatRoom.js';

const router = express.Router();

router
  .get('/:roomId', chatRoom.getConversationsByRoomId)
  .post('/initiate', chatRoom.initiate)

export default router;
