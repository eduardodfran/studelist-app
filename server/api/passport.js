const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET || 'wakinjwt';
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { query } = require('../db'); // Import the query function from db.js

passport.use(new GoogleStrategy({
    clientID: '275123846159-482a1dfcalr0kmj4i7svfsd3r8dlshtk.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: 'https://studelist-app-api.vercel.app/api/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      const username = profile.displayName;
      const firstName = profile.name.givenName;
      const lastName = profile.name.familyName;
      const dob = '1970-01-01'; // Default date of birth
      const defaultPassword = bcrypt.hashSync('default_password', 10);

      const [existingUser] = await query('SELECT * FROM users WHERE email = ?', [email]);

      if (existingUser.length > 0) {
        // User exists, proceed
        return done(null, existingUser[0]);
      } else {
        // Create new user
        const [result] = await query(
          'INSERT INTO users (first_name, last_name, dob, username, email, password) VALUES (?, ?, ?, ?, ?, ?)',
          [firstName, lastName, dob, username, email, defaultPassword]
        );

        const newUser = {
          id: result.insertId,
          first_name: firstName,
          last_name: lastName,
          dob: dob,
          username: username,
          email: email
        };

        return done(null, newUser);
      }
    } catch (error) {
      console.error('Error during Google authentication:', error);
      return done(error);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const [user] = await query('SELECT * FROM users WHERE id = ?', [id]);
    done(null, user[0]);
  } catch (error) {
    done(error);
  }
});

module.exports = passport;
