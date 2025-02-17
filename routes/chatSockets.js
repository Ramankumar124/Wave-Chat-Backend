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
 const newUser =connection.findIndex((user)=> user.socketId==data._id)
 if(newUser==-1){
    connection.push(

      {
        socketId: data._id,
        username: data.name
      }

    )
  }
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
    let reciver = connection.find((user) => user.socketId == contactUserId);
    let sender=connection.find((user)=>user.socketId==currentUserId);
    if (reciver) {
      // console.log("user socket id", reciver.socketId);
      // console.log(connection);
      // console.log("socketid  " + user.socketId + " contactuserid  " + contactUserId)
      // console.log(currentUserId);
      // let socketUserName = user.username;
      io.to(reciver.socketId).emit("notify", { message, currentUserId, senderName: sender.username });
      console.log("send notificaiton to ", reciver.socketId);
      
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

  socket.on('SendFreindRequest', async (senderEmail,reciverEmail) => {
    // console.log(data);
    // console.log(data.reciver._id);

    console.log("sender email",senderEmail
    );
    console.log("reciver email",reciverEmail);
    
    
  
    const sender = await user.findOne({ email: senderEmail })
    .populate('friendRequest.sent')
    .populate('friendRequest.received')
    .populate('contacts');
    
    const reciver = await user.findOne({ email: reciverEmail })
    .populate('friendRequest.sent')
    .populate('friendRequest.received')
    .populate('contacts');
  
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
      { email: senderEmail },
      { $push: { 'friendRequest.sent': reciver } },
      { new: true, upsert: false }
    ).populate('friendRequest.sent')
    .populate('friendRequest.received')
    .populate('contacts');

    const updateRecevierUser = await user.findOneAndUpdate(
      { email: reciverEmail },
      { $push: { 'friendRequest.received': sender } },
      { new: true, upsert: false }
    ).populate('friendRequest.sent')
    .populate('friendRequest.received')
    .populate('contacts');

    const senderChanges=updatedUser.friendRequest.sent;
    const reciverChanges=updateRecevierUser.friendRequest.received;

    
    console.log(`${sender.email} added ${reciver.email} to the sent list.`);
    
    // Emit the friend request event
    
   try {
   io.to(sender._id.toString()).emit('FriendRequestSended', senderChanges);
    console.log(sender);
    
   } catch (error) {
    console.log(error);
    
   }
    console.log("friend request sended to ",sender._id);
    
    io.to(reciver._id.toString()).emit('IncomingfriendRequest', {
      sender: {
        name: sender.name,
        profilePicture: sender.profilePicture,
        email: sender.email,
      },
      reciver: {
        name: reciver.name,
        profilePicture: reciver.profilePicture,
        email: reciver.email,
      },
    });
  }
    } catch (error) {
      console.error('Error processing friend request:', error);
    }
  });

  socket.on('freindRequestAccepted',async (senderEmail,reciverEmail)=>{

    const sender = await user.findOne({ email: senderEmail })
    .populate('friendRequest.sent')
    .populate('friendRequest.received')
    .populate('contacts');
    
    const reciver = await user.findOne({ email: reciverEmail })
    .populate('friendRequest.sent')
    .populate('friendRequest.received')
    .populate('contacts');

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
    const reciverChanges=updatedReciverUser.contacts;
    const senderChanges=updatedSenderUser.contacts;
    
  io.to(reciver._id.toString()).emit('AcceptedFriendRequest',reciverChanges);
  io.to(sender._id.toString()).emit('AcceptedFriendRequest',senderChanges);


  })

  socket.on('friendRequestDeclined', async (senderEmail, reciverEmail) => {
    const removeFriendRequest = async (reciverEmail, senderEmail) => {
      try {
        // Fetch the receiver's user document
        const receiverUser = await user.findOne({ email: reciverEmail })
    .populate('friendRequest.received')
    ;
        if (!receiverUser) throw new Error(`Receiver ${reciverEmail} not found`);
  
        // Remove sender from receiver's received friend requests
        receiverUser.friendRequest.received = receiverUser.friendRequest.received.filter(
          (request) => request.email !== senderEmail
        );
        await receiverUser.save();
  
        // Fetch the sender's user document
        const senderUser = await user.findOne({ email: senderEmail })
    .populate('friendRequest.sent')
    ;
        if (!senderUser) throw new Error(`Sender ${senderEmail} not found`);
  
        // Remove receiver from sender's sent friend requests
        senderUser.friendRequest.sent = senderUser.friendRequest.sent.filter(
          (request) => request.email !== reciverEmail
        );
        await senderUser.save();
  
        console.log("Friend requests updated successfully");
      } catch (error) {
        console.error("Error removing friend requests:", error.message);
      }
    };
  
    // Call the function
    await removeFriendRequest(reciverEmail, senderEmail);
  });
  
}




module.exports = { handleChatSockets };