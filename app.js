const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');


// Paths of folders and files
const db = require('./config/db');
const authRoute = require('./auth/route');
const userRoute = require('./user/route');

dotenv.config();
db();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(bodyParser.json());

// Use routes
app.use('/api/auth', authRoute);
app.use('/api/user', userRoute);

const port = process.env.PORT || 3000; // port will run only 3000

// To start the file 
app.listen(port, () => console.log(`Server is running at ${port}`));