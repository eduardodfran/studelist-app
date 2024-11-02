const express = require('express');
const router = express.Router();
const { query } = require('../db');
const verifyToken = require('../middleware/verifyToken');

// Get dashboard summary
router.get('/summary', verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        console.log('Fetching dashboard summary for user:', userId);

        // Get notes count and recent notes
        const [notes] = await query(
            'SELECT id, title, content FROM notes WHERE user_id = ? ORDER BY created_at DESC LIMIT 5',
            [userId]
        );

        // Get todos count and recent todos (now using status)
        const [todos] = await query(
            'SELECT id, task, status FROM todo WHERE user_id = ? ORDER BY created_at DESC LIMIT 5',
            [userId]
        );

        // Get events count and upcoming events
        const [events] = await query(
            'SELECT id, title, date, time FROM events WHERE user_id = ? AND date >= CURDATE() ORDER BY date ASC, time ASC LIMIT 5',
            [userId]
        );

        res.json({
            success: true,
            summary: {
                notes: {
                    count: notes.length,
                    recent: notes
                },
                todos: {
                    count: todos.length,
                    recent: todos
                },
                events: {
                    count: events.length,
                    upcoming: events
                }
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard summary:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard summary'
        });
    }
});

module.exports = router;