const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is mandatory'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is mandatory'],
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'Password is mandatory']
    },
    role: {
        type: String,
        enum: ['Employee', 'Admin'],
        default: 'Employee'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true // Automatically handles createdAt and updatedAt
});

module.exports = mongoose.model('User', UserSchema);