const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const mongoose=require('mongoose');
const { handleChatSockets } = require('./routes/chatSockets');
require('dotenv').config();

const PORT = process.env.PORT || 5000;
mongoose.connect("mongodb://localhost:27017/wave-chat").then(() => {
  console.log('MongoDB connected');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});;

// Create HTTP Server
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',  // Your React app
        methods: ['GET', 'POST'],
    },
});


try {
  io.on('connection', (socket) => {
    handleChatSockets(socket, io);
});
console.log("socket working perfectly");

} catch (error) {
  console.log("socket error",error);
  
}

// Handle Socket.io Connections


server.listen(PORT, function () {
    console.log(`Server running at Port ${PORT}`);
});
