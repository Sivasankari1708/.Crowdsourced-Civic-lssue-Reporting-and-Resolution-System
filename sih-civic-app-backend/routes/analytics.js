// routes/analytics.js
const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue'); // Adjust path to your Issue model
const auth = require('../middleware/auth'); // Optional: protect analytics routes

// GET /api/analytics - Main analytics endpoint
router.get('/', async (req, res) => {
  try {
    const { period = '30d', department = 'all', category = 'all' } = req.query;
    
    // Calculate date range
    const now = new Date();
    const periodDays = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    };
    
    const days = periodDays[period] || 30;
    const startDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
    
    // Build query
    let query = { createdAt: { $gte: startDate } };
    if (department !== 'all') query.department = department;
    if (category !== 'all') query.category = category;
    
    const issues = await Issue.find(query);
    
    // Reports by Category
    const reportsByCategory = await Issue.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$category',
          reports: { $sum: 1 },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $in: ['$status', ['reported', 'in-progress']] }, 1, 0] } }
        }
      },
      {
        $project: {
          name: {
            $switch: {
              branches: [
                { case: { $eq: ['$_id', 'infrastructure'] }, then: 'Infrastructure' },
                { case: { $eq: ['$_id', 'environment'] }, then: 'Environment' },
                { case: { $eq: ['$_id', 'maintenance'] }, then: 'Maintenance' },
                { case: { $eq: ['$_id', 'transportation'] }, then: 'Transportation' },
                { case: { $eq: ['$_id', 'safety'] }, then: 'Safety' }
              ],
              default: { $toUpper: { $substr: ['$_id', 0, 1] } }
            }
          },
          reports: 1,
          resolved: 1,
          pending: 1,
          _id: 0
        }
      },
      { $sort: { reports: -1 } }
    ]);
    
    // Reports Over Time (last 6 months)
    const reportsOverTime = await Issue.aggregate([
      { $match: query },
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          reports: { $sum: 1 },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      {
        $project: {
          name: {
            $arrayElemAt: [
              ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
               'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
              { $subtract: ['$_id.month', 1] }
            ]
          },
          reports: 1,
          resolved: 1,
          inProgress: 1,
          _id: 0
        }
      }
    ]);
    
    // Status Distribution
    const statusDistribution = await Issue.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          name: {
            $switch: {
              branches: [
                { case: { $eq: ['$_id', 'reported'] }, then: 'Reported' },
                { case: { $eq: ['$_id', 'in-progress'] }, then: 'In Progress' },
                { case: { $eq: ['$_id', 'resolved'] }, then: 'Resolved' },
                { case: { $eq: ['$_id', 'closed'] }, then: 'Closed' }
              ],
              default: '$_id'
            }
          },
          value: '$count',
          percentage: { $multiply: [{ $divide: ['$count', issues.length] }, 100] },
          _id: 0
        }
      }
    ]);
    
    // Department Performance for Radar Chart
    const departmentPerformance = await Issue.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$department',
          total: { $sum: 1 },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          avgResponseTime: { $avg: 2.5 }, // Mock data - calculate actual response time
          avgPriority: { $avg: { 
            $switch: {
              branches: [
                { case: { $eq: ['$priority', 'urgent'] }, then: 4 },
                { case: { $eq: ['$priority', 'high'] }, then: 3 },
                { case: { $eq: ['$priority', 'medium'] }, then: 2 },
                { case: { $eq: ['$priority', 'low'] }, then: 1 }
              ],
              default: 2
            }
          }}
        }
      },
      {
        $project: {
          department: '$_id',
          efficiency: { 
            $cond: [
              { $eq: ['$total', 0] }, 
              0, 
              { $multiply: [{ $divide: ['$resolved', '$total'] }, 100] }
            ]
          },
          satisfaction: { $add: [75, { $multiply: [{ $rand: {} }, 20] }] }, // Mock data
          cost: { $add: [65, { $multiply: [{ $rand: {} }, 25] }] }, // Mock data
          _id: 0
        }
      }
    ]);
    
    // Priority Distribution
    const priorityStats = await Issue.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          priority: '$_id',
          count: 1,
          percentage: { $multiply: [{ $divide: ['$count', issues.length] }, 100] },
          _id: 0
        }
      }
    ]);
    
    // Performance Metrics
    const totalIssues = issues.length;
    const resolvedIssues = issues.filter(issue => issue.status === 'resolved').length;
    const resolutionRate = totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0;
    
    const performanceData = {
      avgResponseTime: '2.3h',
      resolutionRate: `${resolutionRate}%`,
      citizenSatisfaction: '4.2★',
      costEfficiency: '$1.2K'
    };
    
    res.json({
      period,
      department,
      category,
      totalIssues,
      reportsByCategory,
      reportsOverTime,
      departmentalResponse: statusDistribution,
      departmentRadar: departmentPerformance,
      priorityDistribution: priorityStats,
      performanceData,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to generate analytics', details: error.message });
  }
});

