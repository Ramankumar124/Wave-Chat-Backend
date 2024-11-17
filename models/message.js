const mongoose=require('mongoose');

const messageSchema=mongoose.Schema({
 sender:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User'
 },
 recipient:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User'
 },
 content:String,
 image:String,
 chatId:{
   type:mongoose.Schema.Types.ObjectId,
   ref:'Chat'
 }
//  ,
//  lastMessage:String
},{timestamps:true});

module.exports=mongoose.model('Message',messageSchema)