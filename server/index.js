const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

const authAPI = require('./api/auth');
const accountContainerAPI = require('./api/account-container');
const notesAPI = require('./api/notes');
const todoAPI = require('./api/todo');
const eventsAPI = require('./api/events');
const profileAPI = require('./api/profile');
const chatAPI = require('./api/chat');

app.use(cors());
app.use(bodyParser.json());

app.use('/api/auth', authAPI);
app.use('/api/account-container', accountContainerAPI);
app.use('/api/notes', notesAPI);
app.use('/api/todo', todoAPI);
app.use('/api/events', eventsAPI);
app.use('/api/profile', profileAPI);
app.use('/api/chat', chatAPI);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

