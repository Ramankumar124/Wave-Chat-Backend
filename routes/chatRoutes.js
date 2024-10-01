const express=require('express')
const router=express.Router();
const { isLogin } = require("../middlewares/isLogin");
const chatModel = require("../models/chat");



router.get('/:contactUserId',isLogin ,async(req, res) => {
    try {
      const userId = req.user._id;
      const contactUserId = req.params.contactUserId;
      
      console.log(`Server user id: ${userId}, contact id: ${contactUserId}`);
  
      let chat = await chatModel.findOne({
        participent: { $all: [userId, contactUserId] }
      }).populate('messages');
  
      console.log("Chats are: ", chat);
  
      if (!chat) {
        console.log("No chat found");
        return res.status(404).json({ message: 'No chat found.' });
      }
  
      res.status(200).json(chat.messages);
    } catch (error) {
      console.log("Server Error: ", error.message);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  module.exports=router;