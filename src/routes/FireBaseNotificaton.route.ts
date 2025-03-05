import { Router } from "express";
import { FBNotification } from "../controllers/FBnotification.Controller";
import { jwtVerify } from "../middlewares/verify.middleware";

const router=Router();

router.route('/storeToken',).post(jwtVerify,FBNotification);

export {router as notificationRoute}