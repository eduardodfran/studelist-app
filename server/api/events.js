const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/verifyToken');

// Get all events for a user
router.get('/', verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        console.log('Fetching events for user ID:', userId);

        const [events] = await db.query(
            'SELECT * FROM events WHERE user_id = ? ORDER BY date ASC, time ASC',
            [userId]
        );

        console.log('Events from database:', events);
        
        // Format dates for Manila timezone
        const formattedEvents = events.map(event => {
            const date = new Date(event.date);
            date.setHours(date.getHours() + 8); // Adjust for Manila timezone
            
            return {
                ...event,
                date: date.toISOString().split('T')[0],
                time: event.time.slice(0, 8)
            };
        });
        
        console.log('Formatted events:', formattedEvents);
        res.json({ success: true, events: formattedEvents });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ success: false, message: 'Error fetching events' });
    }
});

// Create a new event
router.post('/', verifyToken, async (req, res) => {
    try {
        const { title, description, date, location, time, category } = req.body;
        const userId = req.userId;

        // Store the date in UTC
        const eventDate = new Date(date);
        const formattedDate = eventDate.toISOString().split('T')[0];

        console.log('Creating event with data:', {
            userId,
            title,
            description,
            date: formattedDate,
            location,
            time,
            category
        });

        if (!userId) {
            console.error('No user ID found');
            return res.status(401).json({ 
                success: false, 
                message: 'User not authenticated' 
            });
        }

        const [result] = await db.query(
            'INSERT INTO events (user_id, title, description, date, location, time, category) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId, title, description || null, formattedDate, location || null, time, category || 'other']
        );

        res.status(201).json({ 
            success: true, 
            message: 'Event created successfully',
            eventId: result.insertId
        });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error creating event',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Update an event
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, date, location, time, category } = req.body;
        const userId = req.userId;

        const [result] = await db.query(
            'UPDATE events SET title = ?, description = ?, date = ?, location = ?, time = ?, category = ? WHERE id = ? AND user_id = ?',
            [title, description || null, date, location || null, time, category || 'other', id, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        res.json({ success: true, message: 'Event updated successfully' });
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ success: false, message: 'Error updating event' });
    }
});

// Delete an event
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;  // Changed from req.user.id

        console.log('Deleting event:', { id, userId });

        const [result] = await db.query(
            'DELETE FROM events WHERE id = ? AND user_id = ?',
            [id, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        res.json({ success: true, message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ success: false, message: 'Error deleting event' });
    }
});

module.exports = router;