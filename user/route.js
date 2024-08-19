const express = require('express');
const { getuser } = require('./controller');

const router = express.Router();

router.get('/profile/:id', getuser); // for profile

module.exports = router;