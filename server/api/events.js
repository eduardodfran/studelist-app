const express = require('express');
const router = express.Router();
const pool = require('../db');
const verifyToken = require('../middleware/verifyToken');

// Get all events for a user
router.get('/', verifyToken, async (req, res) => {
    try {
        const userId = req.userId; // Assuming verifyToken middleware sets req.userId
        const [events] = await pool.query('SELECT * FROM events WHERE user_id = ?', [userId]);
        res.status(200).json({ success: true, events });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ success: false, message: 'Error fetching events' });
    }
});

// Create a new event
router.post('/', verifyToken, async (req, res) => {
    const { title, description, date, location, time } = req.body;
    const userId = req.userId;

    if (!title || !date || !time) {
        return res.status(400).json({ success: false, message: 'Title, date, and time are required' });
    }

    try {
        await pool.query('INSERT INTO events (user_id, title, description, date, location, time) VALUES (?, ?, ?, ?, ?, ?)', [userId, title, description, date, location, time]);
        res.status(201).json({ success: true, message: 'Event created successfully' });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ success: false, message: 'Error creating event' });
    }
});

// Fetch summarized events data for the dashboard
router.get('/summary', verifyToken, async (req, res) => {
    const userId = req.userId;
    try {
        const [rows] = await pool.query('SELECT id, title, date FROM events WHERE user_id = ?', [userId]);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching events summary:', err);
        res.status(500).json({ error: 'Failed to fetch events summary' });
    }
});

module.exports = router;
