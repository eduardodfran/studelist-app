const express = require('express');
const router = express.Router();
const dialogflow = require('dialogflow');
const pool = require('../db');
const verifyToken = require('../middleware/verifyToken');

// Dialogflow configuration
const projectId = 'studelist-odeb'; // Replace with your Dialogflow Project ID
const languageCode = 'en-US'; // Language code

// Create a new session client
const sessionClient = new dialogflow.SessionsClient();

// Route to handle user queries and respond from database
router.post('/query', verifyToken, async (req, res) => {
  const { message } = req.body;
  const userId = req.userId; // Get user ID from session or authentication

  // Construct request for Dialogflow
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: message,
        languageCode: languageCode,
      },
    },
  };

  try {
    // Send request to Dialogflow
    const [response] = await sessionClient.detectIntent(request);
    const result = response.queryResult;

    // Handle fulfillment if required
    if (result.intent.displayName === 'ListNotes') {
      const notesResponse = await handleListNotes(userId);
      res.json(notesResponse);
    } else {
      // Handle other intents or fallbacks
      res.json({ message: JSON.stringify(result.fulfillmentText) });
    }
  } catch (error) {
    console.error('Error querying Dialogflow:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

async function handleListNotes(userId) {
  try {
    // Query database to fetch notes for the user
    const [rows] = await pool.query('SELECT title FROM notes WHERE user_id = ?', [userId]);

    if (rows.length > 0) {
      const noteTitles = rows.map(note => note.title).join(', ');
      return { message: `Your notes include: ${noteTitles}` };
    } else {
      return { message: "You don't have any notes." };
    }
  } catch (error) {
    console.error('Error fetching notes:', error);
    return { message: 'Failed to fetch notes.' };
  }
}

module.exports = router;
