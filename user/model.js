// install npm packages
const mongoose = require('mongoose');

// creation of the user
const userSchema = new mongoose.Schema({
    fname: { // First name
        type: String,
        //required: true
    },
    mname: { // Middle name
        type: String
    },
    lname: { // Last name
        type: String
    },
    email: {
        type: String,
        required: true,
        unique: true // email can't be the same with others
    },
    username: {
        type: String,
        //required: true,
        unique: true, // username can't be the same with others
        lowercase: true // username will be in lowercase
    },
    phonenum: {
        type: String
    },
    age: {
        type: Number
    },
    dob: { // Date of Birth
        type: Date
    },
    address: {
        type: String
    },
    gender: {
        type: String
    },
    profilepic: {
        type: String,
        default: ''
    },
    role: {
        type: String,
        enum: ['user', 'admin'], // user has basic access while admin have more
        default: 'user'
    },
    isVerified: {
        type: Boolean,
        default: true // when user is registered will show false untill he verifies his account
    }
}, { timestamps: true }); // timestamps create when the file is created


// export User
module.exports = mongoose.model('Users', userSchema);