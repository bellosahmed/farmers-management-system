const User = require('./model');
const bcrypt = require('bcryptjs');
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
const edituser = async (req, res) => {
    const { fullname, password, address, state, city, phonenum } = req.body; // Extract fields from request body
    const userId = req.user._id; // Get the ID of the authenticated user

    try {
        // Find the user by ID
        let user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ message: "No User found", status: false });
        }

        // Check if the ID in the URL matches the authenticated user's ID
        if (req.params.id !== userId.toString()) {
            return res.status(403).json({ message: "Cannot update another user's profile", status: false });
        }

        // Update user details
        user.fullname = fullname || user.fullname;
        user.address = address || user.address;
        user.state = state || user.state;
        user.city = city || user.city;
        user.phonenum = phonenum || user.phonenum;

        // If the password is provided, hash it before saving
        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedpassword = await bcrypt.hash(password, salt);
            user.password = hashedpassword;
        }

        // Save the updated user to the database
        await user.save();

        // Respond with success
        return res.status(200).json({ message: 'Profile updated successfully', status: true });

    } catch (error) {
        // Handle errors and respond with an appropriate message
        console.error('Error in updating user:', error.message);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};;


// Delete 
const deluser = async (req, res) => {
    try {

        const user = await User.findById(req.params.id); // find by user by id

        if (!user) return res.status(404).json({ message: 'User not found', status: false }); // no user

        if (user._id.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'You are not authorized delete this user', status: false }); // only user with the same token can delete
        }
        await User.findByIdAndDelete(req.params.id); // find by user id and delete 

        res.status(200).json({ message: 'You deleted your account', status: true }) // will delete account
    } catch (error) {
        // if there is error
        res.status(500).json({ message: error.message })
        console.log('Error in delete user', error.message);
    }
};

module.exports = { getuser, edituser, deluser };
