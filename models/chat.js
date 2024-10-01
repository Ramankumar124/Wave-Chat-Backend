const mongoose=require('mongoose')


const chatSchema=mongoose.Schema({
    participent:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }],
    messages:[{
         type:mongoose.Schema.Types.ObjectId,
        ref:'Message'
    }]
},{timestamps:true})

const chatModel = mongoose.model('Chat', chatSchema); 

module.exports = chatModel; 