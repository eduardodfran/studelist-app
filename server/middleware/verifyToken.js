const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET || 'wakinjwt';

function verifyToken(req, res, next) {
    try {
        const authHeader = req.headers['authorization'];
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(403).json({ 
                success: false, 
                message: 'No token provided or incorrect format' 
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, jwtSecret);
        
        // Set both user object and userId for compatibility
        req.user = decoded;
        req.userId = decoded.id;
        
        console.log('Token verified:', {
            decoded,
            userId: req.userId,
            user: req.user
        });
        
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Token expired' 
            });
        }
        return res.status(500).json({ 
            success: false, 
            message: 'Failed to authenticate token' 
        });
    }
}

module.exports = verifyToken;