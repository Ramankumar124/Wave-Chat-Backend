import mongoose from 'mongoose';

const DBConnection=async()=>{
    try {
        // console.log(process.env.);
        
        const connection=await mongoose.connect('mongodb://localhost:27017/wave-chat-test');
        console.log(`connection successfully ${connection.connection.host}`);
        
    } catch (error) {
        console.log(`mongodb connection failed ${error}`);
        process.exit(1);
    }
}
export { DBConnection}