const express = require('express');
const router = express.Router();
const pool = require('../db');
const verifyToken = require('../middleware/verifyToken');

// Get all notes for a user
router.get('/', verifyToken, async (req, res) => {
    try {
        const userId = req.userId; // Assuming verifyToken middleware sets req.userId
        const [notes] = await pool.query('SELECT * FROM notes WHERE user_id = ?', [userId]);
        res.status(200).json({ success: true, notes });
    } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({ success: false, message: 'Error fetching notes' });
    }
});

// Create a new note
router.post('/', verifyToken, async (req, res) => {
    const { title, content } = req.body;
    const userId = req.userId;

    if (!title) {
        return res.status(400).json({ success: false, message: 'Title is required' });
    }

    try {
        await pool.query('INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)', [userId, title, content]);
        res.status(201).json({ success: true, message: 'Note created successfully' });
    } catch (error) {
        console.error('Error creating note:', error);
        res.status(500).json({ success: false, message: 'Error creating note' });
    }
});

// Update a note
router.put('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;
    const userId = req.userId;

    try {
        const [result] = await pool.query('UPDATE notes SET title = ?, content = ? WHERE id = ? AND user_id = ?', [title, content, id, userId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Note not found' });
        } else if (result.message && result.message.includes('Error updating note:')) {
            return res.status(400).json({ success: false, message: result.message.split(':')[1].trim() });
        }
        res.status(200).json({ success: true, message: 'Note updated successfully' });
    } catch (error) {
        console.error('Error updating note:', error);
        res.status(500).json({ success: false, message: 'Error updating note' });
    }
});

// Delete a note
router.delete('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;

    try {
        const [result] = await pool.query('DELETE FROM notes WHERE id = ? AND user_id = ?', [id, userId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Note not found' });
        }
        res.status(200).json({ success: true, message: 'Note deleted successfully' });
    } catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).json({ success: false, message: 'Error deleting note' });
    }
});

// Fetch summarized notes data for the dashboard
router.get('/summary', verifyToken, async (req, res) => {
    const userId = req.userId;
    try {
        const [rows] = await pool.query('SELECT id, title FROM notes WHERE user_id = ?', [userId]);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching notes summary:', err);
        res.status(500).json({ error: 'Failed to fetch notes summary' });
    }
});

module.exports = router;


