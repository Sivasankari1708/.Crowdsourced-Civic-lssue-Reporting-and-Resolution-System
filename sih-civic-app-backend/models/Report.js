const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true }
    },
    category: {
        type: String,
        required: true,
        enum: ['Pothole', 'Streetlight Out', 'Garbage Overflow', 'Other']
    },
    status: {
        type: String,
        required: true,
        enum: ['Received', 'In Progress', 'Resolved'],
        default: 'Received'
    },
    photoUrl: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;