const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/wave-chat");

const userSchema = mongoose.Schema({
    name: String,
    phone: Number,
    email:String,
    password: String,
    contacts:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        }
    ],
    chats: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat'
    }
    ]
},{timestamps:true});
module.exports = mongoose.model("User", userSchema);