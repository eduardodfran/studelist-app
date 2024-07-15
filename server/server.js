const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const authAPI = require('../api/auth'); // Auth API
const accountContainerAPI = require('../api/account-container'); // Profile API
const notesAPI = require('../api/notes'); // Notes API
const todoAPI = require('../api/todo'); // Todo API
const eventsAPI = require('../api/events'); // Events API
const profileAPI = require('../api/profile'); // Profile API
const chatAPI = require('../api/chat'); // Chatbot API

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/api/auth', authAPI);
app.use('/api/account-container', accountContainerAPI);
app.use('/api/notes', notesAPI);
app.use('/api/todo', todoAPI);
app.use('/api/events', eventsAPI);
app.use('/api/profile', profileAPI);
app.use('/api/chat', chatAPI); // Add chatbot API

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

