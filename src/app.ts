import { Request, Response, Express, urlencoded } from "express";
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import {authRoutes} from "./routes/auth.route";
import {ChatRoutes} from "./routes/chat.route";
import {notificationRoute} from "./routes/FireBaseNotificaton.route";
import gemmniChat from "./routes/gemmniChat.route";
const app: Express = express();

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
  app.use("/api/v1/chat", ChatRoutes);
  app.use("/api/v1/Notification", notificationRoute);
  app.get("/gemmniChat", gemmniChat);
} catch (error) {
  console.log(error);
}

export default app;
