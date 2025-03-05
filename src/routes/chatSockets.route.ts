import { Socket, Server } from 'socket.io';
import { Chat } from "../models/chat.model";
import { Message } from '../models/message.model';
import User from "../models/user.model";
import { sendFirebaseMessage } from "../Services/firebaseServie";

interface UserData {
  _id: string;
  name: string;
  email: string;
}

interface Connection {
  socketId: string;
  username: string;
}

interface OnlineUser {
  OrignalSocketId: string;
  username: string;
  email: string;
}

interface MessageData {
  roomId: string;
  message: string;
  selectedImage?: string;
  currentUserId: string;
  contactUserId: string;
  reciverFBToken?: string;
  reciverName?: string;
}

let connection: Connection[] = [];
let onlineUser: OnlineUser[] = [];

const handleChatSockets = (socket: Socket, io: Server) => {

  socket.on("setup", ({ data, OrignalSocketId }: { data: UserData; OrignalSocketId: string }) => {
    socket.join(data._id);
    console.log(OrignalSocketId);
    const newUser = connection.findIndex((user) => user.socketId == data._id);
    if (newUser == -1) {
      connection.push({
        socketId: data._id,
        username: data.name
      });
    }
    const user = onlineUser.findIndex((user) => user.OrignalSocketId == OrignalSocketId);
    console.log(user);

    if (user == -1) {
      onlineUser.push({
        OrignalSocketId,
        username: data.name,
        email: data.email
      });
    }
    console.log(`${data.name} with id ${data._id} joined server socket`);
    console.log("online users ", onlineUser);

    io.emit("Online-Users", onlineUser);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected:", socket.id);
    let newOnlineUser = onlineUser.filter((user) => user.OrignalSocketId !== socket.id);
    onlineUser = newOnlineUser;
    console.log("online users left after someone left", onlineUser);
    io.emit("Online-Users", onlineUser);
  });

  socket.on('join-room', ({ roomId, userId }: { roomId: string; userId: string }) => {
    socket.join(roomId);
    console.log(`${userId} joined room: ${roomId}`);
  });

  socket.on('sendMessage', async (data: MessageData) => {
    const { roomId, message, selectedImage, currentUserId, contactUserId, reciverFBToken, reciverName } = data;
    console.log(roomId, message, selectedImage, currentUserId, contactUserId);

    io.to(roomId).emit('receiveMessage', { roomId, message, selectedImage, currentUserId, contactUserId });
    io.to(contactUserId).emit("soundpopup");
    let reciver = connection.find((user) => user.socketId == contactUserId);
    let sender = connection.find((user) => user.socketId == currentUserId);
    if (reciver) {
      io.to(reciver.socketId).emit("notify", { message, currentUserId, senderName: sender?.username });
      console.log("send notification to ", reciver.socketId);
    }

    // send notification with firebase 
    if (reciverFBToken && reciverName) {
      sendFirebaseMessage(message, reciverFBToken, reciverName);
    }

    let chat = await Chat.findOne({
      participent: { $all: [currentUserId, contactUserId] }
    }).populate('messages');

    if (!chat) {
      chat = await Chat.create({
        participent: [currentUserId, contactUserId]
      });
    }

    const newMessage:any = await Message.create({
      sender: currentUserId,
      recipient: contactUserId,
      content: message,
      image: selectedImage,
      chatId: chat._id
    });

    chat.messages.push(newMessage._id);
    await chat.save();
  });

  socket.on('Typing-indicator', async (roomId: string, currentUserId: string) => {
    io.to(roomId).emit('Typing', roomId, currentUserId);
  });

  socket.on('Stop-typing', async (roomId: string) => {
    io.to(roomId).emit('typing-stop');
  });

  // call socket 
  socket.on('join-call-room', (contactUserId: string, roomId: string, userPeerId: string, data: any) => {
    socket.join(roomId);
    io.to(contactUserId).emit('incomming-call', data);
    socket.to(roomId).emit('start-call', userPeerId);
  });

  socket.on("call-declined", (id: string) => {
    io.to(id).emit("call-rejected");
  });

  socket.on("call-Ended", (room: string) => {
    io.to(room).emit("send-call-ended");
  });

  socket.on('SendFreindRequest', async (senderEmail: string, reciverEmail: string) => {
    console.log("sender email", senderEmail);
    console.log("reciver email", reciverEmail);

    const sender :any = await User.findOne({ email: senderEmail })
      .populate('friendRequest.sent')
      .populate('friendRequest.received')
      .populate('contacts');

    const reciver :any= await User.findOne({ email: reciverEmail })
      .populate('friendRequest.sent')
      .populate('friendRequest.received')
      .populate('contacts');

    try {
      const userDoc = await User.findOne({ email: sender.email })
        .populate('friendRequest.sent')
        .populate('friendRequest.received');
      if (!userDoc) {
        console.error(`User with email ${sender.email} not found`);
        return;
      }

      const alreadySent = userDoc.friendRequest.sent.some(
        (req: any) => req.email === reciver.email
      );

      if (alreadySent) {
        console.log(`${reciver.email} is already in the sent list.`);
        return;
      } else {
        const updatedUser :any = await User.findOneAndUpdate(
          { email: senderEmail },
          { $push: { 'friendRequest.sent': reciver } },
          { new: true, upsert: false }
        ).populate('friendRequest.sent')
          .populate('friendRequest.received')
          .populate('contacts');

        const updateRecevierUser:any = await User.findOneAndUpdate(
          { email: reciverEmail },
          { $push: { 'friendRequest.received': sender } },
          { new: true, upsert: false }
        ).populate('friendRequest.sent')
          .populate('friendRequest.received')
          .populate('contacts');

        const senderChanges = updatedUser.friendRequest.sent;
        const reciverChanges = updateRecevierUser.friendRequest.received;

        console.log(`${sender.email} added ${reciver.email} to the sent list.`);

        try {
          io.to(sender._id.toString()).emit('FriendRequestSended', senderChanges);
        } catch (error) {
          console.log(error);
        }
        console.log("friend request sended to ", sender._id);

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

  socket.on('freindRequestAccepted', async (senderEmail: string, reciverEmail: string) => {
    const sender:any = await User.findOne({ email: senderEmail })
      .populate('friendRequest.sent')
      .populate('friendRequest.received')
      .populate('contacts');

    const reciver:any = await User.findOne({ email: reciverEmail })
      .populate('friendRequest.sent')
      .populate('friendRequest.received')
      .populate('contacts');

    const updatedReciverUser:any = await User.findOneAndUpdate(
      { email: reciver.email },
      { $push: { 'contacts': sender } },
      { new: true, upsert: false }
    ).populate('contacts');

    const updatedSenderUser:any = await User.findOneAndUpdate(
      { email: sender.email },
      { $push: { 'contacts': reciver } },
      { new: true, upsert: false }
    ).populate('contacts');

    console.log("updated user with new contact which is ", updatedReciverUser);
    const reciverChanges = updatedReciverUser.contacts;
    const senderChanges = updatedSenderUser.contacts;

    io.to(reciver._id.toString()).emit('AcceptedFriendRequest', reciverChanges);
    io.to(sender._id.toString()).emit('AcceptedFriendRequest', senderChanges);
  });

  socket.on('friendRequestDeclined', async (senderEmail: string, reciverEmail: string) => {
    const removeFriendRequest = async (reciverEmail: string, senderEmail: string) => {
      try {
        const receiverUser = await User.findOne({ email: reciverEmail })
          .populate('friendRequest.received');
        if (!receiverUser) throw new Error(`Receiver ${reciverEmail} not found`);

        receiverUser.friendRequest.received = receiverUser.friendRequest.received.filter(
          (request: any) => request.email !== senderEmail
        );
        await receiverUser.save();

        const senderUser = await User.findOne({ email: senderEmail })
          .populate('friendRequest.sent');
        if (!senderUser) throw new Error(`Sender ${senderEmail} not found`);

        senderUser.friendRequest.sent = senderUser.friendRequest.sent.filter(
          (request: any) => request.email !== reciverEmail
        );
        await senderUser.save();

        console.log("Friend requests updated successfully");
      } catch (error:any) {
        console.error("Error removing friend requests:", error.message);
      }
    };

    await removeFriendRequest(reciverEmail, senderEmail);
  });
};

export { handleChatSockets };