// to install or import npm packages or files
const express = require('express');
const { usersignup } = require('./controller');

const router = express.Router();

router.post('/signup', usersignup); // for user to sign

module.exports = router;