// GET /api/analytics/summary - Quick summary stats
router.get('/summary', async (req, res) => {
  try {
    const [
      totalIssues,
      newReports,
      inProgress,
      resolved,
      urgent
    ] = await Promise.all([
      Issue.countDocuments(),
      Issue.countDocuments({ status: 'reported' }),
      Issue.countDocuments({ status: 'in-progress' }),
      Issue.countDocuments({ status: 'resolved' }),
      Issue.countDocuments({ priority: 'urgent' })
    ]);

    // Monthly comparison
    const thisMonth = new Date();
    thisMonth.setDate(1);
    const lastMonth = new Date(thisMonth);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const [thisMonthCount, lastMonthCount] = await Promise.all([
      Issue.countDocuments({ createdAt: { $gte: thisMonth } }),
      Issue.countDocuments({ 
        createdAt: { 
          $gte: lastMonth, 
          $lt: thisMonth 
        } 
      })
    ]);

    const monthlyGrowth = lastMonthCount > 0 
      ? Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100)
      : 0;

    res.json({
      summary: {
        totalIssues,
        newReports,
        inProgress,
        resolved,
        urgent,
        monthlyGrowth
      },
      trends: {
        thisMonth: thisMonthCount,
        lastMonth: lastMonthCount,
        growth: monthlyGrowth
      },
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Analytics summary error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics summary', details: error.message });
  }
});

// GET /api/analytics/categories - Category breakdown
router.get('/categories', async (req, res) => {
  try {
    const categoryStats = await Issue.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          urgent: { $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] } },
          avgPriority: { $avg: { 
            $switch: {
              branches: [
                { case: { $eq: ['$priority', 'urgent'] }, then: 4 },
                { case: { $eq: ['$priority', 'high'] }, then: 3 },
                { case: { $eq: ['$priority', 'medium'] }, then: 2 },
                { case: { $eq: ['$priority', 'low'] }, then: 1 }
              ],
              default: 2
            }
          }}
        }
      },
      {
        $project: {
          category: '$_id',
          count: 1,
          resolved: 1,
          urgent: 1,
          resolutionRate: { 
            $cond: [
              { $eq: ['$count', 0] }, 
              0, 
              { $multiply: [{ $divide: ['$resolved', '$count'] }, 100] }
            ]
          },
          avgPriorityScore: { $round: ['$avgPriority', 1] },
          _id: 0
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      categories: categoryStats,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Category analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch category analytics', details: error.message });
  }
});

// GET /api/analytics/departments - Department performance
router.get('/departments', async (req, res) => {
  try {
    const departmentStats = await Issue.aggregate([
      {
        $group: {
          _id: '$department',
          totalIssues: { $sum: 1 },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'reported'] }, 1, 0] } },
          urgent: { $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] } }
        }
      },
      {
        $project: {
          department: '$_id',
          totalIssues: 1,
          resolved: 1,
          inProgress: 1,
          pending: 1,
          urgent: 1,
          resolutionRate: { 
            $cond: [
              { $eq: ['$totalIssues', 0] }, 
              0, 
              { $round: [{ $multiply: [{ $divide: ['$resolved', '$totalIssues'] }, 100] }, 1] }
            ]
          },
          _id: 0
        }
      },
      { $sort: { totalIssues: -1 } }
    ]);

    res.json({
      departments: departmentStats,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Department analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch department analytics', details: error.message });
  }
});

// GET /api/analytics/trends/:period - Trend analysis
router.get('/trends/:period', async (req, res) => {
  try {
    const { period } = req.params;
    
    const periodDays = {
      'week': 7,
      'month': 30,
      'quarter': 90,
      'year': 365
    };
    
    const days = periodDays[period] || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const trendsData = await Issue.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: period === 'week' ? '%Y-%m-%d' : '%Y-%m',
                date: '$createdAt'
              }
            }
          },
          count: { $sum: 1 },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          categories: { $addToSet: '$category' }
        }
      },
      { $sort: { '_id.date': 1 } },
      {
        $project: {
          date: '$_id.date',
          count: 1,
          resolved: 1,
          pending: { $subtract: ['$count', '$resolved'] },
          categoryCount: { $size: '$categories' },
          _id: 0
        }
      }
    ]);

    res.json({
      period,
      trends: trendsData,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Trends analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch trends analytics', details: error.message });
  }
});

module.exports = router;