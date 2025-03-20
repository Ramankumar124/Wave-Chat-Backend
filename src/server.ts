import http from "http";
import app from "./app";
import { Server } from "socket.io";
import { handleChatSockets } from "./routes/chatSockets.route";
import dotenv from "dotenv";
import { DBConnection } from "./database";
dotenv.config();
const PORT = process.env.PORT || 5000;

 DBConnection();

// Create HTTP Server
const server = http.createServer(app);

const ALLOWED_ORIGINS:any = [process.env.CLIENT_URL, "http://localhost:5173"];
// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST"],
  },
});

try {
  io.on("connection", (socket) => {
    
    handleChatSockets(socket, io);
  });
  console.log("socket working perfectly");
} catch (error) {
  console.log("socket error", error);
}

// Handle Socket.io Connections

server.listen(PORT, function () {
  console.info(`Server running at Port ${PORT}`);
});
