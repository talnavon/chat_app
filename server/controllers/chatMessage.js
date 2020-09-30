// utils
import makeValidation from '@withvoid/make-validation';
// models
import ChatConversationModel, { CHAT_CONVERSATION_TYPES } from '../models/ChatConversation.js';
import ChatMessageModel from '../models/ChatMessage.js';
import UserModel, {USER_TYPES} from '../models/User.js';

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
      // const currentLoggedUser = req.userId;
      const userId = req.body.User_id
      const role = req.body.Role
      const roomId  = req.body.Room_id
      // TO_DO: Check if this userid can post message 
      // in this conversation by conversation type and user role
      const conversationId = req.body.Conversation_id
      const post = await ChatMessageModel.createPostInChatConversation(conversationId, messagePayload, userId);
      return res.status(200).json({ success: true, post });
    } catch (error) {
      return res.status(500).json({ success: false, error: error })
    }
  },
  getConversationByConversationId: async (req, res) => {
    try {
      const { roomId } = req.params;
      const conversation = await ChatConversationModel.getChatConversationByConversationId(roomId)
      if (!conversation) {
        return res.status(400).json({
          success: false,
          message: 'No conversation exists for this id',
        })
      }
      const users = await UserModel.getUserByIds(conversation.userIds);
      const options = {
        page: parseInt(req.query.page) || 0,
        limit: parseInt(req.query.limit) || 10,
      };
      return res.status(200).json({
        success: true,
        conversation,
        users,
      });
    } catch (error) {
      return res.status(500).json({ success: false, error });
    }
  },

  getConversations: async (req, res) => {
    try {
      const { roomId } = req.params.roomId;
      const conversations = await ChatConversationModel.getChatConversationsByRoomId(roomId)
      if (!conversations) {
        return res.status(400).json({
          success: false,
          message: 'No conversation exists for this id',
        })
      }
      const users = await UserModel.getUserByIds(conversations.userIds);
      const options = {
        page: parseInt(req.query.page) || 0,
        limit: parseInt(req.query.limit) || 10,
      };
      const conversation = await ChatMessageModel.getConversationByConversationId(conversationId, options);
      return res.status(200).json({
        success: true,
        conversation,
        users,
      });
    } catch (error) {
      return res.status(500).json({ success: false, error });
    }
  },

  getConversationMessages: async (req, res) => {
    try {

      const params = req.params
      const roomId = params.roomId;
      const userId = params.userId;
      const role = params.role;
      const conversationId = params.conversationId;
     
      const user = await UserModel.getUserById(userId)
      const conversation = await ChatConversationModel.getChatConversationByConversationId(conversationId)
      
      if (!conversation || !user || conversation.roomId != roomId ) {
        return res.status(400).json({
          success: false,
          message: 'No conversation, user or room exists for this id',
        })
      }

      if (role != USER_TYPES.INSTRUCTOR && conversation.type == CHAT_CONVERSATION_TYPES.INSTRUCTORS){
        return res.status(403).json({
          success: false,
          message: 'Not authraized to get messages of this conversationId',
        })
      }

      const messages = await ChatMessageModel.getConversationMessages(conversationId)

      return res.status(200).json({
        success: true,
        messages,
      });
    } catch (error) {
      return res.status(500).json({ success: false, error });
    }
  },


}