const User = require('../user/model');
const { Verify, Resettoken } = require('./model');
const { createSendtoken } = require('../middlewares/auth');
const { createTransporter, createMailOptions } = require('../utilis/email');
const { generateOtp } = require('../utilis/otp');

const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
dotenv.config();
const { isValidObjectId } = require('mongoose');

//Signup User
const signup = async (req, res) => {
    const { username, email, password, gender, phonenum, address } = req.body;
    try {
        const user = await User.findOne({ $or: [{ username }] });

        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const newUser = new User({
            username,
            gender,
            email: email.toLowerCase(),
            password,
            phonenum,
            address,
        });

        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(password, salt);

        const token = createSendtoken(newUser, res);

        const otp = generateOtp();
        const verify = new Verify({
            owner: newUser._id,
            token: otp,
        });

        const transporter = createTransporter();

        const textMessage = `Click the following link to verify your account: ${otp}`;
        const htmlMessage = `<p>Insert the OTP code to verify your account:</p><p>${otp}</p>`;

        const mailOptions = createMailOptions(
            newUser.email,
            'Verify Account',
            textMessage,
            htmlMessage
        );

        await transporter.sendMail(mailOptions);
        await verify.save();
        await newUser.save();

        res.status(201).json({
            newUser,
            token,
            status: true,
        });
    } catch (error) {
        console.error('Error in signup:', error);
        res.status(500).json({ message: error.message });
    }
};

// Verify Account
const verify = async (req, res) => {
    try {
        const { userId, otp } = req.body; // details to get

        // Check for missing or empty userId and otp
        if (!userId || !otp.trim()) {
            return res.status(400).json({ msg: 'Invalid request', status: false });
        }

        // Check if userId is a valid ObjectId
        if (!isValidObjectId(userId)) {
            return res.status(400).json({ msg: 'Invalid Id', status: false });
        }
        const user = await User.findById(userId); // find by user by id
        if (!user) {
            return res.status(404).json({ msg: 'No user found', status: false });
        }

        // Check if the user is already verified
        if (user.isVerified) {
            return res.status(400).json({ msg: 'Account is already verified', status: true });
        }

        // Find the verification token for the user
        const token = await Verify.findOne({
            owner: user._id,
        });

        if (!token) { // if token does not exist
            return res.status(400).json({ msg: 'No verification token found', status: false });
        }

        user.isVerified = true; // will change this to be from false to true
        await Verify.findByIdAndDelete(token._id); // delete the token
        await user.save(); // save the user

        const transporter = createTransporter();

        const textMessage = `Mail has been verified`; // message to be sent 
        const htmlMessage = `<p> Check your mail to access your account</p>`; // message to be sent 

        const mailOptions = createMailOptions( // details to be passed
            user.email,
            'Verify account',
            textMessage,
            htmlMessage
        );

        await transporter.sendMail(mailOptions); // send the mails

        return res.status(200).json({
            success: true,
            msg: 'Account has been verified'
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
                message: 'Username or Password maybe incorrect',
                status: false
            });
        };

        if (!user.isVerified) {

            const otp = generateOtp();
            const verify = new Verify({
                owner: user._id,
                token: otp,
            });
            const transporter = createTransporter();
            const textMessage = `Click the following link to verify your account: ${otp}`;
            const htmlMessage = `<p>Insert the OTP code to verify your account:</p><p>${otp}</p>`;

            const mailOptions = createMailOptions(
                user.email,
                'Verify Account',
                textMessage,
                htmlMessage
            );
            await transporter.sendMail(mailOptions);
            await verify.save();
            // await sendOTP(user, otp);
            return res.status(401).json({
                msg: 'Please verify your account before logging in. OTP has been sent for verification.',
                status: false
            });
        };

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ msg: 'Invalid Credentials', status: false });
        };

        const token = createSendtoken(user, res);

        res.status(200).json({ token, user, status: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.error("Error in loginUser: ", error.message);
    }
};

// Forgot Password
const forgotpass = async (req, res) => {
    const { email } = req.body;

    try {
        if (!email) {
            return res.status(400).json({ msg: 'Provide a valid email', status: false });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ msg: 'User not found', status: false });
        }

        const token = await Resettoken.findOne({ owner: user._id });

        if (token) {
            return res.json({ msg: 'Your forgot password email has been sent', status: true });
        }

        const otp = await generateOtp();
        const reset = new Resettoken({
            owner: user._id,
            token: otp
        });

        const transporter = createTransporter();
        const textMessage = `This is the link to your forgot password ${otp}`;
        const htmlMessage = `<p>Use the link to access your password</p> ${otp}`;

        const mailOptions = createMailOptions(
            user.email,
            'Forgot Password',
            textMessage,
            htmlMessage
        );

        await transporter.sendMail(mailOptions);
        await reset.save();

        res.status(200).json({ msg: 'Check your email for the reset pin', status: true });

    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log("Error in Forgot Password: ", error.message);
    }
};

// Reset Password
const resetpass = async (req, res) => {
    try {
        const { userId, otp, password } = req.body;

        if (!userId || !otp || !password) {
            return res.status(400).json({ msg: 'Invalid request. Please provide userId, otp, and password', status: false });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(400).json({ msg: 'Invalid user', status: false });
        }

        const storedToken = await Resettoken.findOne({ owner: user._id, token: otp });

        if (!storedToken) {
            return res.status(400).json({ msg: 'Invalid OTP', status: false });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        await Resettoken.deleteOne({ owner: user._id });

        const transporter = createTransporter();
        const textMessage = `Password has been changed`;
        const htmlMessage = `<p>You changed your password.</p><p>You can now login with your new password</p>`;

        const mailOptions = createMailOptions(
            user.email,
            'Password Changed',
            textMessage,
            htmlMessage
        );

        await transporter.sendMail(mailOptions);

        res.status(200).json({ msg: 'Password changed successfully', status: true });

    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log("Error in Reset Password: ", error.message);
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

// Passport 

// to export files
module.exports = { signup, login, logout, verify, forgotpass, resetpass };
