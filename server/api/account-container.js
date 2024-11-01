const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/verifyToken');

// Endpoint to get user profile
const jwtSecret = process.env.JWT_SECRET || 'wakinjwt'; // Make sure to define this securely

router.get('/', verifyToken, async (req, res) => {
    try {
        const { id } = req.user; // Assumes verifyToken middleware attaches user data to `req.user`
        const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
        
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const user = users[0];
        
        res.status(200).json({
            success: true,
            user: {
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                profile_picture: user.profile_picture,
            }
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ success: false, message: 'Error fetching user profile' });
    }
});

module.exports = router;
