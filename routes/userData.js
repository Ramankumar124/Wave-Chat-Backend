const mongoose=require('mongoose')
const {isLogin } =require('../middlewares/isLogin')
module.exports.userData= async(req,res,)=>{
isLogin
    console.log(req.user);
    res.json(req.user)
    
}