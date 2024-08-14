const User = require('../user/model');
const Auth = require('./model');

//Signup User
const usersignup = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = await User.findOne({ $or: [{ username }] }); // find user by username 

        if (user) {
            return res.status(400).json({ message: 'User exists' }); // can't have the same with other user
        }

        const newUser = new User({ // to create user
            username,
            email,
            password
        });

        const auth = new Auth({
            userId: newUser._id,
            password
        });


        await newUser.save();// is saved in the database
        await auth.save();

        res.status(201).json({ // if registered will show the following as the output
            newUser
        });
    } catch (error) {
        // if there is error
        console.error('Error in signup:', error);
        res.status(500).json({ message: error.message });
    }
};

// to export files
module.exports = { usersignup };
