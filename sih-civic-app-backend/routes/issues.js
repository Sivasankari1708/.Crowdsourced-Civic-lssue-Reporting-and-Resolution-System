// routes/issues.js
const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue'); // Adjust path to your Issue model
const auth = require('../middleware/auth'); // Adjust path to your auth middleware
const upload = require('../middleware/upload'); // If you have file upload middleware

// GET /api/issues - Get all issues with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      priority, 
      category, 
      department,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    let query = {};
    
    if (status && status !== 'all') query.status = status;
    if (priority && priority !== 'all') query.priority = priority;
    if (category && category !== 'all') query.category = category;
    if (department && department !== 'all') query.department = department;
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { issueId: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sortObj = {};
    if (sortBy === 'priority') {
      // Custom priority sorting
      const issues = await Issue.aggregate([
        { $match: query },
        {
          $addFields: {
            priorityOrder: {
              $switch: {
                branches: [
                  { case: { $eq: ['$priority', 'urgent'] }, then: 4 },
                  { case: { $eq: ['$priority', 'high'] }, then: 3 },
                  { case: { $eq: ['$priority', 'medium'] }, then: 2 },
                  { case: { $eq: ['$priority', 'low'] }, then: 1 }
                ],
                default: 0
              }
            }
          }
        },
        { $sort: { priorityOrder: sortOrder === 'desc' ? -1 : 1 } },
        { $skip: (parseInt(page) - 1) * parseInt(limit) },
        { $limit: parseInt(limit) }
      ]);
      
      const totalCount = await Issue.countDocuments(query);
      
      return res.json({
        issues,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalItems: totalCount,
          itemsPerPage: parseInt(limit),
          hasNext: (parseInt(page) * parseInt(limit)) < totalCount,
          hasPrev: parseInt(page) > 1
        }
      });
    } else {
      sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [issues, totalCount] = await Promise.all([
      Issue.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('reportedBy', 'name email') // Adjust based on your User model
        .lean(),
      Issue.countDocuments(query)
    ]);

    res.json({
      issues,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalItems: totalCount,
        itemsPerPage: parseInt(limit),
        hasNext: skip + parseInt(limit) < totalCount,
        hasPrev: parseInt(page) > 1
      },
      filters: { status, priority, category, department, search },
      sorting: { sortBy, sortOrder }
    });
  } catch (error) {
    console.error('Get issues error:', error);
    res.status(500).json({ error: 'Failed to fetch issues', details: error.message });
  }
});

// GET /api/issues/dashboard-stats - Dashboard statistics
router.get('/dashboard-stats', async (req, res) => {
  try {
    const [
      newReports,
      inProgress,
      resolved,
      urgent,
      totalReports
    ] = await Promise.all([
      Issue.countDocuments({ status: 'reported' }),
      Issue.countDocuments({ status: 'in-progress' }),
      Issue.countDocuments({ status: 'resolved' }),
      Issue.countDocuments({ priority: 'urgent' }),
      Issue.countDocuments()
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

// GET /api/issues/:id - Get single issue
router.get('/:id', async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('reportedBy', 'name email phone')
      .lean();
    
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    
    res.json(issue);
  } catch (error) {
    console.error('Get issue error:', error);
    res.status(500).json({ error: 'Failed to fetch issue', details: error.message });
  }
});

// POST /api/issues - Create new issue
router.post('/', upload.array('images', 5), async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      priority = 'medium',
      category = 'general',
      coordinates,
      tags
    } = req.body;

    // Validation
    if (!title || !description || !location) {
      return res.status(400).json({ 
        error: 'Missing required fields: title, description, location' 
      });
    }

    // Handle image uploads (if using Cloudinary)
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => file.path); // Cloudinary URLs
    }

    // Determine department based on category
    const departmentMap = {
      'infrastructure': 'Public Works',
      'environment': 'Environmental Services',
      'maintenance': 'Building Services',
      'transportation': 'Transportation Dept',
      'safety': 'Public Safety',
      'general': 'General Services'
    };

    const issueData = {
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      priority: priority.toLowerCase(),
      category: category.toLowerCase(),
      department: departmentMap[category.toLowerCase()] || 'General Services',
      status: 'reported',
      urgent: priority.toLowerCase() === 'urgent',
      images: imageUrls,
      coordinates: coordinates ? JSON.parse(coordinates) : null,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
      reportedBy: req.user ? req.user._id : null, // If user is authenticated
      notes: []
    };

    const issue = new Issue(issueData);
    await issue.save();

    // Populate the response
    await issue.populate('reportedBy', 'name email');

    res.status(201).json({
      message: 'Issue created successfully',
      issue
    });
  } catch (error) {
    console.error('Create issue error:', error);
    res.status(500).json({ error: 'Failed to create issue', details: error.message });
  }
});

