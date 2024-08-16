// to install or import npm packages or files
const express = require('express');
const { signup, login, logout, verifypass } = require('./controller');

const router = express.Router();

router.post('/signup', signup);// for user to user
router.post('/login', login); // for user to login
router.post('/logout', logout); // to logout
router.post('/verify', verifypass); // verify user 

module.exports = router;