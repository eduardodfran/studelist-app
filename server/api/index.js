// index.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const passport = require('./passport');
const helmet = require('helmet');
const compression = require('compression');
const authAPI = require('./auth');
const accountContainerAPI = require('./account-container');
const path = require('path');
require('dotenv').config();

const app = express();

// CORS configuration
const allowedOrigins = ['http://localhost:3000', 'https://studelist-app-frontend.vercel.app'];
app.use(cors({ origin: allowedOrigins, credentials: true }));

// Security headers with Helmet
app.use(helmet());

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session management
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, maxAge: 3600000 } // 1 hour
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/auth', authAPI);
app.use('/api/account-container', accountContainerAPI);

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
