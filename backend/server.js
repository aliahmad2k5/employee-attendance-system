const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// 1. Initialize environment configurations
dotenv.config();

const app = express();

// 2. Setup standard application middleware
app.use(cors());
app.use(express.json());

// 3. Simple health check endpoint
app.get('/', (req, res) => {
    res.status(200).send('Attendance System Backend API is live.');
});

// 4. Connect to MongoDB Atlas with explicit lifecycle logging
console.log('Attempting to bridge network connection to MongoDB Atlas...');

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('======================================================');
        console.log(' SUCCESS: Connected to Local MongoDB Instance!        ');
        console.log('======================================================');
    })
    .catch((error) => {
        console.log('======================================================');
        console.log(' ERROR: Local Database connection failed.             ');
        console.log(' Reason:', error.message);
        console.log('======================================================');
    });

// 5. Fire up the server listener ports
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`[SYSTEM RUNNING]: Server is listening on port ${PORT}`);
});