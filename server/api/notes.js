const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/verifyToken');

// Get all notes for a user
router.get('/', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        console.log('Fetching notes for user ID:', userId);

        const [notes] = await db.query(`
            SELECT * FROM notes 
            WHERE user_id = ? 
            ORDER BY created_at DESC
        `, [userId]);

        res.json({
            success: true,
            notes: notes
        });
    } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching notes',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Create a new note
router.post('/', verifyToken, async (req, res) => {
    try {
        const { title, content, folder } = req.body;
        const userId = req.user.id;

        if (!title) {
            return res.status(400).json({
                success: false,
                message: 'Title is required'
            });
        }

        const [result] = await db.query(
            'INSERT INTO notes (user_id, title, content, folder) VALUES (?, ?, ?, ?)',
            [userId, title, content, folder]
        );

        res.status(201).json({
            success: true,
            message: 'Note created successfully',
            noteId: result.insertId
        });
    } catch (error) {
        console.error('Error creating note:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating note',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Update a note
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, folder } = req.body;
        const userId = req.user.id;

        if (!title) {
            return res.status(400).json({
                success: false,
                message: 'Title is required'
            });
        }

        const [result] = await db.query(
            'UPDATE notes SET title = ?, content = ?, folder = ? WHERE id = ? AND user_id = ?',
            [title, content, folder, id, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Note not found or unauthorized'
            });
        }

        res.json({
            success: true,
            message: 'Note updated successfully'
        });
    } catch (error) {
        console.error('Error updating note:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating note',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Delete a note
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const [result] = await db.query(
            'DELETE FROM notes WHERE id = ? AND user_id = ?',
            [id, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Note not found or unauthorized'
            });
        }

        res.json({
            success: true,
            message: 'Note deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting note',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get a single note
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const [notes] = await db.query(
            'SELECT * FROM notes WHERE id = ? AND user_id = ?',
            [id, userId]
        );

        if (notes.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Note not found or unauthorized'
            });
        }

        res.json({
            success: true,
            note: notes[0]
        });
    } catch (error) {
        console.error('Error fetching note:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching note',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get notes by folder
router.get('/folder/:folderName', verifyToken, async (req, res) => {
    try {
        const { folderName } = req.params;
        const userId = req.user.id;

        const [notes] = await db.query(
            'SELECT * FROM notes WHERE user_id = ? AND folder = ? ORDER BY created_at DESC',
            [userId, folderName]
        );

        res.json({
            success: true,
            notes: notes
        });
    } catch (error) {
        console.error('Error fetching notes by folder:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching notes by folder',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get all folders for a user
router.get('/folders/all', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const [folders] = await db.query(
            'SELECT DISTINCT folder FROM notes WHERE user_id = ? AND folder IS NOT NULL',
            [userId]
        );

        res.json({
            success: true,
            folders: folders.map(f => f.folder)
        });
    } catch (error) {
        console.error('Error fetching folders:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching folders',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;