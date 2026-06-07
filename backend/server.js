const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables (passwords, port numbers)
dotenv.config();

const app = express();

// Middleware (The bouncers and configuration helpers)
app.use(cors()); // Allows frontend to communicate with backend
app.use(express.json()); // Allows backend to read JSON incoming data objects

// A simple test route to ensure the server works
app.get('/', (req, res) => {
    res.send('Attendance System Backend API is running smoothly.');
});

// Define the port number and start the server engine
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is officially breathing on port ${PORT}`);
});