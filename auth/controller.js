const User = require('../user/model');
const Auth = require('./model');
const { createSendtoken } = require('../middlewares/auth');

const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
dotenv.config();
const { isValidObjectId } = require('mongoose');

//Signup User
const signup = async (req, res) => {
    const { username, email, password, gender, phonenum, address } = req.body;
    try {
        const user = await User.findOne({ $or: [{ username }] }); // find user by username 

        if (user) {
            return res.status(400).json({ message: 'User has been already created' }); // can't have the same with other user
        }

        const newUser = new User({ // to create user
            username,
            gender, email: email.toLowerCase(),
            password, phonenum, address,
        });

        const auth = new Auth({
            userId: newUser._id,
            password
        });

        //Create salt and hash
        const salt = await bcrypt.genSalt(10);

        newUser.password = await bcrypt.hash(req.body.password, salt); // to hash the password

        const token = createSendtoken(newUser, res); // this will help with the creation of token  

        await newUser.save();// is saved in the database
        await auth.save();

        res.status(201).json({ // if registered will show the following as the output
            newUser, token, status: true
        });
    } catch (error) {
        // if there is error
        console.error('Error in signup:', error);
        res.status(500).json({ message: error.message });
    }
};

// Verify Account

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
                message: 'Username or Password maybe incorrect',
                status: false
            });
        }
        const token = createSendtoken(user, res);

        res.status(200).json({ token, user, status: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.error("Error in loginUser: ", error.message);
    }
};

// Forgot Password

// Reset Password

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

// Passport 

// to export files
module.exports = { signup, login, logout, };
