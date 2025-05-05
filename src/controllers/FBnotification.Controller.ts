import  { Request, Response } from 'express';
import User from '../models/user.model';


export const FBNotification=async (req: Request, res: Response) => {
    //@ts-ignore
    const user = await User.findOneAndUpdate({ email: req?.user?.email }, {
        firebaseToken: req.body.FBtoken
    });
    res.status(201).json({ "status": "token Created" });
};

