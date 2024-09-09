const express = require('express');
const { alluser, changestatus, arp, getemail } = require('./controller');
const { auth, restrict } = require('../middlewares/auth');

const router = express.Router();

router.get('/alluser', auth, restrict('admin'), alluser);
router.get('/arp/:status', auth, restrict('admin'), arp);
router.get('/status/:id', auth, restrict('admin'), changestatus);
router.get('/email/:email', auth, restrict('admin'), getemail);

module.exports = router;