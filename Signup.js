const express = require('express');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const nodemailer = require('nodemailer');
const db = require('./database');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

router.post('/signup', async (req, res) => {
    const { email, username, password } = req.body; 
    if (!email || !username || !password) {
        return res.status(400).json({ message: 'Fill out all fields' });
    }

    try {
        // Check if the email or username already exists
        const checkQuery = 'SELECT * FROM users WHERE email = ? OR username = ?';
        db.get(checkQuery, [email, username], async (err, row) => {
            if (err) {
                return res.status(500).json({ message: 'Database error', error: err.message });
            }

            if (row) {
                if (row.email === email) {
                    return res.status(400).json({ message: 'Email is associated with another account.' });
                }
                if (row.username === username) {
                    return res.status(400).json({ message: 'Username already exists.' });
                }
            }

            
            const hashedPassword = await bcrypt.hash(password, 10);
            const userID = uuidv4();
            const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();

            // Insert the new user into the database
            db.run(
                'INSERT INTO users (id, email, username, password, verification_code, verified) VALUES (?, ?, ?, ?, ?, 0)',
                [userID, email, username, hashedPassword, verificationCode],
                async (err) => {
                    if (err) {
                        return res.status(500).json({ message: 'Error registering user', error: err.message });
                    }

                    // Send verification email
                    await transporter.sendMail({
                        to: email,
                        subject: 'Verify your account',
                        text: `Your verification code for TalentQ registered account is ${verificationCode}`,
                    });

                    
                    res.status(201).json({ message:' Email sent to ${email}' });
                }
            );
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;