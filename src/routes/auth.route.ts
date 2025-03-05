import express, { Router } from 'express';
import { registerUser, loginUser, logoutUser, updateAvatar, userData, AllUserList, verifyEmail, resendEmail, forgotPassword, verifyForgotPassword } from '../controllers/auth.Controller';
import {upload} from '../middlewares/multer.middleware'
import { jwtVerify } from '../middlewares/verify.middleware';

const router=Router();
router.route("/test").get((req,res)=>{
    res.send("this is also running")
})
router.route("/register").post(upload.fields([{name:"avatar",maxCount:1}]), registerUser);
router.route('/login').post(loginUser);
router.route('/verifyEmail').post(verifyEmail);
router.route('/resendEmail').post(resendEmail);
router.route('/forgotPassword').post(forgotPassword);
router.route('/verifyForgotPassword').post(verifyForgotPassword);
router.route('/logout').get(jwtVerify,logoutUser );
router.route('/userData').get(jwtVerify,userData);
router.route('/get-all-users').get(AllUserList);
router.route('/updateAvatar').post(upload.fields([{name:"avatar",maxCount:1}]),jwtVerify,updateAvatar);
// router.post('/googleLogin',googleLogin)

export { router as authRoutes };