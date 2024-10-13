const chatModel = require("../models/chat");
const messageModel = require('../models/message')


const activeRooms = {}
const handleChatSockets = (socket, io) => {

  socket.on("setup",(data)=>{
  socket.join(data._id);
  })
  socket.on('join-room', ({ roomId, userId }) => {
    socket.join(roomId);
    console.log(`${userId} joined room: ${roomId}`);

  })
  socket.on("active-room", ({ roomId, userId }) => {
    activeRooms[userId] = roomId; // Set the active room for the user
  });


  socket.on('sendMessage', async ({ roomId, message, selectedImage, currentUserId,selectedChatId}) => {
    console.log(roomId, message, selectedImage, currentUserId, selectedChatId);

    io.to(roomId).emit('receiveMessage', { roomId, message, selectedImage, currentUserId, selectedChatId})

    if (activeRooms[currentUserId] === roomId) {
      io.to(roomId).emit("notify", { message, selectedChatId });
    }


    let chat = await chatModel.findOne({
      participent: { $all: [currentUserId,selectedChatId] }
    }).populate('messages');


    if (!chat) {
      chat = await chatModel.create({
        participent: [currentUserId,selectedChatId]
      })
    }

    const newMessage = await messageModel.create({
      sender: currentUserId,
      recipient:selectedChatId,
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