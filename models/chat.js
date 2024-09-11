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
})