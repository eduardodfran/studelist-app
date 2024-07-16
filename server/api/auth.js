const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../db'); // Import the query function from db.js
const router = express.Router();
const jwtSecret = 'your_jwt_secret'; // Replace with your actual JWT secret

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
    const { firstName, lastName, dob, username, email, password } = req.body;

    try {
        // Validate required fields
        if (!firstName || !lastName || !dob || !username || !email || !password) {
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }

        // Check if username or email already exists
        const [existingUser] = await query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email]);

        if (existingUser.length > 0) {
            return res.status(400).json({ success: false, message: 'Username or email already exists' });
        }

        // Hash password before storing in database
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user into database
        await query('INSERT INTO users (first_name, last_name, dob, username, email, password) VALUES (?, ?, ?, ?, ?, ?)', [firstName, lastName, dob, username, email, hashedPassword]);

        res.status(201).json({ success: true, message: 'User registered successfully' });
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ success: false, message: 'Error signing up. Please try again later.' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [user] = await query('SELECT * FROM users WHERE email = ?', [email]);

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid email or password' });
        }

        const userData = user[0];
        const isMatch = await bcrypt.compare(password, userData.password);

        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: userData.id }, jwtSecret, { expiresIn: '1h' });

        // Determine which webpage to redirect based on user data (example: username or role-based)
        let redirectUrl = 'main.html'; // Default redirection URL

        // Customize redirect based on user data (e.g., username or role)
        // Example: if (userData.username === 'clientA') { redirectUrl = 'clientA.html'; }

        // Send response with token and redirect URL
        res.status(200).json({ success: true, token, redirectUrl, message: 'Logged in successfully' });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ success: false, message: 'Error logging in. Please try again later.' });
    }
});

module.exports = router;
