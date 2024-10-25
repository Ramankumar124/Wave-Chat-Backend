const chatModel = require("../models/chat");
const messageModel = require('../models/message');
const user = require("../models/user");

let connection = [];
const handleChatSockets = (socket, io) => {

  socket.on("setup", (data) => {
    socket.join(data._id);
    connection.push(

      {  socketId: data._id,
         username:data.name
       }
    )

    console.log(`${data.name} joined server socket`);
  })

  socket.on('join-room', ({ roomId, userId }) => {
    socket.join(roomId);
    console.log(`${userId} joined room: ${roomId}`);

  })

  socket.on('sendMessage', async ({ roomId, message, selectedImage, currentUserId, contactUserId }) => {
    console.log(roomId, message, selectedImage, currentUserId, contactUserId);

    io.to(roomId).emit('receiveMessage', { roomId, message, selectedImage, currentUserId, contactUserId })

    let user = connection.find((user)=>user.socketId==contactUserId)
  console.log("user socket id",user.socketId);
  console.log(connection);
  console.log("socketid  "+user.socketId + " contactuserid  "+contactUserId);
  
  console.log(currentUserId);
    let socketUserName=user.username;
    io.to(user.socketId).emit("notify",{ message,currentUserId,socketUserName});


    let chat = await chatModel.findOne({
      participent: { $all: [currentUserId, contactUserId] }
    }).populate('messages');


    if (!chat) {
      chat = await chatModel.create({
        participent: [currentUserId, contactUserId]
      })
    }

    const newMessage = await messageModel.create({
      sender: currentUserId,
      recipient: contactUserId,
      content: message,
      image: selectedImage,
      chatId: chat._id
    })

    chat.messages.push(newMessage._id);
    await chat.save();
    //  console.log(" msg sended",newMessage);

  }

  )

  socket.on('Typing-indicator', async (roomId, currentUserId) => {
    io.to(roomId).emit('Typing', roomId, currentUserId)

  });
  socket.on('Stop-typing', async (roomId) => {
    io.to(roomId).emit('typing-stop');

  })

}

module.exports = { handleChatSockets };