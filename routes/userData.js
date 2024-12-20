const express =require('express')
const userModel = require('../models/user')

// const {Redis}=require('ioredis')

// const client=new Redis();
module.exports.userData = async (req, res,) => {


    try {
        const user = await userModel.findOne({ email: req.user.email })
        .select('-password') // Exclude the password field
        .populate([
          {
            path: 'contacts',
            select: '-password -firebaseToken -contacts'
          },
          {
            path: 'friendRequest.sent', // Path to populate friendRequest.sent
            select: '-password -firebaseToken -contacts -friendRequest' // Fields to exclude or include
          },
          {
            path: 'friendRequest.received', // If you want to populate received friend requests as well
            select: '-password -firebaseToken -contacts -friendRequest'
          }
        ]);
        
        res.status(200).json(user);
    } catch (error) {
        res.status(404).json({message:error});
    }
   

}

module.exports.AllUserList=async (req,res)=>{

    try {
            // const allUsers=await client.get('AllUsersData');
            // if(allUsers){
            //     return res.status(200).json(JSON.parse(allUsers));
            // }
            // else {
        const users=await userModel.find().select('-password -firebaseToken -contacts -friendRequest');
        // await client.set('AllUsersData',JSON.stringify(users),'EX',3600);
     
     return   res.status(200).json(users)
    // }
    } catch (error) {
        res.status(404).json({message:error});
        console.log(error.message);
    }
}