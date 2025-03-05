import multer from "multer";
import { Request } from "express";

const storage = multer.diskStorage({
    destination: function (req:Request, file, cb) {
      cb(null, './public/temp')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })



export const upload = multer({ storage: storage })