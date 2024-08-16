// // // import file
// const User = require('./model');

// // Get User Profile
// const getuser = async (req, res) => {
//     const userId = req.params.id; // get user Id
//     try {
//         const user = await User.findById(userId).select('-password'); // find user by id
//         if (!user) { // if no user
//             return res.status(400).json({ message: "User not found", status: false });
//         }
//         // const token = createSendtoken(user, res); // passed the token
//         //console.log(token);
//         res.status(200).json({ status: true, user });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//         console.log('Error in get user profile', message.error)
//     }
// };

// module.exports = { getuser };
