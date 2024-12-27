const mongoose = require('mongoose');


const userSchema = mongoose.Schema({
    name: String,
    email: String,
    password: String,
    bio:String,
    contacts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    firebaseToken: String,
    isOnline: {
        type: Boolean,
        default: false
    },

  friendRequest: {
      sent: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
      received: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
    },

profilePicture:String,


}, { timestamps: true });
module.exports = mongoose.model("User", userSchema);