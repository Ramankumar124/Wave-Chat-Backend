const express=require('express')
const router=express.Router();
const userModel = require('../models/user');

router.post('/storeToken',async (req,res)=>{
console.log("body",req.body.FBtoken);
const user=await userModel.findOneAndUpdate({email:req.user.email},{
    firebaseToken:req.body.FBtoken
});
console.log(user);

res.status(201).json( { "status":"token Created"})

})
module.exports=router;