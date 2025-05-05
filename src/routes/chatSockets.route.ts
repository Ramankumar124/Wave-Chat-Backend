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
  message: string;
  senderId: string;
  receiverId: string;
  reciverFBToken?: string;
  reciverName?: string;
}

let connection: Connection[] = [];
let onlineUser: OnlineUser[] = [];

const handleChatSockets = (socket: Socket, io: Server) => {

  socket.on("setup", ({ data, OrignalSocketId }: { data: UserData; OrignalSocketId: string }) => {
    socket.join(data._id);
    // yo mainatain all connected users;
    const newUser = connection.findIndex((user) => user.socketId == data._id);
    if (newUser == -1) {
      connection.push({
        socketId: data._id,
        username: data.name
      });
    }
    // to send status of online user
    const user = onlineUser.findIndex((user) => user.OrignalSocketId == OrignalSocketId)
    if (user == -1) {
      onlineUser.push({
        OrignalSocketId,
        username: data.name,
        email: data.email
      });
    }
    io.emit("Online-Users", onlineUser);
  });

  socket.on("disconnect", () => {
    let newOnlineUser = onlineUser.filter((user) => user.OrignalSocketId !== socket.id);
    onlineUser = newOnlineUser;
    io.emit("Online-Users", onlineUser);
  });

  socket.on('join-room', ({ senderId,receiverId }: { senderId: string;receiverId: string }) => {
    const room=[senderId,receiverId].sort().join("_");
    socket.join(room);
  });

  socket.on('sendMessage', async (data: MessageData) => {
    const { message, senderId, receiverId, reciverFBToken, reciverName } = data;
    const room=[senderId,receiverId].sort().join("_");


    io.to(room).emit('receiveMessage', { message,senderId,receiverId });
    io.to(receiverId).emit("soundpopup");
    let reciver = connection.find((user) => user.socketId == receiverId);
    let sender = connection.find((user) => user.socketId ==senderId);
    if (reciver) {
      io.to(reciver.socketId).emit("notify", { message,senderId,senderName: sender?.username });
    }

    // // send notification with firebase 
    // if (reciverFBToken && reciverName) {
    //   sendFirebaseMessage(message, reciverFBToken, reciverName);
    // }

    let chat = await Chat.findOne({
      participent: { $all: [senderId,receiverId] }
    }).populate('messages');

    if (!chat) {
      chat = await Chat.create({
        participent: [senderId,receiverId]
      });
    }

    const newMessage:any = await Message.create({
      sender: senderId,
      recipient: receiverId,
      content: message,
      // image: selectedImage,
      chatId: chat._id
    });
    chat.messages.push(newMessage._id);
    await chat.save();
  });

  socket.on('Typing-indicator', async (roomId: string, senderId: string) => {
    let IncomingSenderId=senderId;
    io.to(roomId).emit('Typing',roomId,IncomingSenderId);
  });
  socket.on('Stop-typing', async (roomId: string) => {
    io.to(roomId).emit('typing-stop');
  });

  // call socket 
  socket.on('join-call-room', (receiverId: string, roomId: string, userPeerId: string, data: any) => {
    socket.join(roomId);
    io.to(receiverId).emit('incomming-call', data);
    socket.to(roomId).emit('start-call', userPeerId);
  });

  socket.on("call-declined", (id: string) => {
    io.to(id).emit("call-rejected");
  });

  socket.on("call-Ended", (room: string) => {
    io.to(room).emit("send-call-ended");
  });

  socket.on('SendFreindRequest', async (senderEmail: string, reciverEmail: string) => {
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

        try {
          io.to(sender._id.toString()).emit('FriendRequestSended', senderChanges);
        } catch (error:any) {
          console.log(error?.message);
        }

        io.to(reciver._id.toString()).emit('IncomingfriendRequest', {
          sender: {
            name: sender.name,
            profilePicture: sender.avatar.url,
            email: sender.email,
          },
          reciver: {
            name: reciver.name,
            profilePicture: reciver.avatar.url,
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
      } catch (error:any) {
        console.error("Error removing friend requests:", error.message);
      }
    };

    await removeFriendRequest(reciverEmail, senderEmail);
  });
};

export { handleChatSockets };