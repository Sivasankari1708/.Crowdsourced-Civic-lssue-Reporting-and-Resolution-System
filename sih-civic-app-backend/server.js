// Load environment variables from the .env file.
require('dotenv').config();

// Import necessary packages.
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Import routes
const authRoutes = require('./routes/auth');
const issueRoutes = require('./routes/issues');
const analyticsRoutes = require('./routes/analytics');

// Import the Mongoose model
const Report = require('./models/Report');

// Configure Cloudinary using the credentials from your .env file.
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer for in-memory file storage.
const storage = multer.memoryStorage();
const upload = multer({ 
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Create the Express application.
const app = express();
const PORT = process.env.PORT || 5000;

// Security and logging middleware
app.use(helmet());
app.use(morgan('combined'));

// Rate limiting
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: { error: 'Too many requests, please try again later.' }
});

const exportLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: { error: 'Too many export requests, please try again later.' }
});

app.use(generalLimiter);

// CORS configuration for both mobile app and web portal
app.use(cors({
    origin: [
        'http://localhost:3000', // Mobile app or default frontend
        'http://localhost:3001', // Web portal
        process.env.FRONTEND_URL,
        process.env.WEB_FRONTEND_URL
    ],
    credentials: true
}));

// Middleware to parse JSON bodies from incoming requests.
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connect to MongoDB using the URI from your .env file.
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB connected successfully.'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK',
        service: 'Civic Issue Reporting API',
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        uptime: process.uptime(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// A simple GET route to confirm the server is running.
app.get('/', (req, res) => {
    res.send('Civic Issue Reporting API - Server is running and connected to MongoDB!');
});

// Auth routes
app.use('/api/auth', authRoutes);

// New web portal routes
app.use('/api/issues', issueRoutes);
app.use('/api/analytics', analyticsRoutes);

// Export routes with rate limiting
app.get('/api/export/:format', exportLimiter, async (req, res) => {
    try {
        const { format } = req.params;
        const { status, category, limit = 1000 } = req.query;
        
        let query = {};
        if (status && status !== 'all') query.status = status;
        if (category && category !== 'all') query.category = category;
        
        const reports = await Report.find(query)
            .limit(parseInt(limit))
            .lean();
        
        switch (format.toLowerCase()) {
            case 'json':
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', 'attachment; filename=reports.json');
                res.json(reports);
                break;
                
            case 'csv':
                const csvHeaders = [
                    'ID', 'Description', 'Category', 'Status', 'Location', 'Date'
                ];
                
                const csvData = reports.map(report => [
                    report._id.toString(),
                    `"${report.description.replace(/"/g, '""')}"`,
                    report.category,
                    report.status,
                    `"${report.location?.address || 'N/A'}"`,
                    new Date(report.createdAt).toISOString().split('T')[0]
                ]);
                
                const csvContent = [
                    csvHeaders.join(','),
                    ...csvData.map(row => row.join(','))
                ].join('\n');
                
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', 'attachment; filename=reports.csv');
                res.send(csvContent);
                break;
                
            default:
                res.status(400).json({ error: 'Unsupported export format. Use json or csv.' });
        }
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ error: 'Failed to export data', details: error.message });
    }
});

