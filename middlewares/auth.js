// import packages
const User = require('../user/model');

const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const signToken = id => {
    return jwt.sign({ id }, process.env.jwt_secret, {
        expiresIn: process.env.jwt_expires_in
    });
};

const createSendtoken = (user, res) => {
    const token = signToken(user._id);

    // Set the expiration time in milliseconds
    const expirationTime = new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    );
    const cookieOptions = {
        expires: expirationTime,
        httpOnly: true
    };
    res.cookie('jwt', token, cookieOptions);
    // Return the token 
    return token;
};

const auth = async (req, res, next) => {
    let token;
    try {
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) { // must have any credentials to login 
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) { // when token can't be found
            return res.status(401).json({ msg: 'Unauthorized! You need to loggin', status: false });
        }

        console.log(req.headers);// to get the token
        const decoded = await jwt.verify(token, process.env.jwt_secret) // verify the token

        console.log(decoded); // to get userid
        const user = await User.findById(decoded.id);   // find the user

        if (!user) { // when user can't be found
            return res.status(401).json({ msg: 'Cannot find user', status: false });
        }
        console.log(user);
        req.user = user;
        next();
    } catch (e) {
        console.error(e);
        res.status(400).send({ msg: 'token is not valid', error: e.message });
    }

};

const restrict = (role) => {
    return (req, res, next) => {
        if (req.user.role !== role && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'You dont have access to this file', status: false });
        }
        next();
    }
};

module.exports = { auth, signToken, createSendtoken, restrict };