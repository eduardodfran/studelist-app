const express = require('express');
const router = express.Router();
const { query } = require('../db');
const verifyToken = require('../middleware/verifyToken');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const fs = require('fs').promises;

// Ensure upload directory exists
const uploadDir = 'uploads/profile-pictures';
fs.mkdir(uploadDir, { recursive: true }).catch(console.error);

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `profile-${req.userId}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only .png, .jpg, .jpeg and .gif formats allowed!'));
    }
});

// GET user profile
router.get('/', verifyToken, async (req, res) => {
    try {
        const [users] = await query(
            `SELECT id, username, email, first_name, last_name, 
            dob, bio, social_links, additional_info, profile_picture 
            FROM users WHERE id = ?`,
            [req.userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = users[0];
        res.json({
            success: true,
            user: {
                ...user,
                password: undefined
            }
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching profile'
        });
    }
});

// PUT update profile
router.put('/', verifyToken, async (req, res) => {
    try {
        const updates = {};
        const allowedFields = ['first_name', 'last_name', 'dob', 'bio', 'social_links', 'additional_info'];
        
        // Build updates object with only allowed fields
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid fields to update'
            });
        }

        // Build dynamic SQL query
        const setClause = Object.keys(updates)
            .map(key => `${key} = ?`)
            .join(', ');
        const values = [...Object.values(updates), req.userId];

        await query(
            `UPDATE users SET ${setClause} WHERE id = ?`,
            values
        );

        // Fetch updated user data
        const [updatedUser] = await query(
            `SELECT id, username, email, first_name, last_name, 
            dob, bio, social_links, additional_info, profile_picture 
            FROM users WHERE id = ?`,
            [req.userId]
        );

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: updatedUser[0]
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while updating profile'
        });
    }
});

// POST upload profile picture
router.post('/upload-picture', verifyToken, upload.single('profile_picture'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        // Delete old profile picture if exists
        const [currentUser] = await query(
            'SELECT profile_picture FROM users WHERE id = ?',
            [req.userId]
        );

        if (currentUser[0].profile_picture) {
            const oldPath = path.join(__dirname, '..', '..', currentUser[0].profile_picture);
            await fs.unlink(oldPath).catch(() => {});
        }

        const profilePicturePath = `/uploads/profile-pictures/${req.file.filename}`;
        
        await query(
            'UPDATE users SET profile_picture = ? WHERE id = ?',
            [profilePicturePath, req.userId]
        );

        res.json({
            success: true,
            message: 'Profile picture updated successfully',
            profilePictureUrl: profilePicturePath
        });
    } catch (error) {
        console.error('Error uploading profile picture:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while uploading profile picture'
        });
    }
});

// PUT change password
router.put('/change-password', verifyToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Input validation
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters long'
            });
        }

        // Get user's current password
        const [users] = await query(
            'SELECT password FROM users WHERE id = ?',
            [req.userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Log for debugging (remove in production)
        console.log('Stored hashed password:', users[0].password);
        console.log('Provided current password:', currentPassword);

        // Compare passwords
        try {
            const isValid = await bcrypt.compare(currentPassword, users[0].password);
            console.log('Password comparison result:', isValid);

            if (!isValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Current password is incorrect'
                });
            }
        } catch (compareError) {
            console.error('Error comparing passwords:', compareError);
            return res.status(500).json({
                success: false,
                message: 'Error verifying current password'
            });
        }

        // Hash new password
        try {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            
            // Update password in database
            await query(
                'UPDATE users SET password = ? WHERE id = ?',
                [hashedPassword, req.userId]
            );

            res.json({
                success: true,
                message: 'Password updated successfully'
            });
        } catch (hashError) {
            console.error('Error hashing new password:', hashError);
            return res.status(500).json({
                success: false,
                message: 'Error updating password'
            });
        }
    } catch (error) {
        console.error('Error in password change route:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while changing password'
        });
    }
});

module.exports = router;