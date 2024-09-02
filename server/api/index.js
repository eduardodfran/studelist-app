const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const passport = require('./passport');
const helmet = require('helmet');
const compression = require('compression');
const authAPI = require('./auth');
const accountContainerAPI = require('./account-container');
const notesAPI = require('./notes');
const todoAPI = require('./todo');
const eventsAPI = require('./events');
const profileAPI = require('./profile');
const chatAPI = require('./chat');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config();

const app = express();

// Define allowed origins
const allowedOrigins = [
  'http://localhost:3000', // Local development
  'https://studelist-app-frontend.vercel.app' // Deployed frontend
];

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) { 
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
  allowedHeaders: ['Content-Type', 'Authorization'], 
  credentials: true 
};

app.use(cors(corsOptions));

// Security headers with Helmet
app.use(helmet());

// Compression middleware
app.use(compression());

// Set CSP headers
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; img-src 'self' data:; script-src 'self'; style-src 'self' 'unsafe-inline';"
  );
  next();
});

// Body parsing middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session management
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true, // Helps prevent cross-site scripting attacks
      maxAge: 3600000 // 1 hour
    }
  })
);

// Serve static files from the 'client/public' directory
app.use(express.static(path.join(__dirname, '..', '..', 'client', 'public')));

// Root route to serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'client', 'public', 'index.html'));
});

// Initialize Passport for authentication
app.use(passport.initialize());
app.use(passport.session());

// API routes
app.use('/api/auth', authAPI);
app.use('/api/account-container', accountContainerAPI);
app.use('/api/notes', notesAPI);
app.use('/api/todo', todoAPI);
app.use('/api/events', eventsAPI);
app.use('/api/profile', profileAPI);
app.use('/api/chat', chatAPI);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'An internal server error occurred' });
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
