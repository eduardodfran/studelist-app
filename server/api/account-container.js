const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');

// Endpoint to get user profile
const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret'; // Make sure to define this securely

router.get('/', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { id } = jwt.verify(token, jwtSecret);
        const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
        
        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
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
        res.status(500).json({ error: 'Error fetching user profile' });
    }
});

module.exports = router;

