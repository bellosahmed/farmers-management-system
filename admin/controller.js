const User = require('../user/model');
const { createSendtoken } = require('../middlewares/auth')

//admin get all user
const alluser = async (req, res) => {
    try {
        const getuser = req.userId
        const user = await User.find({ _id: { $ne: getuser }, role: { $nin: ['admin'] } });
        if (!user) {
            return res.status(404).json({ status: false, message: 'No user parcel found' });
        }
        res.status(200).json({ status: true, message: 'All users has been found', user })
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log("Error in all user admin: ", error.message);
    }
};

module.exports = { alluser };