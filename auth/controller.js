const User = require('../user/model');
const Auth = require('./model');

//Signup User
const signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = await User.findOne({ $or: [{ username }] }); // find user by username 

        if (user) {
            return res.status(400).json({ message: 'User exists' }); // can't have the same with other user
        }

        const newUser = new User({ // to create user
            username,
            email,
            password
        });

        const auth = new Auth({
            userId: newUser._id,
            password
        });


        await newUser.save();// is saved in the database
        await auth.save();

        res.status(201).json({ // if registered will show the following as the output
            newUser
        });
    } catch (error) {
        // if there is error
        console.error('Error in signup:', error);
        res.status(500).json({ message: error.message });
    }
};

// Login
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!(username && password)) {
            return res.status(400).json({ msg: "All input is required", status: false });
        }

        const user = await User.findOne({ username });

        if (!user) {
            return res.status(400).json({
                message: 'User does not exist',
                status: false
            });
        }

        res.status(200).json({ user, status: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.error("Error in loginUser: ", error.message);
    }
};

// logout
const logout = async (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 1 });
        res.status(200).json({ message: 'User logged out' }); // user to logout
    } catch (error) {
        // if there is error
        res.status(500).json({ message: error.message });
        console.log("Error in Logout: ", error.message);
    }
};

// Reset Password
const verifypass = async (req, res) => {

};

// to export files
module.exports = { signup, login, logout, verifypass };
