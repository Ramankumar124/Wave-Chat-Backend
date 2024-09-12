const userModel=require('../models/user')
const bcrypt = require("bcrypt");

module.exports.registerUser= async function(req,res){
    const {email,password,phone,name}=req.body;

    // const user=await userModel.create
}