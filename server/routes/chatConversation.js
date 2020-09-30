import express from 'express';
// controllers
import chatConversation from '../controllers/chatConversation.js';

const router = express.Router();

router
  .get('/:roomId/:userId/:role', chatConversation.getConversations)
  // .get('/:roomId(/:userId)(/:role)', chatConversation.getConversations)
  .post('/initiate', chatConversation.initiate)
  .post('/message', chatConversation.postMessage)


export default router;
