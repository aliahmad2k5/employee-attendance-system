const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const { protect } = require('../middleware/authMiddleware');

// Helper function to get today's date format in local time (YYYY-MM-DD)
const getTodayDateString = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localToday = new Date(today.getTime() - (offset * 60 * 1000));
    return localToday.toISOString().split('T')[0];
};

// @route   POST /api/attendance/checkin
// @desc    Record daily clock-in event
// @access  Private (Requires JWT token)
router.post('/checkin', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const todayStr = getTodayDateString();

        // 1. Guard Clause: Prevent double check-in on the same day
        const alreadyCheckedIn = await Attendance.findOne({ user: userId, date: todayStr });
        if (alreadyCheckedIn) {
            return res.status(400).json({ message: 'You have already checked in for today.' });
        }

        // 2. Instantiate and persist new daily record
        const newRecord = new Attendance({
            user: userId,
            date: todayStr,
            checkIn: new Date(),
            status: 'Present'
        });

        await newRecord.save();
        res.status(201).json({ message: 'Checked in successfully!', attendance: newRecord });

    } catch (error) {
        console.error('Check-in Error:', error.message);
        res.status(500).json({ message: 'Internal Server Error during check-in.' });
    }
});

// @route   POST /api/attendance/break-start
// @desc    Initiate an employee break interval
// @access  Private
router.post('/break-start', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const todayStr = getTodayDateString();

        const record = await Attendance.findOne({ user: userId, date: todayStr });
        if (!record) {
            return res.status(404).json({ message: 'No attendance record found for today. Check in first.' });
        }

        if (record.status === 'On Break') {
            return res.status(400).json({ message: 'You are already on a break.' });
        }
        if (record.status === 'Checked Out') {
            return res.status(400).json({ message: 'Cannot start a break after checking out.' });
        }

        // Append new break interval and mutate status
        record.breaks.push({ start: new Date() });
        record.status = 'On Break';

        await record.save();
        res.status(200).json({ message: 'Break started successfully.', attendance: record });

    } catch (error) {
        console.error('Break Start Error:', error.message);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
});

// @route   POST /api/attendance/break-end
// @desc    Terminate the active break interval
// @access  Private
router.post('/break-end', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const todayStr = getTodayDateString();

        const record = await Attendance.findOne({ user: userId, date: todayStr });
        if (!record) {
            return res.status(404).json({ message: 'No attendance record found for today.' });
        }

        if (record.status !== 'On Break') {
            return res.status(400).json({ message: 'You do not have an active break session running.' });
        }

        // Locate the active open break block and stamp the end time
        const activeBreak = record.breaks.find(b => !b.end);
        if (activeBreak) {
            activeBreak.end = new Date();
        }

        record.status = 'Present';
        await record.save();

        res.status(200).json({ message: 'Break ended successfully.', attendance: record });

    } catch (error) {
        console.error('Break End Error:', error.message);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
});

// @route   POST /api/attendance/checkout
// @desc    Record daily clock-out event
// @access  Private
router.post('/checkout', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const todayStr = getTodayDateString();

        const record = await Attendance.findOne({ user: userId, date: todayStr });
        if (!record) {
            return res.status(404).json({ message: 'No attendance record found for today. You never checked in.' });
        }

        if (record.status === 'Checked Out') {
            return res.status(400).json({ message: 'You have already checked out for today.' });
        }

        // Guard: If employee checks out while on a break, close the break automatically
        if (record.status === 'On Break') {
            const activeBreak = record.breaks.find(b => !b.end);
            if (activeBreak) activeBreak.end = new Date();
        }

        record.checkOut = new Date();
        record.status = 'Checked Out';

        await record.save();
        res.status(200).json({ message: 'Checked out successfully!', attendance: record });

    } catch (error) {
        console.error('Check-out Error:', error.message);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
});

// @route   GET /api/attendance/history
// @desc    Retrieve personal attendance history logs with calculated net working hours
// @access  Private (Requires JWT token)
router.get('/history', protect, async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch all logs for the authenticated user, sorted from newest to oldest
        const history = await Attendance.find({ user: userId }).sort({ date: -1 });

        // Map through records and compute working durations dynamically
        const processedHistory = history.map(record => {
            let totalWorkMilliseconds = 0;

            // Only calculate if the user has checked out
            if (record.checkIn && record.checkOut) {
                const totalShiftTime = new Date(record.checkOut) - new Date(record.checkIn);
                
                // Calculate total duration spent on breaks
                let totalBreakTime = 0;
                record.breaks.forEach(b => {
                    if (b.start && b.end) {
                        totalBreakTime += (new Date(b.end) - new Date(b.start));
                    }
                });

                // Net Working Time = Gross Shift Time minus Break Deductions
                totalWorkMilliseconds = totalShiftTime - totalBreakTime;
                if (totalWorkMilliseconds < 0) totalWorkMilliseconds = 0; // Prevent negative edge cases
            }

            // Convert milliseconds into readable floating point hours (e.g., 7.50)
            const calculatedHours = (totalWorkMilliseconds / (1000 * 60 * 60)).toFixed(2);

            return {
                _id: record._id,
                date: record.date,
                status: record.status,
                checkIn: record.checkIn,
                checkOut: record.checkOut || null,
                breaks: record.breaks,
                workingHours: parseFloat(calculatedHours)
            };
        });

        res.status(200).json({ count: processedHistory.length, logs: processedHistory });

    } catch (error) {
        console.error('History Retrieval Error:', error.message);
        res.status(500).json({ message: 'Internal Server Error retrieving attendance history.' });
    }
});

module.exports = router;