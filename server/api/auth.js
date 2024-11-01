const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const cors = require('cors')
const { query } = require('../db') // Import the query function from db.js
const passport = require('passport')
const router = express.Router()
const jwtSecret = process.env.JWT_SECRET || 'wakinjwt' // Replace with your actual JWT secret

const allowedOrigins = [
  'http://localhost:3000',
  'https://studelist-app-frontend.vercel.app',
  'https://studelist-app-api.vercel.app'
];

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}

router.use(cors(corsOptions))

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { firstName, lastName, dob, username, email, password } = req.body

  try {
    if (!firstName || !lastName || !dob || !username || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: 'All fields are required.' })
    }

    const [existingUser] = await query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    )

    if (existingUser.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: 'Username or email already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await query(
      'INSERT INTO users (first_name, last_name, dob, username, email, password) VALUES (?, ?, ?, ?, ?, ?)',
      [firstName, lastName, dob, username, email, hashedPassword]
    )

    res
      .status(201)
      .json({ success: true, message: 'User registered successfully' })
  } catch (error) {
    console.error('Error during signup:', error)
    res.status(500).json({
      success: false,
      message: 'Error signing up. Please try again later.',
    })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  console.log('Login route hit')
  console.log('Request body:', req.body)

  const { email, password } = req.body

  try {
    const [user] = await query('SELECT * FROM users WHERE email = ?', [email])

    if (user.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid email or password' })
    }

    const passwordMatch = await bcrypt.compare(password, user[0].password)

    if (!passwordMatch) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid email or password' })
    }

    const token = jwt.sign({ id: user[0].id }, jwtSecret, { expiresIn: '1h' })

    res.status(200).json({ success: true, message: 'Login successful', token })
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

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
)

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login.html' }),
  (req, res) => {
    try {
      const token = jwt.sign({ userId: req.user.id }, jwtSecret, {
        expiresIn: '1h',
      })
      res.cookie('token', token, {
        httpOnly: true,
        secure: true, 
        sameSite: 'None', 
      })
      res.redirect('https://studelist-app.vercel.app/main.html')
    } catch (error) {
      console.error('Error in Google callback:', error)
      res.redirect('/login.html')
    }
  }
)

router.get('/logout', (req, res) => {
  res.clearCookie('token')
  req.logout()
  res.redirect('/')
})

module.exports = router

