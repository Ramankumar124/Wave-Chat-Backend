const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const mongoose=require('mongoose');
const { handleChatSockets } = require('./routes/chatSockets');
require('dotenv').config();

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URL).then(() => {
  console.log('MongoDB connected with',mongoose.connection.host);
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});;

// Create HTTP Server
const server = http.createServer(app);

const ALLOWED_ORIGINS = ['https://wave-chat-rho.vercel.app', 'http://localhost:5173'];
// Setup Socket.io
const io = new Server(server, {
    cors: {
        origin:ALLOWED_ORIGINS,  
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
