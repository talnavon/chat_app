// utils
import makeValidation from '@withvoid/make-validation';
// models
import ChatConversationModel, { CHAT_CONVERSATION_TYPES } from '../models/ChatConversation.js';
import ChatMessageModel from '../models/ChatMessage.js';
import UserModel, { USER_TYPES } from '../models/User.js';

export default {
  initiate: async (req, res) => {
    try {
      const validation = makeValidation(types => ({
        payload: req.body,
        checks: {
          userIds: { 
            type: types.array, 
            options: { unique: true, empty: false, stringOnly: true } 
          },
          type: { type: types.enum, options: { enum: CHAT_CONVERSATION_TYPES } },
        }
      }));
      if (!validation.success) return res.status(400).json({ ...validation });

      const { userIds, type } = req.body;
      const { userId: chatInitiator } = req;
      const allUserIds = [...userIds, chatInitiator];
      const chatConversation = await ChatConversationModel.initiateChat(allUserIds, type, chatInitiator);
      return res.status(200).json({ success: true, chatConversation });
    } catch (error) {
      return res.status(500).json({ success: false, error: error })
    }
  },
  postMessage: async (req, res) => {
    try {
      const validation = makeValidation(types => ({
        payload: req.body,
        checks: {
          messageText: { type: types.string },
        }
      }));
      if (!validation.success) return res.status(400).json({ ...validation });

      const messagePayload = {
        messageText: req.body.messageText,
      };
      const userId = req.body.User_id
      const role = req.body.Role
      const roomId  = req.body.Room_id
      const conversationId = req.body.Conversation_id
      // Check if this userid can post message 
      // in this conversation by conversation type and user role
      const user = await UserModel.getUserById(userId);
      const conversation = await ChatConversationModel.getChatConversationByConversationId(conversationId)
      if (!conversation || !user) {
        return res.status(400).json({
          success: false,
          message: 'No conversation or user exists for this id',
        })
      }
      if (role == user.role && role == USER_TYPES.GUEST && conversation.type == CHAT_CONVERSATION_TYPES.INSTRUCTORS){
        return res.status(403).json({
          success: false,
          message: 'No authrized to send messages in this conversationId',
        })
      }
     
      const post = await ChatMessageModel.createPostInChatConversation(conversationId, messagePayload, userId);
      return res.status(200).json({ success: true, post });
    } catch (error) {
      return res.status(500).json({ success: false, error: error })
    }
  },
  getConversationByConversationId: async (req, res) => {
    try {
      const params = req.params;
      const conversationId = params.conversationId;
      const conversation = await ChatConversationModel.getChatConversationByConversationId(conversationId)
      if (!conversation) {
        return res.status(400).json({
          success: false,
          message: 'No conversation exists for this id',
        })
      }
      return res.status(200).json({
        success: true,
        conversation,
      });
    } catch (error) {
      return res.status(500).json({ success: false, error });
    }
  },

  getConversations: async (req, res) => {
    try {
      const params = req.params
      const roomId = params.roomId;
      const userId = params.userId;
      const role = params.role;
      const conversations = []

      const tempConversations = await ChatConversationModel.getChatConversationsByRoomId(roomId)
      if (!tempConversations) {
        // Create conversation with this role and userid

      }
      tempConversations.forEach(element => {
        if (element.userIds.includes(userId))
        conversations.push({"id": element._id,
          "name": element.type
        })
      });

      return res.status(200).json({
        success: true,
        conversations,
      });
    } catch (error) {
      return res.status(500).json({ success: false, error });
    }
  },

}