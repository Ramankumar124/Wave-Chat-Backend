import { Request, Response, Express, urlencoded } from "express";
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { authRoutes } from "./routes/auth.route";
import { ChatRoutes } from "./routes/chat.route";
import { notificationRoute } from "./routes/FireBaseNotificaton.route";
import gemmniChat from "./routes/gemmniChat.route";
import logger from "./utils/logger";
import morgan from "morgan";
import { errorHandler } from "./middlewares/ErrorHandler.middleware";
import { jwtVerify } from "./middlewares/verify.middleware";
const app: Express = express();

const morganFormat = ":method :url :status :response-time ms";

app.use(
  morgan(morganFormat, {
    stream: {
      write: (message: any) => {
        const logObject = {
          method: message.split(" ")[0],
          url: message.split(" ")[1],
          status: message.split(" ")[2],
          responseTime: message.split(" ")[3],
        };
        logger.info(JSON.stringify(logObject));
      },
    },
  })
);
// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));
app.use(express.json({ limit: "1mb" }));
app.use(urlencoded({ extended: true, limit: "1mb" }));

const ALLOWED_ORIGINS: string[] = [
  process.env.CLIENT_URL as string,
  "http://localhost:5173",
];

app.use(
  cors({
    origin: ALLOWED_ORIGINS,
    credentials: true,
  })
);

try {
  // Routes
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/chat", jwtVerify, ChatRoutes);
  app.use("/api/v1/Notification", jwtVerify, notificationRoute);
  app.get("/gemmniChat", gemmniChat);
  app.use(errorHandler);
} catch (error:any) {
  console.log(error?.message);
}

export default app;
