const mongoose = require('mongoose');


const userSchema = mongoose.Schema({
    name: String,
    phone: Number,
    email: String,
    password: String,
    contacts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    chats: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat'
    }
    ],
    firebaseToken: String,
    isOnline: {
        type: Boolean,
        default: false
    }


}, { timestamps: true });
module.exports = mongoose.model("User", userSchema);