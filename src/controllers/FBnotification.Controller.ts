import  { Request, Response } from 'express';
import User from '../models/user.model';


export const FBNotification=async (req: Request, res: Response) => {
    console.log("body", req.body.FBtoken);
    //@ts-ignore
    const user = await User.findOneAndUpdate({ email: req?.user?.email }, {
        firebaseToken: req.body.FBtoken
    });
    console.log(user);

    res.status(201).json({ "status": "token Created" });
};