// PUT /api/issues/:id - Update issue
router.put('/:id', auth, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    const updates = { ...req.body };
    const oldStatus = issue.status;
    
    // Add note if status changed
    if (updates.status && updates.status !== oldStatus) {
      const note = {
        text: `Status changed from ${oldStatus} to ${updates.status}`,
        timestamp: new Date(),
        author: req.user?.name || 'System',
        action: 'status_update'
      };
      
      updates.$push = { notes: note };
    }
    
    // Update timestamp
    updates.updatedAt = new Date();
    
    const updatedIssue = await Issue.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('reportedBy', 'name email');
    
    res.json({
      message: 'Issue updated successfully',
      issue: updatedIssue
    });
  } catch (error) {
    console.error('Update issue error:', error);
    res.status(500).json({ error: 'Failed to update issue', details: error.message });
  }
});

// DELETE /api/issues/:id - Delete issue
router.delete('/:id', auth, async (req, res) => {
  try {
    const issue = await Issue.findByIdAndDelete(req.params.id);
    
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    
    res.json({
      message: 'Issue deleted successfully',
      issue
    });
  } catch (error) {
    console.error('Delete issue error:', error);
    res.status(500).json({ error: 'Failed to delete issue', details: error.message });
  }
});

// POST /api/issues/bulk - Bulk operations
router.post('/bulk', auth, async (req, res) => {
  try {
    const { action, issueIds, updates } = req.body;
    
    if (!action || !Array.isArray(issueIds) || issueIds.length === 0) {
      return res.status(400).json({ error: 'Invalid bulk operation request' });
    }
    
    let result;
    const updateData = { updatedAt: new Date() };
    
    switch (action) {
      case 'update-status':
        if (!updates.status) {
          return res.status(400).json({ error: 'Status is required for status update' });
        }
        updateData.status = updates.status;
        updateData.$push = {
          notes: {
            text: `Status updated to ${updates.status} via bulk operation`,
            timestamp: new Date(),
            author: req.user?.name || 'System',
            action: 'bulk_status_update'
          }
        };
        break;
        
      case 'assign':
        if (!updates.assignedTo) {
          return res.status(400).json({ error: 'assignedTo is required for assignment' });
        }
        updateData.assignedTo = updates.assignedTo;
        updateData.$push = {
          notes: {
            text: `Assigned to ${updates.assignedTo} via bulk operation`,
            timestamp: new Date(),
            author: req.user?.name || 'System',
            action: 'bulk_assignment'
          }
        };
        break;
        
      case 'delete':
        result = await Issue.deleteMany({ _id: { $in: issueIds } });
        return res.json({
          message: 'Bulk delete completed',
          deletedCount: result.deletedCount
        });
        
      default:
        return res.status(400).json({ error: 'Unsupported bulk action' });
    }
    
    result = await Issue.updateMany(
      { _id: { $in: issueIds } },
      updateData
    );
    
    res.json({
      message: `Bulk ${action} completed`,
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount
    });
  } catch (error) {
    console.error('Bulk operation error:', error);
    res.status(500).json({ error: 'Failed to perform bulk operation', details: error.message });
  }
});

// GET /api/issues/export/:format - Export issues
router.get('/export/:format', auth, async (req, res) => {
  try {
    const { format } = req.params;
    const { status, priority, category, limit = 1000 } = req.query;
    
    let query = {};
    if (status && status !== 'all') query.status = status;
    if (priority && priority !== 'all') query.priority = priority;
    if (category && category !== 'all') query.category = category;
    
    const issues = await Issue.find(query)
      .limit(parseInt(limit))
      .populate('reportedBy', 'name email')
      .lean();
    
    switch (format.toLowerCase()) {
      case 'json':
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=issues.json');
        res.json(issues);
        break;
        
      case 'csv':
        const csvHeaders = [
          'ID', 'Title', 'Description', 'Status', 'Priority', 'Location', 
          'Reported By', 'Email', 'Date', 'Category', 'Department'
        ];
        
        const csvData = issues.map(issue => [
          issue._id.toString(),
          `"${issue.title.replace(/"/g, '""')}"`,
          `"${issue.description.replace(/"/g, '""')}"`,
          issue.status,
          issue.priority,
          `"${issue.location}"`,
          issue.reportedBy?.name || 'Anonymous',
          issue.reportedBy?.email || '',
          new Date(issue.createdAt).toISOString().split('T')[0],
          issue.category,
          issue.department
        ]);
        
        const csvContent = [
          csvHeaders.join(','),
          ...csvData.map(row => row.join(','))
        ].join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=issues.csv');
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

module.exports = router;