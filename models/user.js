const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/Wave Chat");

const userSchema = mongoose.Schema({
    name: String,
    phoneNo: Number,
    messages: [{
        type: mongoose.Schema.Types.ObjectId
    }
    ]
})
module.exports=mongoose.model("user",userSchema);