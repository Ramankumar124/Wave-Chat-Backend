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
 
},{timestamps:true});

module.exports=mongoose.model('Message',messageSchema)