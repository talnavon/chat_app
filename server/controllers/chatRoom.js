// utils
import makeValidation from '@withvoid/make-validation';
// models
import ChatRoomModel from '../models/ChatRoom.js';
import ChatMessageModel from '../models/ChatMessage.js';
import UserModel from '../models/User.js';

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
         
        }
      }));
      if (!validation.success) return res.status(400).json({ ...validation });
      const { userIds, type } = req.body;
      const { userId: chatInitiator } = req;
      const allUserIds = [...userIds, chatInitiator];
      const chatRoom = await ChatRoomModel.initiateChat(allUserIds, type, chatInitiator);
      return res.status(200).json({ success: true, chatRoom });
    } catch (error) {
      return res.status(500).json({ success: false, error: error })
    }
  },

  getChatRoomByRoomId: async (req, res) => {
    try {
      const { roomId } = req.params;
      const room = await ChatRoomModel.getChatRoomByRoomId(roomId)
      return res.status(200).json({ success: true, room });
    } catch (error) {
      return res.status(500).json({ success: false, error });
    }
  },

  getChatRoomByConversationId: async (req, res) => {
    try {
      const { conversationId } = req.params;
      const room = await ChatRoomModel.getChatRoomByConversationId(conversationId)
      return res.status(200).json({ success: true, room });
    } catch (error) {
      return res.status(500).json({ success: false, error });
    }
  },

  getConversationsByRoomId: async (req, res) => {
    try {
      const { roomId } = req.params;
      const conversations = await ChatRoomModel.getConversationsByRoomId(roomId)
      return res.status(200).json({ success: true, roconversationsom });
    } catch (error) {
      return res.status(500).json({ success: false, error });
    }
  },

  getConversationsByRoomIdAndUserID: async (req, res) => {
    try {
      const { roomId } = req.params.roomId;
      const room = await ChatRoomModel.getChatRoomByRoomId(roomId)
      if (!room) {
        return res.status(400).json({
          success: false,
          message: 'No room exists for this id',
        })
      }
      const user = await UserModel.getUserById(req.params.userId);
      const options = {
        page: parseInt(req.query.page) || 0,
        limit: parseInt(req.query.limit) || 10,
      };
      const conversation = await ChatMessageModel.getConversationByConversationId(roomId, options);
      return res.status(200).json({
        success: true,
        conversation,
        user,
      });
    } catch (error) {
      return res.status(500).json({ success: false, error });
    }
  },

}