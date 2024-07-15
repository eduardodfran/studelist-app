// routes/chat.ts

import express from 'express';
import { SessionsClient } from '@google-cloud/dialogflow';
import pool from '../server/db'; // Assuming you have a MySQL pool configured in db.js

const router = express.Router();
const projectId = 'your-project-id'; // Replace with your Dialogflow Project ID
const sessionClient = new SessionsClient();
const sessionPath = sessionClient.sessionPath(projectId, 'unique-session-id');

router.post('/query', async (req, res) => {
  const { message } = req.body;
  const userId = 'replace-with-user-id'; // Get user ID from session or authentication

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: message,
        languageCode: 'en-US',
      },
    },
  };

  try {
    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;

    // Handle fulfillment if required
    if (result.intent.isFallback) {
      res.json({ message: "I'm sorry, I didn't quite get that." });
    } else {
      const intentName = result.intent.displayName;
      const responseMap: { [key: string]: Function } = {
        'CheckMeetingToday': handleCheckMeetingToday,
        'CheckTodoList': handleCheckTodoList,
        'CheckNotes': handleCheckNotes,
        'ListNotes': handleListNotes,
        'CheckUpcomingEvents': handleCheckUpcomingEvents,
        'CheckFinishedEvents': handleCheckFinishedEvents,
      };

      const handleResponse = responseMap[intentName];
      if (handleResponse) {
        const response = await handleResponse(result, userId);
        res.json(response);
      } else {
        res.json({ message: result.fulfillmentText });
      }
    }
  } catch (error) {
    console.error('Error querying Dialogflow:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

async function handleCheckMeetingToday(result: any, userId: string) {
  const today = new Date().toISOString().slice(0, 10);
  const [rows] = await pool.query('SELECT * FROM events WHERE user_id = ? AND date = ?', [userId, today]);

  if (rows.length > 0) {
    const eventNames = rows.map((event: any) => event.title).join(', ');
    return { message: `Yes, you have the following events today: ${eventNames}` };
  } else {
    return { message: `No, you don't have any events scheduled for today.` };
  }
}

// Add other handlers for different intents similarly...

export default router;
