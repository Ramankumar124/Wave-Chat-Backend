import mongoose from 'mongoose';

const DBConnection=async()=>{
    try {
        const connection=await mongoose.connect(process.env.MONGO_URL as string);
        console.log(`connection successfully ${connection.connection.host}`);
        
    } catch (error) {
        console.log(`mongodb connection failed ${error}`);
        process.exit(1);
    }
}
export {DBConnection}