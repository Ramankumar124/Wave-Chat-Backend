const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/Wave Chat");

const userSchema = mongoose.Schema({
    name: String,
    phoneNo: Number,
    password: String,
    contacts: [],
    chats: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat'
    }
    ]
},{timestamps:true});
module.exports = mongoose.model("User", userSchema);