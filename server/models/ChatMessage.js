import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const MESSAGE_TYPES = {
  TYPE_TEXT: "text",
};



const chatMessageSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4().replace(/\-/g, ""),
    },
    conversationId: String,
    message: mongoose.Schema.Types.Mixed,
    type: {
      type: String,
      default: () => MESSAGE_TYPES.TYPE_TEXT,
    },
    postedByUser: String,
  },
  {
    timestamps: true,
    collection: "chatmessages",
  }
);

/**
 * This method will create a post in chat
 * 
 * @param {String} conversationId - id of chat conversation
 * @param {Object} message - message you want to post in the chat conversation
 * @param {String} postedByUser - user who is posting the message
 */
chatMessageSchema.statics.createPostInChatConversation = async function (conversationId, message, postedByUser) {
  try {
    const post = await this.create({
      conversationId,
      message,
      postedByUser
      
    });
    const aggregate = await this.aggregate([
      // get post where _id = post._id
      { $match: { _id: post._id } },
      // do a join on another table called users, and 
      // get me a user whose _id = postedByUser
      {
        $lookup: {
          from: 'users',
          localField: 'postedByUser',
          foreignField: '_id',
          as: 'postedByUser',
        }
      },
      { $unwind: '$postedByUser' },
      // do a join on another table called chatconversations, and 
      // get me a chatconversation whose _id = conversationId
      {
        $lookup: {
          from: 'chatconversations',
          localField: 'conversationId',
          foreignField: '_id',
          as: 'chatConversationInfo',
        }
      },
      { $unwind: '$chatConversationInfo' },
      { $unwind: '$chatConversationInfo.userIds' },
      // do a join on another table called users, and 
      // get me a user whose _id = userIds
      {
        $lookup: {
          from: 'users',
          localField: 'chatConversationInfo.userIds',
          foreignField: '_id',
          as: 'chatConversationInfo.userProfile',
        }
      },
      { $unwind: '$chatConversationInfo.userProfile' },
      // group data
      {
        $group: {
          _id: '$chatConversationInfo._id',
          postId: { $last: '$_id' },
          conversationId: { $last: '$chatConversationInfo._id' },
          message: { $last: '$message' },
          type: { $last: '$type' },
          postedByUser: { $last: '$postedByUser' },
          chatConversationInfo: { $addToSet: '$chatConversationInfo.userProfile' },
          createdAt: { $last: '$createdAt' },
          updatedAt: { $last: '$updatedAt' },
        }
      }
    ]);
    return aggregate[0];
  } catch (error) {
    throw error;
  }
}


/**
 * @param {String} conversationId - chat conversation id
 */
chatMessageSchema.statics.getConversationMessages = async function (conversationId) {
  try {
    return this.aggregate([
      { $match: { conversationId } },
      { $sort: { createdAt: -1 } },
      // do a join on another table called users, and 
      // get me a user whose _id = postedByUser
      {
        $lookup: {
          from: 'users',
          localField: 'postedByUser',
          foreignField: '_id',
          as: 'postedByUser',
        }
      },
      { $unwind: "$postedByUser" },
      { $sort: { createdAt: 1 } },
    ]);
  } catch (error) {
    throw error;
  }
}


export default mongoose.model("ChatMessage", chatMessageSchema);
