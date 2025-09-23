import React, { useState, useEffect } from 'react';

// Enhanced Card Component
function Card({ children, className = "", gradient = "from-blue-500 to-purple-600", hover = true }) {
  return (
    <div className={`relative group ${className}`}>
      {hover && (
        <div className={`absolute -inset-0.5 bg-gradient-to-r ${gradient} rounded-xl blur opacity-60 group-hover:opacity-100 transition duration-300`}></div>
      )}
      <div className={`relative bg-white rounded-xl shadow-lg border border-gray-200 ${hover ? 'group-hover:scale-[1.02] transition-transform duration-300' : ''}`}>
        {children}
      </div>
    </div>
  );
}

// Enhanced Filter Component
function AdvancedFilters({ onFilter, onSearch, totalCount, filteredCount }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  const handleSearch = (value) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const handleFilterChange = () => {
    onFilter({
      status: statusFilter,
      priority: priorityFilter,
      dateRange: dateRange
    });
  };

  useEffect(() => {
    handleFilterChange();
  }, [statusFilter, priorityFilter, dateRange]);

  return (
    <Card className="mb-6" gradient="from-cyan-500 to-blue-600">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            🔍 Advanced Search & Filters
            <span className="ml-2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          </h2>
          <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            Showing {filteredCount} of {totalCount} issues
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Search issues, locations..."
              className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <div className="absolute right-3 top-3 text-gray-400">
              <span className="animate-pulse">⚡</span>
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">📊 All Status</option>
            <option value="reported">🆕 Reported</option>
            <option value="in-progress">⚡ In Progress</option>
            <option value="resolved">✅ Resolved</option>
            <option value="closed">🔒 Closed</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">🎯 All Priorities</option>
            <option value="urgent">🔥 Urgent</option>
            <option value="high">🚨 High</option>
            <option value="medium">⚠️ Medium</option>
            <option value="low">🟢 Low</option>
          </select>

          {/* Date Range */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">📅 All Time</option>
            <option value="today">📆 Today</option>
            <option value="week">📅 This Week</option>
            <option value="month">🗓️ This Month</option>
            <option value="quarter">📊 This Quarter</option>
          </select>
        </div>
      </div>
    </Card>
  );
}

// Statistics Cards Component
function IssueStats({ issues }) {
  const stats = {
    total: issues.length,
    urgent: issues.filter(issue => issue.priority === 'urgent').length,
    inProgress: issues.filter(issue => issue.status === 'in-progress').length,
    resolved: issues.filter(issue => issue.status === 'resolved').length
  };

  const StatCard = ({ title, value, icon, color, percentage }) => (
    <Card gradient={`from-${color}-400 to-${color}-600`}>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className={`text-3xl font-bold text-${color}-600`}>{value}</p>
            {percentage && (
              <p className="text-xs text-gray-500 mt-1">{percentage}% of total</p>
            )}
          </div>
          <div className={`text-4xl opacity-20 text-${color}-600`}>{icon}</div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard 
        title="Total Issues" 
        value={stats.total} 
        icon="📊" 
        color="blue"
      />
      <StatCard 
        title="Urgent Issues" 
        value={stats.urgent} 
        icon="🔥" 
        color="red"
        percentage={stats.total ? Math.round((stats.urgent / stats.total) * 100) : 0}
      />
      <StatCard 
        title="In Progress" 
        value={stats.inProgress} 
        icon="⚡" 
        color="yellow"
        percentage={stats.total ? Math.round((stats.inProgress / stats.total) * 100) : 0}
      />
      <StatCard 
        title="Resolved" 
        value={stats.resolved} 
        icon="✅" 
        color="green"
        percentage={stats.total ? Math.round((stats.resolved / stats.total) * 100) : 0}
      />
    </div>
  );
}

// Enhanced Issue Card Component
function IssueCard({ issue, onViewDetails, onQuickAction }) {
  const getPriorityColor = (priority) => {
    const colors = {
      urgent: 'bg-red-100 text-red-800 border-red-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      low: 'bg-green-100 text-green-800 border-green-300'
    };
    return colors[priority?.toLowerCase()] || colors.medium;
  };

  const getStatusColor = (status) => {
    const colors = {
      reported: 'bg-blue-100 text-blue-800 border-blue-300',
      'in-progress': 'bg-purple-100 text-purple-800 border-purple-300',
      resolved: 'bg-green-100 text-green-800 border-green-300',
      closed: 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return colors[status?.toLowerCase()] || colors.reported;
  };

  const getPriorityIcon = (priority) => {
    const icons = {
      urgent: '🔥',
      high: '🚨',
      medium: '⚠️',
      low: '🟢'
    };
    return icons[priority?.toLowerCase()] || '⚠️';
  };

  return (
    <Card className="mb-4" hover={true}>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <span className="text-lg mr-2">{getPriorityIcon(issue.priority)}</span>
              <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                {issue.title || 'Untitled Issue'}
              </h3>
            </div>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {issue.description || 'No description available'}
            </p>
          </div>
          <div className="flex flex-col items-end space-y-2 ml-4">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(issue.priority)}`}>
              {issue.priority || 'Medium'}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(issue.status)}`}>
              {issue.status || 'Reported'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center">
            <span className="mr-2">📍</span>
            <span className="truncate">{issue.location || 'No location specified'}</span>
          </div>
          <div className="flex items-center">
            <span className="mr-2">👤</span>
            <span className="truncate">{issue.reportedBy || 'Anonymous'}</span>
          </div>
          <div className="flex items-center">
            <span className="mr-2">🆔</span>
            <span className="font-mono text-xs">{issue.id || 'N/A'}</span>
          </div>
          <div className="flex items-center">
            <span className="mr-2">📅</span>
            <span>{issue.date ? new Date(issue.date).toLocaleDateString() : 'No date'}</span>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            {issue.images && issue.images.length > 0 && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                📸 {issue.images.length} photo{issue.images.length > 1 ? 's' : ''}
              </span>
            )}
            {issue.urgent && (
              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full animate-pulse">
                ⚡ Urgent
              </span>
            )}
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => onQuickAction(issue, 'assign')}
              className="px-3 py-1 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors"
            >
              👥 Assign
            </button>
            <button
              onClick={() => onViewDetails(issue)}
              className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition-colors"
            >
              👁️ Details
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Quick Actions Modal
function QuickActionsModal({ issue, isOpen, onClose, onUpdate }) {
  const [selectedAction, setSelectedAction] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedAction) {
      onUpdate({
        ...issue,
        status: selectedAction,
        notes: [...(issue.notes || []), {
          text: notes,
          timestamp: new Date().toISOString(),
          action: selectedAction
        }]
      });
      onClose();
      setNotes('');
      setSelectedAction('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4" hover={false}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">⚡ Quick Actions</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Action...</option>
                <option value="in-progress">🔄 Mark In Progress</option>
                <option value="resolved">✅ Mark Resolved</option>
                <option value="closed">🔒 Close Issue</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Add any notes or comments..."
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Apply Action
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}

// Issue Detail Modal (Enhanced)
function IssueDetailModal({ issue, isOpen, onClose, onUpdate }) {
  const [editMode, setEditMode] = useState(false);
  const [editedIssue, setEditedIssue] = useState(issue);

  useEffect(() => {
    setEditedIssue(issue);
  }, [issue]);

  if (!isOpen || !issue) return null;

  const handleSave = () => {
    onUpdate(editedIssue);
    setEditMode(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto" hover={false}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              📋 Issue Details
              <span className="ml-3 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                ID: {issue.id}
              </span>
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setEditMode(!editMode)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  editMode ? 'bg-gray-500 text-white' : 'bg-blue-500 text-white'
                }`}
              >
                {editMode ? '📝 Cancel' : '✏️ Edit'}
              </button>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">✕</button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                {editMode ? (
                  <input
                    type="text"
                    value={editedIssue.title || ''}
                    onChange={(e) => setEditedIssue({...editedIssue, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                ) : (
                  <h3 className="text-lg font-semibold text-gray-800">{issue.title}</h3>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                {editMode ? (
                  <textarea
                    value={editedIssue.description || ''}
                    onChange={(e) => setEditedIssue({...editedIssue, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows="4"
                  />
                ) : (
                  <p className="text-gray-700 leading-relaxed">{issue.description || 'No description provided'}</p>
                )}
              </div>

              {/* Activity Timeline */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-3">📅 Activity Timeline</h4>
                <div className="space-y-3">
                  <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                    <span className="mr-3">🆕</span>
                    <div>
                      <p className="font-medium">Issue Reported</p>
                      <p className="text-sm text-gray-600">{issue.date ? new Date(issue.date).toLocaleString() : 'Date not available'}</p>
                    </div>
                  </div>
                  {issue.notes && issue.notes.map((note, index) => (
                    <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <span className="mr-3">💬</span>
                      <div>
                        <p className="font-medium">{note.text}</p>
                        <p className="text-sm text-gray-600">{new Date(note.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card hover={false}>
                <div className="p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">📊 Issue Information</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-600">Status</label>
                      {editMode ? (
                        <select
                          value={editedIssue.status || ''}
                          onChange={(e) => setEditedIssue({...editedIssue, status: e.target.value})}
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        >
                          <option value="reported">Reported</option>
                          <option value="in-progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </select>
                      ) : (
                        <p className="font-medium capitalize">{issue.status}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-600">Priority</label>
                      {editMode ? (
                        <select
                          value={editedIssue.priority || ''}
                          onChange={(e) => setEditedIssue({...editedIssue, priority: e.target.value})}
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      ) : (
                        <p className="font-medium capitalize">{issue.priority}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-600">Location</label>
                      <p className="font-medium">{issue.location}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-600">Reported By</label>
                      <p className="font-medium">{issue.reportedBy}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {editMode && (
                <button
                  onClick={handleSave}
                  className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
                >
                  💾 Save Changes
                </button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Main Issues Page Component
export default function IssuesPage() {
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Mock data - replace with actual API call
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockIssues = [
        {
          id: 'ISS-001',
          title: 'Pothole on Main Street causing traffic issues',
          description: 'Large pothole near intersection causing vehicle damage and traffic delays',
          status: 'reported',
          priority: 'high',
          location: 'Main Street & 5th Avenue',
          reportedBy: 'John Smith',
          date: '2024-01-15T10:30:00',
          images: ['image1.jpg'],
          notes: []
        },
        {
          id: 'ISS-002',
          title: 'Broken streetlight in residential area',
          description: 'Streetlight has been out for several days, creating safety concerns',
          status: 'in-progress',
          priority: 'medium',
          location: 'Oak Street Residential Area',
          reportedBy: 'Mary Johnson',
          date: '2024-01-14T18:45:00',
          images: [],
          notes: [{
            text: 'Repair crew dispatched',
            timestamp: '2024-01-15T09:00:00',
            action: 'in-progress'
          }]
        },
        {
          id: 'ISS-003',
          title: 'Illegal dumping in park area',
          description: 'Construction debris dumped near children\'s playground',
          status: 'urgent',
          priority: 'urgent',
          location: 'Central Park East Side',
          reportedBy: 'Anonymous',
          date: '2024-01-16T07:15:00',
          images: ['dump1.jpg', 'dump2.jpg'],
          notes: []
        },
        {
          id: 'ISS-004',
          title: 'Graffiti on public building',
          description: 'Vandalism on city hall exterior wall',
          status: 'resolved',
          priority: 'low',
          location: 'City Hall Building',
          reportedBy: 'City Inspector',
          date: '2024-01-10T14:20:00',
          images: ['graffiti.jpg'],
          notes: [{
            text: 'Cleaning completed',
            timestamp: '2024-01-12T11:00:00',
            action: 'resolved'
          }]
        }
      ];
      
      setIssues(mockIssues);
      setFilteredIssues(mockIssues);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleFilter = (filters) => {
    let filtered = [...issues];
    
    if (filters.status !== 'all') {
      filtered = filtered.filter(issue => issue.status === filters.status);
    }
    
    if (filters.priority !== 'all') {
      filtered = filtered.filter(issue => issue.priority === filters.priority);
    }
    
    // Add date range filtering logic here
    
    setFilteredIssues(filtered);
  };

  const handleSearch = (query) => {
    if (!query) {
      setFilteredIssues(issues);
      return;
    }
    
    const filtered = issues.filter(issue =>
      issue.title.toLowerCase().includes(query.toLowerCase()) ||
      issue.location.toLowerCase().includes(query.toLowerCase()) ||
      issue.status.toLowerCase().includes(query.toLowerCase()) ||
      issue.id.toLowerCase().includes(query.toLowerCase())
    );
    
    setFilteredIssues(filtered);
  };

  const handleViewDetails = (issue) => {
    setSelectedIssue(issue);
    setShowDetailModal(true);
  };

  const handleQuickAction = (issue, action) => {
    setSelectedIssue(issue);
    setShowQuickActions(true);
  };

  const handleUpdateIssue = (updatedIssue) => {
    setIssues(prev => prev.map(issue => 
      issue.id === updatedIssue.id ? updatedIssue : issue
    ));
    setFilteredIssues(prev => prev.map(issue => 
      issue.id === updatedIssue.id ? updatedIssue : issue
    ));
    setShowDetailModal(false);
    setShowQuickActions(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-700">Loading Issues...</h2>
          <p className="text-gray-500">Please wait while we fetch the latest data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center">
                📋 Reported Issues
                <span className="ml-3 w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
              </h1>
              <p className="text-gray-600">Comprehensive issue tracking and management system</p>
            </div>
            
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <div className="flex bg-white rounded-lg p-1 shadow-sm">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  🔲 Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  📋 List
                </button>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <IssueStats issues={filteredIssues} />
        </div>

        {/* Filters */}
        <AdvancedFilters 
          onFilter={handleFilter} 
          onSearch={handleSearch}
          totalCount={issues.length}
          filteredCount={filteredIssues.length}
        />

        {/* Issues Display */}
        <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-4'}`}>
          {filteredIssues.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No issues found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            filteredIssues.map(issue => (
              <IssueCard
                key={issue.id}
                issue={issue}
                onViewDetails={handleViewDetails}
                onQuickAction={handleQuickAction}
              />
            ))
          )}
        </div>

        {/* Export and Actions */}
        <div className="mt-8 flex justify-center">
          <div className="flex space-x-4">
            <button className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex items-center">
              📊 Export Report
            </button>
            <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center">
              📧 Email Summary
            </button>
          </div>
        </div>

        {/* Modals */}
        <IssueDetailModal
          issue={selectedIssue}
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          onUpdate={handleUpdateIssue}
        />

        <QuickActionsModal
          issue={selectedIssue}
          isOpen={showQuickActions}
          onClose={() => setShowQuickActions(false)}
          onUpdate={handleUpdateIssue}
        />
      </div>
    </div>
  );
}