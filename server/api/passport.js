// File: passport.js

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcryptjs');
const { query } = require('./db'); // Import the query function from db.js

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,  // Use environment variable
    clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Use environment variable
    callbackURL: process.env.GOOGLE_CALLBACK_URL // Use environment variable
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
            return done(null, existingUser[0]);
        } else {
            const [result] = await query('INSERT INTO users (first_name, last_name, dob, username, email, password) VALUES (?, ?, ?, ?, ?, ?)', 
                [firstName, lastName, dob, username, email, defaultPassword]);

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
}));

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
