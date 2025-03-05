import mongoose ,{Document,Schema} from 'mongoose';

interface IMessage extends Document{
   sender:mongoose.Types.ObjectId[];
   recipient:mongoose.Types.ObjectId[];
   content:string;
   image:string;
   chatId:mongoose.Types.ObjectId[];

}

const messageSchema:Schema = new Schema({
 sender:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User'
 },
 recipient:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User'
 },
 content:{
   type:String,
   required:true,
 },
 image:String,
 chatId:{
   type:mongoose.Schema.Types.ObjectId,
   ref:'Chat'
 }
//  ,
//  lastMessage:String
},{timestamps:true});


export  const Message=mongoose.model<IMessage>('Message',messageSchema);
