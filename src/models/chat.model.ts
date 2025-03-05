import mongoose,{Document,Schema} from 'mongoose';


interface IChat extends Document{
    participent:mongoose.Types.ObjectId[];
    messages:mongoose.Types.ObjectId[];
}
const chatSchema=new Schema({
    participent:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }],
    messages:[{
         type:mongoose.Schema.Types.ObjectId,
        ref:'Message'
    }]
},{timestamps:true})

 export const Chat = mongoose.model('Chat', chatSchema); 
