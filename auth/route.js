// to install or import npm packages or files
const express = require('express');
const { signup, login, logout } = require('./controller');

const router = express.Router();

router.post('/signup', signup);// for user to user
router.post('/login', login); // for user to login
router.post('/logout', logout); // to logout

module.exports = router;