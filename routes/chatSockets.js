const chatModel = require("../models/chat");
const messageModel =require('../models/message')

const handleChatSockets=(socket,io)=>{
    socket.on('join-room',({roomId,userId})=>{
        socket.join(roomId);
        console.log(`${userId} joined room: ${roomId}`);
           
       })
       
       socket.on('sendMessage',async ({roomId,message,selectedImage,currentUserId,contactUserId })=>{
         io.to(roomId).emit('receiveMessage',{roomId,message,selectedImage,currentUserId,contactUserId})
  
    
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
           image:selectedImage,
           chatId:chat._id
         })
   
         chat.messages.push(newMessage._id);
         await chat.save();
        //  console.log(" msg sended",newMessage);
         
       }
      
      )
      
       socket.on('Typing-indicator',async (roomId,currentUserId)=>{
        io.to(roomId).emit('Typing',currentUserId)
        
       });
       socket.on('Stop-typing',async (roomId)=>{
        io.to(roomId).emit('typing-stop');
        
       })
      
}

module.exports={handleChatSockets};