const userModel = require('../models/user');
const bcrypt = require('bcrypt');
const { generateToken } = require('../utils/genrateToken');


module.exports.registerUser = async function (req, res) {
    const { email, password, phone, name } = req.body;
    try {
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password and create user only after successful hashing
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return res.status(500).json({ message: 'Error generating salt', error: err.message });
            }

            bcrypt.hash(password, salt, async function (err, hash) {
                if (err) {
                    return res.status(500).json({ message: 'Error hashing password', error: err.message });
                }
             
                // Create the user after password is hashed
                try {
                    const newUser = await userModel.create({
                        name,
                        email,
                        password: hash,
                        phone,
                    });
                    let token = generateToken(newUser);
                    res.cookie("token", token);
                    // Respond after user creation
                    return res.status(201).json({ message: 'User registered successfully', user: newUser });
                } catch (error) {
                    return res.status(500).json({ message: 'Error creating user', error: error.message });
                }
            });
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


module.exports.loginUser = async function (req, res) {
    const { password, email } = req.body;
    try {
        const user = await userModel.findOne({ email })
        if (user) {
            bcrypt.compare(password, user.password,async function (err, result) {
                if (result) {
                    console.log(result);
                    let token = generateToken(user);

       
                    res.cookie("token", token);
                    res.status(200).json({ message: 'User Found', User: user });
               
                }
                else {
                    console.log(result);

                    res.status(401).json({ message: 'wrong crenditals' });

                }
            })
        }
        else {
            res.status(401).json({ message: "Wrong Crendials......." })

        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }



}

module.exports.logoutUser= function (req, res) {

    try {
        if (req.cookies?.token) {
            res.cookie("token", "");
            res.status(200).json({ message: 'user signedout' })
        }
        else{
            res.status(500).json({ message: "Cokkie not found" })
        }
    } catch (error) {
        res.status(500).json({ message: "internal server error", error })
    }

}
module.exports.googleLogin=async function (req,res){
    const {data}=req.body;
    try {
    //    console.log("data google login",data.user);
       
        const user=await userModel.findOne({email:data.user.email})
        // console.log(user);
        if(!user){
            console.log("not found user");
            const newUser = await userModel.create({
                name:data.user.displayName,
                email:data.user.email,
            });
            let token = generateToken(newUser);
                 res.cookie("token", token);
         return res.status(200).json({ message: 'User registered with google successfully', user: newUser });
        }
        else{
            // console.log(" user",user);
            let token = generateToken(user);
            res.cookie("token", token);
         return   res.status(200).json({ message: 'Loggedin with google', User: user });

        }
        
    } catch (error) {
        console.log(error.message);
        
    }
}
