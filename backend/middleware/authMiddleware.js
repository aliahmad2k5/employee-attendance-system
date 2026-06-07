const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
    let token;

    // Check if token exists in the Authorization header (Format: Bearer <token>)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract the token string
            token = req.headers.authorization.split(' ')[1];

            // Verify token signature against secret key
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Inject the authenticated user metadata directly into the request object
            req.user = decoded;

            // Hand execution over to the next controller step
            return next();
        } catch (error) {
            console.error('Token Validation Error:', error.message);
            return res.status(401).json({ message: 'Not authorized. Token verification failed.' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized. No session token provided.' });
    }
};

module.exports = { protect };