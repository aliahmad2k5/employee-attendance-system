const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: String, // Stored as "YYYY-MM-DD" to easily filter records by day
        required: true
    },
    checkIn: {
        type: Date,
        required: true
    },
    checkOut: {
        type: Date
    },
    breaks: [
        {
            start: { type: Date },
            end: { type: Date }
        }
    ],
    status: {
        type: String,
        enum: ['Present', 'On Break', 'Checked Out'],
        default: 'Present'
    }
}, {
    timestamps: true
});

// Enforce a compound unique index so a user can only have ONE attendance record document per calendar day
AttendanceSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);