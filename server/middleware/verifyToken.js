const jwt = require('jsonwebtoken');
const jwtSecret = 'your_jwt_secret'; // Define securely

function verifyToken(req, res, next) {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ success: false, message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token.split(' ')[1], jwtSecret);
        req.userId = decoded.id;
        next();
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to authenticate token' });
    }
}

module.exports = verifyToken;
