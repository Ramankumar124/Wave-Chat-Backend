import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";


dotenv.config()

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
})

const uploadToCloudinary=async(filePath:string)=>{
    try {
        if(!filePath) return null;

        const response=await cloudinary.uploader.upload(filePath,{
            folder:"waveChat",
            resource_type:"auto"
        })
        fs.unlinkSync(filePath);
        return response
    } catch (error) {
      console.log("error uploading to cloud",error);
      
        fs.unlinkSync(filePath) 
        return null;  
    }
}

const deleteFromCloudinary = async (public_id:string) => {
    try {
      if (public_id) {
        const res = await cloudinary.uploader.destroy(public_id);
        return res;
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  };
  
  export { deleteFromCloudinary, uploadToCloudinary };