// Dashboard statistics endpoint
app.get('/api/dashboard-stats', async (req, res) => {
    try {
        const [
            newReports,
            inProgress,
            resolved,
            urgent,
            totalReports
        ] = await Promise.all([
            Report.countDocuments({ status: 'reported' }),
            Report.countDocuments({ status: 'in-progress' }),
            Report.countDocuments({ status: 'resolved' }),
            Report.countDocuments({ status: 'urgent' }),
            Report.countDocuments()
        ]);

        res.json({
            summary: {
                newReports,
                inProgress,
                resolved,
                urgent,
                totalReports
            },
            lastUpdated: new Date().toISOString()
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard statistics', details: error.message });
    }
});

// EXISTING MOBILE APP ROUTES (Enhanced)

// The POST route to create a new civic issue report with a photo upload.
app.post('/api/reports', upload.single('photo'), async (req, res) => {
    try {
        const { description, location, category, status } = req.body;
        let photoUrl = null;

        // If a file was uploaded, upload it to Cloudinary.
        if (req.file) {
            const result = await cloudinary.uploader.upload(
                `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
                {
                    folder: 'civic-reports',
                    transformation: [
                        { width: 800, height: 600, crop: 'limit' },
                        { quality: 'auto' }
                    ]
                }
            );
            photoUrl = result.secure_url;
        }

        const newReport = new Report({
            description,
            location: typeof location === 'string' ? JSON.parse(location) : location,
            category,
            status: status || 'reported',
            photoUrl,
            // Additional fields for web portal compatibility
            title: description?.substring(0, 50) + (description?.length > 50 ? '...' : ''),
            priority: 'medium',
            department: getDepartmentByCategory(category)
        });

        await newReport.save();
        res.status(201).json({
            message: 'Report submitted successfully!',
            report: newReport
        });
    } catch (error) {
        console.error('Create report error:', error);
        res.status(400).json({ error: 'Failed to submit report', details: error.message });
    }
});

// The GET route to retrieve all civic issue reports (Enhanced with filtering).
app.get('/api/reports', async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            status, 
            category, 
            search 
        } = req.query;

        // Build query
        let query = {};
        if (status && status !== 'all') query.status = status;
        if (category && category !== 'all') query.category = category;
        
        if (search) {
            query.$or = [
                { description: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } }
            ];
        }

        // Execute query with pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [reports, totalCount] = await Promise.all([
            Report.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            Report.countDocuments(query)
        ]);

        res.status(200).json({
            reports,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCount / parseInt(limit)),
                totalItems: totalCount,
                itemsPerPage: parseInt(limit),
                hasNext: skip + parseInt(limit) < totalCount,
                hasPrev: parseInt(page) > 1
            }
        });
    } catch (error) {
        console.error('Get reports error:', error);
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
        console.error('Get report error:', error);
        res.status(500).json({ error: 'Failed to retrieve report', details: error.message });
    }
});

// The PATCH route to update a civic issue report (Enhanced).
app.patch('/api/reports/:id', async (req, res) => {
    try {
        const { status, priority, assignedTo, notes } = req.body;
        
        const updateData = {};
        if (status) updateData.status = status;
        if (priority) updateData.priority = priority;
        if (assignedTo) updateData.assignedTo = assignedTo;
        
        // Add note if provided
        if (notes) {
            updateData.$push = {
                notes: {
                    text: notes,
                    timestamp: new Date(),
                    author: 'System'
                }
            };
        }
        
        updateData.updatedAt = new Date();
        
        // Find the report and update it.
        const updatedReport = await Report.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedReport) {
            return res.status(404).json({ message: 'Report not found' });
        }

        res.status(200).json({
            message: 'Report updated successfully!',
            report: updatedReport
        });
    } catch (error) {
        console.error('Update report error:', error);
        res.status(400).json({ error: 'Failed to update report', details: error.message });
    }
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
        console.error('Delete report error:', error);
        res.status(500).json({ error: 'Failed to delete report', details: error.message });
    }
});

// Bulk operations for reports
app.post('/api/reports/bulk', async (req, res) => {
    try {
        const { action, reportIds, updates } = req.body;
        
        if (!action || !Array.isArray(reportIds) || reportIds.length === 0) {
            return res.status(400).json({ error: 'Invalid bulk operation request' });
        }
        
        let result;
        
        switch (action) {
            case 'update-status':
                if (!updates.status) {
                    return res.status(400).json({ error: 'Status is required' });
                }
                result = await Report.updateMany(
                    { _id: { $in: reportIds } },
                    { 
                        status: updates.status,
                        updatedAt: new Date()
                    }
                );
                break;
                
            case 'delete':
                result = await Report.deleteMany({ _id: { $in: reportIds } });
                break;
                
            default:
                return res.status(400).json({ error: 'Unsupported bulk action' });
        }
        
        res.json({
            message: `Bulk ${action} completed`,
            affectedCount: result.modifiedCount || result.deletedCount
        });
    } catch (error) {
        console.error('Bulk operation error:', error);
        res.status(500).json({ error: 'Failed to perform bulk operation', details: error.message });
    }
});

// Helper function to determine department based on category
function getDepartmentByCategory(category) {
    const departmentMap = {
        'infrastructure': 'Public Works',
        'environment': 'Environmental Services',
        'maintenance': 'Building Services',
        'transportation': 'Transportation Dept',
        'safety': 'Public Safety',
        'utilities': 'Utilities Department'
    };
    return departmentMap[category?.toLowerCase()] || 'General Services';
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(error => error.message);
        return res.status(400).json({ error: 'Validation Error', details: errors });
    }
    
    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(400).json({ error: `${field} already exists` });
    }
    
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Invalid token' });
    }
    
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    mongoose.connection.close(() => {
        console.log('MongoDB connection closed');
        process.exit(0);
    });
});

// Start the server and listen for connections on the specified port.
app.listen(PORT, () => {
    console.log(`🚀 Civic Issue Reporting API Server running on port ${PORT}`);
    console.log(`📱 Mobile API: http://localhost:${PORT}/api/reports`);
    console.log(`🌐 Web Portal: http://localhost:${PORT}/api/issues`);
    console.log(`📈 Analytics: http://localhost:${PORT}/api/analytics`);
    console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
});