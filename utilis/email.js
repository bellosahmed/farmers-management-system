const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const createTransporter = () => {
    return nodemailer.createTransport({
        host: 'smtp-mail.outlook.com',
        service: 'outlook',
        port: 465,
        secure: false,
        auth: {
            user: process.env.authemail,
            pass: process.env.authpass,
        },
    });
};

const createMailOptions = (to, subject, text, html) => {
    return {
        from: process.env.authemail,
        to,
        subject,
        text,
        html,
    };
};

module.exports = { createTransporter, createMailOptions };