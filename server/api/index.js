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
const dashboardAPI = require('./dashboard');


// Load environment variables from .env file
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const app = express();

console.log('Environment loaded:', {
  NODE_ENV: process.env.NODE_ENV,
  DB_HOST: process.env.DB_HOST !== undefined,
  DB_USER: process.env.DB_USER !== undefined,
  JWT_SECRET: process.env.JWT_SECRET !== undefined
});

// Define allowed origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:5500',
  'http://localhost:5500',
  'https://studelist-app-frontend.vercel.app',
  'https://studelist-app.vercel.app',
  'https://studelist-app-api.vercel.app' // Add this line
];

// Update CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
      // For development/debugging
      console.log('Request origin:', origin);

      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) {
          return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
          callback(null, true);
      } else {
          console.log('Origin not allowed:', origin);
          callback(new Error('Not allowed by CORS'));
      }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200 // For legacy browser support
};

// Apply CORS configuration
app.use(cors(corsOptions));

// Add preflight handling
app.options('*', cors(corsOptions));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Debugging middleware
app.use((req, res, next) => {
    console.log('Incoming request:', {
        method: req.method,
        path: req.path,
        origin: req.headers.origin,
        headers: req.headers
    });
    next();
});

// Session management
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'wakinjwt',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 3600000
    }
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());



// Static files
app.use(express.static(path.join(__dirname, '..', '..', 'client', 'public')));

app.use((req, res, next) => {
  console.log('\n=== New Request ===');
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('Origin:', req.headers.origin);
  next();
});

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'client', 'public', 'index.html'));
});

app.get('/api/config', (req, res) => {
  res.json({
      API_URL: process.env.API_URL
  });
});



// API routes
app.use('/api/auth', authAPI);
app.use('/api/account-container', accountContainerAPI);
app.use('/api/notes', notesAPI);
app.use('/api/todo', todoAPI);
app.use('/api/events', eventsAPI);
app.use('/api/profile', profileAPI);
app.use('/api/chat', chatAPI);
app.use('/api/dashboard', dashboardAPI);

app.use((req, res, next) => {
  console.log('Route not found:', req.method, req.path);
  res.status(404).json({ message: 'Route not found' });
});

// Unmatched route handler
app.use((req, res, next) => {
    console.log('No route matched:', req.method, req.url);
    next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'An internal server error occurred' });
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});