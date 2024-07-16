const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'studelist',
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
