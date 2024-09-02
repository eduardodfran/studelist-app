const express = require('express');
const app = express();

// Mock data - replace with actual database queries
const notes = [
  { content: 'Finish math homework' },
  { content: 'Study for science test' }
];

const todoItems = [
  { task: 'Buy groceries' },
  { task: 'Clean the room' }
];

const events = [
  { title: 'Math Exam', date: '2023-07-15', location: 'Room 101' },
  { title: 'Science Fair', date: '2023-07-20', location: 'School Auditorium' }
];

app.get('/api/notes', (req, res) => {
  res.json({ notes });
});

app.get('/api/todo', (req, res) => {
  res.json({ todoItems });
});

app.get('/api/events', (req, res) => {
  res.json({ events });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
