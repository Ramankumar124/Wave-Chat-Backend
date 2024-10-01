const chatModel = require("../models/chat");
const messageModel =require('../models/message')

const handleChatSockets=(socket,io)=>{
    socket.on('join-room',({roomId,userId})=>{
        socket.join(roomId);
        console.log(`${userId} joined room: ${roomId}`);
           
       })
       
       socket.on('sendMessage',async ({roomId,message,currentUserId,contactUserId })=>{
         io.to(roomId).emit('receiveMessage',{roomId,message,currentUserId,contactUserId})
   
        let  chat = await chatModel.findOne({
           participent: { $all: [currentUserId, contactUserId] }
         }).populate('messages');
     
   
         if(!chat){
           chat=await chatModel.create({
             participent:[currentUserId,contactUserId]
           })
         }
   
         const newMessage=await messageModel.create({
           sender:currentUserId,
           recipient:contactUserId,
           content:message,
           chatId:chat._id
         })
   
         chat.messages.push(newMessage._id);
         await chat.save();
         console.log(" msg sended",newMessage);
         
       })
}

module.exports={handleChatSockets};