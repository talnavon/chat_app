import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";


const chatRoomSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4().replace(/\-/g, ""),
    },
    conversationId: String,
  },
  {
    timestamps: true,
    collection: "chatrooms",
  }
);

/**
 * @param {String} conversationId - id of conversation
 * @return {Object} chatroom
 */
chatRoomSchema.statics.getChatRoomByConversationId = async function (conversationId) {
  try {
    const room = await this.findOne({ conversationId: conversationId });
    return room;
  } catch (error) {
    throw error;
  }
}

/**
 * @param {String} roomId - id of chatroom
 * @return {Object} chatroom
 */
chatRoomSchema.statics.getChatRoomByRoomId = async function (roomId) {
  try {
    const room = await this.findOne({ _id: roomId });
    return room;
  } catch (error) {
    throw error;
  }
}


/**
 * @param {String} roomId - id of chatroom
 * @return {Array} chatconversation
 */
chatRoomSchema.statics.getConversationsByRoomId = async function (roomId) {
  try {
    const conversations = await this.find({ conversationId: { $all: [roomId] } });
    return conversations;
  } catch (error) {
    throw error;
  }
}




export default mongoose.model("ChatRoom", chatRoomSchema);
