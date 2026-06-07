const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// @route   POST /api/auth/register
// @desc    Register a new employee or admin account
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // 1. Validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide name, email, and password.' });
        }

        // 2. Check for duplicate user
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'A user with this email already exists.' });
        }

        // 3. Hash the password securely
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Save to Local Database
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'Employee'
        });

        await newUser.save();

        res.status(201).json({
            message: 'User registered successfully!',
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error('Registration Error:', error.message);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
});


const jwt = require('jsonwebtoken'); // Ensure this is imported at the top or here

// @route   POST /api/auth/login
// @desc    Authenticate user & return JWT token
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Validation Check
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide both email and password.' });
        }

        // 2. Locate User Record
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' }); // Masked reason for security
        }

        // 3. Status Check (Is account active?)
        if (!user.isActive) {
            return res.status(403).json({ message: 'Your account has been deactivated by an Administrator.' });
        }

        // 4. Cryptographic Password Comparison
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // 5. Generate JSON Web Token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' } // Token expires automatically in 24 hours
        );

        // 6. Respond with Session Token and User Attributes
        res.status(200).json({
            message: 'Login successful!',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login API Error:', error.message);
        res.status(500).json({ message: 'Internal Server Error. Login failed.' });
    }
});
module.exports = router;