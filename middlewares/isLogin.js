const jwt = require("jsonwebtoken");
const userModel = require("../models/user");


module.exports.isLogin = async function (req, res, next) {
    try {
        // Check if token is present in cookies

        // console.log(req);
        
        const token = req.cookies.token;
        if (!token) {   
            return res.status(401).json({ message: 'Authentication token is missing' });
        }

        // Verify token
        let decoded = jwt.verify(token, process.env.JWT_KEY);
        if (!decoded) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        // Fetch the user from the database using the decoded token info
        const user = await userModel.findOne({ email: decoded.email }).select("-password");
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Attach the user to the request object
        req.user = user;

        // Call the next middleware
        next();
    } catch (error) {
        // Handle token verification error
        console.error(error);
        res.status(401).json({ message: 'Authentication failed' });
    }
};