const chatModel = require("../models/chat");
const messageModel = require('../models/message');
const user = require("../models/user");
const messaging = require("../config/firabase/firebaseAdmin");
const { sendFirebaseMessage } = require("../Services/firebaseServie")
let connection = [];

let onlineUser = [];




const handleChatSockets = (socket, io) => {

  socket.on("setup", ({ data, OrignalSocketId }) => {
    socket.join(data._id);
    console.log(OrignalSocketId);

    connection.push(

      {
        socketId: data._id,
        username: data.name
      }

    )
   const  user= onlineUser.findIndex((user)=> user.OrignalSocketId==OrignalSocketId)
   console.log(user);
   
   if(user==-1){
    onlineUser.push({
      OrignalSocketId,
      username: data.name,
      email: data.email
    })}
    console.log(`${data.name}  with id ${data._id} joined server socket`);
    console.log("online users ", onlineUser);

    io.emit("Online-Users", onlineUser);
  })


  socket.on("disconnect", () => {
    console.log("user disconncted:", socket.id);
    let newOnlineUser = onlineUser.filter((user) => user.OrignalSocketId !== socket.id);

    onlineUser = newOnlineUser;
    console.log("online users left after someone lefted",onlineUser);

    io.emit("Online-Users", onlineUser);

  })

  socket.on('join-room', ({ roomId, userId }) => {
    socket.join(roomId);
    console.log(`${userId} joined room: ${roomId}`);

  })

  socket.on('sendMessage', async ({ roomId, message, selectedImage, currentUserId, contactUserId, reciverFBToken, reciverName
  }) => {
    console.log(roomId, message, selectedImage, currentUserId, contactUserId);

    io.to(roomId).emit('receiveMessage', { roomId, message, selectedImage, currentUserId, contactUserId })
    io.to(contactUserId).emit("soundpopup");
    let user = connection.find((user) => user.socketId == contactUserId)
    if (user) {
      console.log("user socket id", user.socketId);
      console.log(connection);
      console.log("socketid  " + user.socketId + " contactuserid  " + contactUserId);

      console.log(currentUserId);
      let socketUserName = user.username;
      io.to(user.socketId).emit("notify", { message, currentUserId, socketUserName });
    }


    // send notification with  firebase 
    sendFirebaseMessage(message, reciverFBToken, reciverName);



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

  // call socket 

  socket.on('join-call-room', (contactUserId, roomId, userPeerId, data) => {
    socket.join(roomId);
    // Notify other users in the room of a new participant to start the call
    io.to(contactUserId).emit('incomming-call', data);
    socket.to(roomId).emit('start-call', userPeerId);


  });
  socket.on("call-declined", (id) => {
    io.to(id).emit("call-rejected");
  })
  socket.on("call-Ended", (room) => {
    io.to(room).emit("send-call-ended");
  })

  socket.on("join-voice-room", (contactUserId, roomId, peerId) => {
    socket.to(contactUserId).emit("start-voice-call", peerId);
  });
  
  socket.on("end-voice-call", () => {
    socket.broadcast.emit("voice-call-ended");
  });
  

  socket.on('SendFreindRequest', async (data) => {
    console.log(data);
    console.log(data.reciver._id);
  
    const sender = data?.sender;
    const reciver = data?.reciver;
  
    try {
      // Check if the receiver is already in the "sent" list
      const userDoc = await user.findOne({ email: sender.email })
      .populate('friendRequest.sent')
    .populate('friendRequest.received')
      if (!userDoc) {
        console.error(`User with email ${sender.email} not found`);
        return;
      }
  
      const alreadySent = userDoc.friendRequest.sent.some(
        (req) => req.email === reciver.email
      );
  
      if (alreadySent) {
        console.log(`${reciver.email} is already in the sent list.`);
      // io.to(data.sender._id).emit('FriendRequestAlreadySended', );

        return; // Stop here if already added
      }
       else{

    // Add the receiver to the "sent" list
    const updatedUser = await user.findOneAndUpdate(
      { email: sender.email },
      { $push: { 'friendRequest.sent': reciver } },
      { new: true, upsert: false }
    ).populate('friendRequest.sent')
    .populate('friendRequest.received')
    .populate('contacts')

    const updateRecevierUser = await user.findOneAndUpdate(
      { email: reciver.email },
      { $push: { 'friendRequest.received': sender } },
      { new: true, upsert: false }
    ).populate('friendRequest.sent')
    .populate('friendRequest.received')

    
    console.log(`${sender.email} added ${reciver.email} to the sent list.`);
    
    // Emit the friend request event
    io.to(data.sender._id).emit('FriendRequestSended', updatedUser);
    
    io.to(data.reciver._id).emit('IncomingfriendRequest', sender,updateRecevierUser);
  }
    } catch (error) {
      console.error('Error processing friend request:', error);
    }
  });

  socket.on('freindRequestAccepted',async (sender,reciver)=>{
    const updatedReciverUser = await user.findOneAndUpdate(
      { email: reciver.email },
      { $push: { 'contacts': sender } },
      { new: true, upsert: false }
    ).populate('contacts')

    const updatedSenderUser = await user.findOneAndUpdate(
      { email: sender.email },
      { $push: { 'contacts': reciver } },
      { new: true, upsert: false }
    ).populate('contacts')

  
    console.log("updated user with new contact which is ",updatedReciverUser);
    
  io.to(reciver._id).emit('AcceptedFriendRequest',updatedReciverUser);
  io.to(sender._id).emit('AcceptedFriendRequest',updatedSenderUser);

  })
  socket.on('friendRequestDeclined', async (sender, reciver) => {
    const removeFriendRequest = async (reciver, sender) => {
      try {
        // Fetch the receiver's user document
        const receiverUser = await user.findOne({ email: reciver.email })
    .populate('friendRequest.received')
    ;
        if (!receiverUser) throw new Error(`Receiver ${reciver} not found`);
  
        // Remove sender from receiver's received friend requests
        receiverUser.friendRequest.received = receiverUser.friendRequest.received.filter(
          (request) => request.email !== sender.email
        );
        await receiverUser.save();
  
        // Fetch the sender's user document
        const senderUser = await user.findOne({ email: sender.email })
    .populate('friendRequest.sent')
    ;
        if (!senderUser) throw new Error(`Sender ${sender.email} not found`);
  
        // Remove receiver from sender's sent friend requests
        senderUser.friendRequest.sent = senderUser.friendRequest.sent.filter(
          (request) => request.email !== reciver.email
        );
        await senderUser.save();
  
        console.log("Friend requests updated successfully");
      } catch (error) {
        console.error("Error removing friend requests:", error.message);
      }
    };
  
    // Call the function
    await removeFriendRequest(reciver, sender);
  });
  
}



module.exports = { handleChatSockets };