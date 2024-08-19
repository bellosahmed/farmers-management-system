const User = require('./model');
const { createSendtoken } = require('../middlewares/auth');

// User profile
const getuser = async (req, res) => {
    const userId = req.params.id; // Get the id of the user
    try {
        const user = await User.findById(userId).select('-password'); // Find user by id, excluding password

        if (!user) { // If no user is found
            return res.status(404).json({ message: "User not found", status: false });
        }

        const token = createSendtoken(user, res); // Generate and send token
        res.status(200).json({ status: true, token, user });
    } catch (error) {
        console.error('Error in get user profile:', error.message);
        res.status(500).json({ message: error.message });
    }
};

// Edit 


// Delete 

module.exports = { getuser };
