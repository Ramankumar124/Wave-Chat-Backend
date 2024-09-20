const userModel = require('../models/user')


module.exports.userData = async (req, res,) => {
    const user = await userModel.findOne({ email: req.user.email }).populate('contacts')
    res.status(200).json(user);

}