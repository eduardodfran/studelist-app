const mysql = require('mysql2/promise');

// Update these values with your remote database credentials
const pool = mysql.createPool({
    host: process.env.DB_HOST,       // Remote database host
    user: process.env.DB_USER,       // Database user
    password: process.env.DB_PASSWORD, // Database password
    database: process.env.DB_NAME,    // Database name
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = {
    query: async function(sql, values) {
        const connection = await pool.getConnection();
        try {
            return await connection.query(sql, values);
        } finally {
            connection.release();
        }
    }
};
