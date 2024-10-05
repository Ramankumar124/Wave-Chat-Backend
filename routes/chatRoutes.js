const express=require('express')
const router=express.Router();
const { isLogin } = require("../middlewares/isLogin");
const chatModel = require("../models/chat");



router.get('/:contactUserId', isLogin, async (req, res) => {
  try {
    const userId = req.user._id;
    const contactUserId = req.params.contactUserId;

    const page = parseInt(req.query.page) || 1;
    const limit = 5;  // Limit the number of messages per page
    
    // Step 1: Count messages specific to the chat between two users
    const chat = await chatModel.findOne({
      participent: { $all: [userId, contactUserId] }
    });

    if (!chat) {
      console.log("No chat found");
      return res.status(404).json({ 
        message: 'No chat found.' 
      });
    }

    const totalMessages = chat.messages.length;  // Count the total number of messages in the chat
    const totalPages = Math.ceil(totalMessages / limit);
    const nextPage = page < totalPages ? page + 1 : null;

    let skip = (page - 1) * limit;

    // Step 2: Fetch the messages with pagination
    let paginatedChat = await chatModel.findOne({
      participent: { $all: [userId, contactUserId] }
    }).populate({
      path: 'messages',
      options: {
        skip: skip,
        limit: limit,
        sort: { createdAt: -1 }, 
      }
    });

    res.status(200).json({
      success: true,
      msg: "User Messages",
      data: paginatedChat.messages,
      page,
      nextPage,
      totalPages,
      totalMessages
    });

  } catch (error) {
    console.log("Server Error: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

  module.exports=router;