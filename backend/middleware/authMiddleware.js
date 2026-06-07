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

// Middleware to restrict route access based on user roles
const restrictTo = (...allowedRoles) => {
    return (req, res, next) => {
        // Guard: Ensure user object exists (protect middleware must run before this)
        if (!req.user) {
            return res.status(500).json({ message: 'Authorization error. User identity missing.' });
        }

        // Check if the user's role is included in the allowed roles array
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `Access denied. Role '${req.user.role}' is not authorized to access this resource.` 
            });
        }

        // User is authorized, proceed to the controller logic
        next();
    };
};

// Update exports to include the new restriction guard
module.exports = { protect, restrictTo };