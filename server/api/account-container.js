const express = require('express');
const router = express.Router();
const { query } = require('../db');
const verifyToken = require('../middleware/verifyToken');

router.get('/', verifyToken, async (req, res) => {
    try {
        // Debug log the entire request object
        console.log('Request user object:', req.user);
        console.log('Request userId:', req.userId);

        // Get userId from either source
        const userId = req.userId;

        if (!userId) {
            console.error('No user ID found in request');
            return res.status(401).json({ 
                success: false, 
                message: 'User not authenticated' 
            });
        }

        // Query the database
        const [users] = await query(
            'SELECT first_name, last_name, email, profile_picture FROM users WHERE id = ?', 
            [userId]
        );
        
        console.log('Database response:', users);
        
        if (!users || users.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        const user = users[0];
        
        // Send response
        res.status(200).json({
            success: true,
            user: {
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                profile_picture: user.profile_picture
            }
        });
    } catch (error) {
        console.error('Error in account-container route:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching user profile',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;