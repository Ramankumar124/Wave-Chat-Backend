import { Router } from "express";
import { getUserChat } from "../controllers/chat.controller";
import { jwtVerify } from "../middlewares/verify.middleware";

 const router=Router();
router.route("/:selectedChatId").get(jwtVerify,getUserChat);
export {router as ChatRoutes}