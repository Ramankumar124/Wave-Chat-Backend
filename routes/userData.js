const express =require('express')
const userModel = require('../models/user')


module.exports.userData = async (req, res,) => {
    try {
        const user = await userModel.findOne({ email: req.user.email }).populate('contacts')
        res.status(200).json(user);
    } catch (error) {
        res.status(404).json({message:error});
    }
   

}