const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('../routes/auth'); // Auth routes
const accountContainerRoutes = require('../routes/account-container'); // Profile routes
const notesRoutes = require('../routes/notes'); // Notes routes
const todoRoutes = require('../routes/todo'); // Todo routes
const eventsRoutes = require('../routes/events'); // Events routes
const profileRoutes = require('../routes/profile'); // Profile routes
const chatRoutes = require('../routes/chat'); // Chatbot routes

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/api/account-container', accountContainerRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/todo', todoRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/chat', chatRoutes); // Add chatbot routes

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
