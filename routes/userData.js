const express = require('express')
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
          select: '-password  -contacts'
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
    res.status(404).json({ message: error });
  }


}

module.exports.AllUserList = async (req, res) => {

  try {
    // const allUsers=await client.get('AllUsersData');
    // if(allUsers){
    //     return res.status(200).json(JSON.parse(allUsers));
    // }
    // else {
    const users = await userModel.find().select('-password -firebaseToken -contacts -friendRequest');
    // await client.set('AllUsersData',JSON.stringify(users),'EX',3600);

    return res.status(200).json(users)
    // }
  } catch (error) {
    res.status(404).json({ message: error });
    console.log(error.message);
  } 1
}
module.exports.updateUser = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    if (!req.user || !req.user.email) {
      return res.status(401).json({ message: "Unauthorized user" });
    }

    const { buffer, mimetype } = req.file;

    // Convert the image buffer to a base64 string
    const base64Image = `data:${mimetype};base64,${buffer.toString("base64")}`;

    // Update the user's profilePicture field in the database
    const user = await userModel.findOneAndUpdate(
      { email: req.user.email }, // Find user by email
      { profilePicture: base64Image }, // Set the new profilePicture
      { new: true } // Return the updated user document
    ).select('-password') // Exclude the password field
    .populate([
      {
        path: 'contacts',
        select: '-password  -contacts'
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

    if (user) {
      res.status(200).json({ message: "Profile Picture Updated", user: user });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};
