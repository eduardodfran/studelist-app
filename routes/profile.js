const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const { authenticateToken } = require('../middleware/verifyToken'); // Example middleware for authentication, adjust as per your setup





// GET user profile
router.get('/', async (req, res) => {
    const userId = req.user.id; // Assuming you extract user ID from authenticated token

    try {
        const [results] = await connection.promise().query('SELECT * FROM users WHERE id = ?', [userId]);
        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.status(200).json({ user: results[0] });
    } catch (err) {
        console.error('Error fetching user profile:', err);
        return res.status(500).json({ error: 'Failed to fetch user profile' });
    }
});

// PUT update user profile
router.put('/', async (req, res) => {
    const userId = req.user.id; // Assuming you extract user ID from authenticated token
    const { first_name, last_name, dob, bio, social_links, additional_info } = req.body;

    try {
        const [results] = await connection.promise().query('UPDATE users SET first_name = ?, last_name = ?, dob = ?, bio = ?, social_links = ?, additional_info = ? WHERE id = ?', 
            [first_name, last_name, dob, bio, social_links, additional_info, userId]);
        
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Fetch updated profile data to send back
        const [updatedResults] = await connection.promise().query('SELECT * FROM users WHERE id = ?', [userId]);
        return res.status(200).json({ user: updatedResults[0], message: 'Profile updated successfully' });
    } catch (err) {
        console.error('Error updating user profile:', err);
        return res.status(500).json({ error: 'Failed to update user profile' });
    }
});

module.exports = router;
