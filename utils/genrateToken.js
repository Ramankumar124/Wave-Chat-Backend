const jwt=require('jsonwebtoken')

const generateToken=async (user)=>{
// console.log(user);

  return await jwt.sign({email:user.email,id:user._id},process.env.JWT_KEY,{expiresIn:'1h'})
}

module.exports.generateToken=generateToken;