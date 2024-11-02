const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const cors = require('cors')
const { query } = require('../db') // Import the query function from db.js
const passport = require('passport')
const router = express.Router()
const jwtSecret = process.env.JWT_SECRET || 'wakinjwt' // Replace with your actual JWT secret

router.get('/test', (req, res) => {
  res.json({ message: 'Auth router is working' })
})

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { firstName, lastName, dob, username, email, password } = req.body;

  try {
      // Validate required fields
      if (!firstName || !lastName || !dob || !username || !email || !password) {
          return res.status(400).json({
              success: false,
              message: 'All fields are required.'
          });
      }

      // Check if username or email already exists
      const [existingUsers] = await query(
          'SELECT username, email FROM users WHERE username = ? OR email = ?',
          [username, email]
      );

      if (existingUsers.length > 0) {
          const existing = existingUsers[0];
          if (existing.username === username) {
              return res.status(400).json({
                  success: false,
                  message: 'Username is already taken'
              });
          }
          if (existing.email === email) {
              return res.status(400).json({
                  success: false,
                  message: 'Email is already registered'
              });
          }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new user
      const [result] = await query(
          `INSERT INTO users (
              first_name, 
              last_name, 
              dob, 
              username, 
              email, 
              password,
              bio,
              social_links,
              additional_info,
              profile_picture
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
              firstName,
              lastName,
              dob,
              username,
              email,
              hashedPassword,
              '', // default empty bio
              '', // default empty social_links
              '', // default empty additional_info
              null // default null profile_picture
          ]
      );

      console.log('User registered successfully:', {
          id: result.insertId,
          username,
          email
      });

      res.status(201).json({
          success: true,
          message: 'User registered successfully'
      });

  } catch (error) {
      console.error('Error during signup:', error);
      
      // Handle specific MySQL errors
      if (error.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({
              success: false,
              message: 'Username or email already exists'
          });
      }

      res.status(500).json({
          success: false,
          message: 'Error signing up. Please try again later.'
      });
  }
});

// POST /api/auth/login
// POST /api/auth/login
router.post('/login', async (req, res) => {
  console.log('Login endpoint hit')
  const { email, password } = req.body

  try {
    const [users] = await query('SELECT * FROM users WHERE email = ?', [email])

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      })
    }

    const user = users[0]
    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      })
    }

    // Include the user ID in the token payload
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      jwtSecret,
      { expiresIn: '24h' }
    )

    console.log('Generated token payload:', {
      id: user.id,
      email: user.email,
    })

    console.log('User logged in:', { id: user.id, email: user.email })

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
      },
    })
  } catch (error) {
    console.error('Error during login:', error)
    res.status(500).json({
      success: false,
      message: 'Error logging in. Please try again later.',
    })
  }
})

router.get('/verify', async (req, res) => {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized' })
  }

  try {
    jwt.verify(token, jwtSecret)
    res.status(200).json({ success: true, message: 'Token verified' })
  } catch (error) {
    console.error('Error verifying token:', error.message)
    res
      .status(401)
      .json({ success: false, message: 'Invalid or expired token' })
  }
})

router.get('/google', passport.authenticate('google', { 
  scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar']
}));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login.html' }),
  async (req, res) => {
      try {
          const token = jwt.sign({ 
              id: req.user.id,
              googleAccessToken: req.authInfo.accessToken // Store Google access token
          }, jwtSecret, {
              expiresIn: '1h',
          });

          res.redirect(`/main.html?token=${token}`);
      } catch (error) {
          console.error('Error in Google callback:', error);
          res.redirect('/login.html');
      }
  }
);

router.get('/logout', (req, res) => {
  res.clearCookie('token')
  req.logout()
  res.redirect('/')
})

router.get('/calendar-token', async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
      const decoded = jwt.verify(token, jwtSecret);
      if (decoded.googleAccessToken) {
          res.json({ 
              success: true, 
              accessToken: decoded.googleAccessToken 
          });
      } else {
          res.status(401).json({ 
              success: false, 
              message: 'No Google access token found' 
          });
      }
  } catch (error) {
      console.error('Error getting calendar token:', error);
      res.status(401).json({ 
          success: false, 
          message: 'Invalid or expired token' 
      });
  }
});

module.exports = router
