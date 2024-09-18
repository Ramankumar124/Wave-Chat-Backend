const userModel = require('../models/user')

// getting user contacts 
module.exports.userContacts= async(req,res,)=>{
    const user=await userModel.findOne({email:req.user.email}).populate('contacts')
    res.status(200).json(user.contacts);
    
}