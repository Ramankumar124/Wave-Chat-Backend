const mongoose=requrie('mongoose');

mongoose.connect("mongodb://localhost:27017/Wave Chat");

const userSchema=mongoose.Schema