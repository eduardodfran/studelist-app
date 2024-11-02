const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/verifyToken');

// Get all todos for a user
router.get('/', verifyToken, async (req, res) => {
    try {
        // Extract just the numeric ID
        const userId = parseInt(req.user.id, 10);
        console.log('Fetching todos for user ID:', userId);

        const [todos] = await db.query(
            'SELECT * FROM todo WHERE user_id = ?', 
            [userId]  // Pass as array with single numeric value
        );
        
        console.log('Found todos:', todos);
        res.json({ success: true, todos });
    } catch (error) {
        console.error('Error fetching todos:', error);
        res.status(500).json({ success: false, message: 'Error fetching todos' });
    }
});

// Create a new todo
router.post('/', verifyToken, async (req, res) => {
    try {
        const { task } = req.body;
        const userId = parseInt(req.user.id, 10);

        if (!task) {
            return res.status(400).json({ success: false, message: 'Task is required' });
        }

        const [result] = await db.query(
            'INSERT INTO todo (user_id, task, status) VALUES (?, ?, ?)',
            [userId, task, 'not_started']
        );

        res.status(201).json({ 
            success: true, 
            message: 'Task created successfully',
            todoId: result.insertId
        });
    } catch (error) {
        console.error('Error creating todo:', error);
        res.status(500).json({ success: false, message: 'Error creating todo' });
    }
});

// Update todo status
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user.id;  // Make sure this matches your token payload

        console.log('Updating todo:', { id, status, userId }); // Debug log

        const [result] = await db.query(
            'UPDATE todo SET status = ? WHERE id = ? AND user_id = ?',
            [status, parseInt(id, 10), userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Todo not found' });
        }

        res.json({ success: true, message: 'Todo updated successfully' });
    } catch (error) {
        console.error('Error updating todo:', error);
        res.status(500).json({ success: false, message: 'Error updating todo' });
    }
});

// Delete todo
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = parseInt(req.user.id, 10);

        const [result] = await db.query(
            'DELETE FROM todo WHERE id = ? AND user_id = ?',
            [parseInt(id, 10), userId]  // Pass values as array
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Todo not found' });
        }

        res.json({ success: true, message: 'Todo deleted successfully' });
    } catch (error) {
        console.error('Error deleting todo:', error);
        res.status(500).json({ success: false, message: 'Error deleting todo' });
    }
});



module.exports = router;