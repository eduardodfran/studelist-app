const express = require('express');
const router = express.Router();
const pool = require('../db');
const verifyToken = require('../middleware/verifyToken');

// Get all todos for a user
router.get('/', verifyToken, async (req, res) => {
    try {
        const userId = req.userId; // Assuming verifyToken middleware sets req.userId
        const [todos] = await pool.query('SELECT * FROM todo WHERE user_id = ?', [userId]);
        res.status(200).json({ success: true, todos });
    } catch (error) {
        console.error('Error fetching todos:', error);
        res.status(500).json({ success: false, message: 'Error fetching todos' });
    }
});

// Create a new todo
router.post('/', verifyToken, async (req, res) => {
    const { task } = req.body;
    const userId = req.userId;

    if (!task) {
        return res.status(400).json({ success: false, message: 'Task is required' });
    }

    try {
        await pool.query('INSERT INTO todo (user_id, task) VALUES (?, ?)', [userId, task]);
        res.status(201).json({ success: true, message: 'Task created successfully' });
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ success: false, message: 'Error creating task' });
    }
});

// Update task completion status
router.put('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { completed } = req.body;
    const userId = req.userId;

    try {
        const [result] = await pool.query('UPDATE todo SET completed = ? WHERE id = ? AND user_id = ?', [completed, id, userId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }
        res.status(200).json({ success: true, message: 'Task updated successfully' });
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ success: false, message: 'Error updating task' });
    }
});

// Fetch summarized todos data for the dashboard
router.get('/summary', verifyToken, async (req, res) => {
    const userId = req.userId;
    try {
        const [rows] = await pool.query('SELECT id, task, completed FROM todo WHERE user_id = ?', [userId]);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching todos summary:', err);
        res.status(500).json({ error: 'Failed to fetch todos summary' });
    }
});

module.exports = router;
