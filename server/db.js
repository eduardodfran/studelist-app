const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = {
    query: async function(sql, values) {
        try {
            const connection = await pool.getConnection();
            try {
                // Ensure values is an array and contains only the values we want
                const sanitizedValues = Array.isArray(values) ? values : [values];
                console.log('Executing query:', sql, 'with values:', sanitizedValues);
                
                const [results] = await connection.query(sql, sanitizedValues);
                return [results];
            } finally {
                connection.release();
            }
        } catch (error) {
            console.error('Database query error:', error);
            throw error;
        }
    }
};