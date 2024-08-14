const mongoose = require('mongoose');

const authSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // required: true
    },
    password: {
        type: 'String',
        required: true,
    }
}, { timestamps: true });

module.exports = mongoose.model('Auth', authSchema);