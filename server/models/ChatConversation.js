import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

export const CHAT_CONVERSATION_TYPES = {
  PUBLIC: "public-chat",
  INSTRUCTORS: "instructors-chat",
  QA: "qa-chat",
  PRIVATE: "private-chat",
};

const chatConversationSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4().replace(/\-/g, ""),
    },
    userIds: Array,
    type: String,
    chatInitiator: String,
    roomId: String
  },
  {
    timestamps: true,
    collection: "chatconversations",
  }
);

/**
 * @param {String} roomId - id of room
 * @param {String} userId - id of user
 * @param {String} role - role of user
 * @return {Array} array of all chatconversation that the user belongs to
 */
chatConversationSchema.statics.getConversations = async function (roomId, userId, role) {
  try {
    const conversation_ids = await this.find({ conversationId: { $all: [userId] } });
    const conversations = await this.find({ _id: { $all: [conversation_ids] } });
    return conversations;
  } catch (error) {
    throw error;
  }
}

/**
 * @param {String} roomId - id of chatroom
 * @return {Array} array of all chatconversation that the conversation belongs to
 */
chatConversationSchema.statics.getChatConversationsByRoomId = async function (roomId) {
  try {
    const conversations = await this.find({ roomId: { $all: [roomId] } });
    return conversations;
  } catch (error) {
    throw error;
  }
}

/**
 * @param {String} conversationId - id of chatconversation
 * @return {Object} chatconversation
 */
chatConversationSchema.statics.getChatConversationByConversationId = async function (conversationId) {
  try {
    const conversation = await this.findOne({ _id: conversationId });
    return conversation;
  } catch (error) {
    throw error;
  }
}

/**
 * @param {Array} userIds - array of strings of userIds
 * @param {String} chatInitiator - user who initiated the chat
 * @param {CHAT_CONVERSATION_TYPES} type
 */
chatConversationSchema.statics.initiateChat = async function (userIds, type, chatInitiator) {
  try {
    const availableConversation = await this.findOne({
      userIds: {
        $size: userIds.length,
        $all: [...userIds],
      },
      type,
    });
    if (availableConversation) {
      return {
        isNew: false,
        message: 'retrieving an old chat conversation',
        chatConversationId: availableConversation._doc._id,
        type: availableConversation._doc.type,
      };
    }

    const newConversation = await this.create({ userIds, type, chatInitiator });
    return {
      isNew: true,
      message: 'creating a new chatconversation',
      chatConversationId: newConversation._doc._id,
      type: newConversation._doc.type,
    };
  } catch (error) {
    console.log('error on start chat method', error);
    throw error;
  }
}

export default mongoose.model("ChatConversation", chatConversationSchema);
