const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// @route   POST /api/auth/register
// @desc    Register a new employee or admin account
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide name, email, and password.' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'A user with this email already exists.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

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

// @route   POST /api/auth/login
// @desc    Authenticate user & return JWT token
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide both email and password.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        if (!user.isActive) {
            return res.status(403).json({ message: 'Your account has been deactivated by an Administrator.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

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

// @route   PATCH /api/auth/users/:id/status
// @desc    Toggle user active status
// @access  Private (Admin Only)
router.patch('/users/:id/status', protect, restrictTo('Admin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        user.isActive = !user.isActive;
        await user.save();
        res.json({ message: 'Status updated', isActive: user.isActive });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;