const express = require('express');
const { alluser } = require('./controller');
const { auth, restrict } = require('../middlewares/auth');

const router = express.Router();

router.get('/alluser', auth, restrict('admin'), alluser);

module.exports = router;