// Load environment variables from the .env file.
require('dotenv').config();

// Import necessary packages.
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// Import the Mongoose model you created.
const Report = require('./models/Report');

// Configure Cloudinary using the credentials from your .env file.
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer for in-memory file storage.
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Create the Express application.
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON bodies from incoming requests.
app.use(express.json());

// Connect to MongoDB using the URI from your .env file.
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB connected successfully.'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// A simple GET route to confirm the server is running.
app.get('/', (req, res) => {
    res.send('Server is running and connected to MongoDB!');
});

// The POST route to create a new civic issue report with a photo upload.
app.post('/api/reports', upload.single('photo'), async (req, res) => {
    try {
        const { description, location, category, status } = req.body;
        let photoUrl = null;

        // If a file was uploaded, upload it to Cloudinary.
        if (req.file) {
            const result = await cloudinary.uploader.upload(`data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`);
            photoUrl = result.secure_url;
        }

        const newReport = new Report({
            description,
            location: JSON.parse(location),
            category,
            status,
            photoUrl
        });

        await newReport.save();
        res.status(201).json({
            message: 'Report submitted successfully!',
            report: newReport
        });
    } catch (error) {
        res.status(400).json({ error: 'Failed to submit report', details: error.message });
    }
});

// The GET route to retrieve all civic issue reports.
app.get('/api/reports', async (req, res) => {
    try {
        const reports = await Report.find();
        res.status(200).json(reports);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve reports', details: error.message });
    }
});

// The GET route to retrieve a single civic issue report by ID.
app.get('/api/reports/:id', async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }
        res.status(200).json(report);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve report', details: error.message });
    }
});

// The PATCH route to update a civic issue report.
app.patch('/api/reports/:id', async (req, res) => {
    try {
        const { status } = req.body;
        
        // Find the report and update its status.
        const updatedReport = await Report.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true } // Return the updated document
        );

        if (!updatedReport) {
            return res.status(404).json({ message: 'Report not found' });
        }

        res.status(200).json({
            message: 'Report updated successfully!',
            report: updatedReport
        });
    } catch (error) {
        res.status(400).json({ error: 'Failed to update report', details: error.message });
    }
});

// Start the server and listen for connections on the specified port.
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// The DELETE route to delete a civic issue report.
app.delete('/api/reports/:id', async (req, res) => {
    try {
        const deletedReport = await Report.findByIdAndDelete(req.params.id);
        
        if (!deletedReport) {
            return res.status(404).json({ message: 'Report not found' });
        }
        
        res.status(200).json({ message: 'Report deleted successfully!' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete report', details: error.message });
    }
});