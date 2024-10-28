const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET || 'wakinjwt';

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];

    // Check if the authorization header is present and starts with 'Bearer'
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({ success: false, message: 'No token provided or incorrect format' });
    }

    const token = authHeader.split(' ')[1]; // Extract token after 'Bearer '

    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.user = decoded; 
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        // Check for specific error type (e.g., TokenExpiredError, JsonWebTokenError)
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Token expired' });
        }
        console.error('Token verification error:', error);
        return res.status(403).json({ success: false, message: 'Failed to authenticate token' });
    }
}

module.exports = verifyToken;
