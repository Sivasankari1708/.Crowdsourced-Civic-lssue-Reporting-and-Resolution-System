import React, { useState, useEffect } from 'react';

// Enhanced Card component with gradient borders and hover effects
function Card({ title, children, className, gradient = "from-blue-500 to-purple-600", icon }) {
  return (
    <div className={`relative group ${className}`}>
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${gradient} rounded-2xl blur opacity-60 group-hover:opacity-80 transition duration-300`}></div>
      <div className="relative bg-white/95 backdrop-blur-xl p-6 rounded-2xl shadow-xl transform transition-all duration-300 hover:scale-[1.02] border border-white/20">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
          {icon && <span className="mr-2 text-xl">{icon}</span>}
          {title}
          <div className="ml-auto w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        </h3>
        {children}
      </div>
    </div>
  );
}

// Statistics card with animated counters
function StatCard({ title, value, icon, color, trend, onClick, isSelected }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      let current = 0;
      const increment = value / 30;
      const counter = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(counter);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, 30);
    }, 200);
    
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <Card 
      className={`cursor-pointer ${isSelected ? 'ring-2 ring-white/40' : ''}`} 
      gradient={`from-${color}-400 to-${color}-600`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-3xl font-bold text-${color}-600 mb-2`}>{displayValue}</p>
          {trend && (
            <div className="flex items-center text-sm">
              <span className={`text-${trend > 0 ? 'green' : 'red'}-500 font-semibold`}>
                {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
              </span>
              <span className="text-gray-500 ml-1">this week</span>
            </div>
          )}
        </div>
        <div className={`text-5xl opacity-20 text-${color}-600`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

// Simplified Search Component
function SearchAndFilter({ onSearch, onFilter }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const handleSearch = (value) => {
    setSearchTerm(value);
    onSearch(value);
  };

  const handleStatusFilter = (status) => {
    setSelectedStatus(status);
    onFilter({ status });
  };

  return (
    <Card title="Search & Filter" icon="🔍" gradient="from-cyan-500 to-blue-600">
      <div className="space-y-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search reports, locations..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full p-3 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
          <span className="absolute right-3 top-3 text-gray-400">🔍</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {['all', 'new', 'urgent', 'resolved'].map(status => (
            <button
              key={status}
              onClick={() => handleStatusFilter(status)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedStatus === status 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status === 'all' ? '🔄 All' : 
                status === 'new' ? '🆕 New' :
                status === 'urgent' ? '🚨 Urgent' : '✅ Resolved'}
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}

// Simplified Interactive Map
function InteractiveMap() {
  const [selectedRegion, setSelectedRegion] = useState(null);
  
  const regions = [
    { id: 1, name: 'Downtown', issues: 23, severity: 'high', x: 30, y: 40 },
    { id: 2, name: 'Residential', issues: 15, severity: 'medium', x: 60, y: 25 },
    { id: 3, name: 'Industrial', issues: 8, severity: 'low', x: 20, y: 70 },
    { id: 4, name: 'Park District', issues: 12, severity: 'medium', x: 75, y: 65 }
  ];

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card title="City Overview" icon="🗺️" gradient="from-emerald-500 to-teal-600">      
      <div className="relative bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-4 h-64">
        {regions.map(region => (
          <div
            key={region.id}
            className={`absolute w-4 h-4 ${getSeverityColor(region.severity)} rounded-full cursor-pointer transform -translate-x-1/2 -translate-y-1/2 hover:scale-150 transition-all duration-200 animate-pulse`}
            style={{ left: `${region.x}%`, top: `${region.y}%` }}
            onClick={() => setSelectedRegion(region)}
            title={`${region.name}: ${region.issues} issues`}
          />
        ))}
        
        {selectedRegion && (
          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-white/30">
            <h4 className="font-bold text-gray-800">{selectedRegion.name}</h4>
            <p className="text-sm text-gray-600">{selectedRegion.issues} active issues</p>
            <p className="text-xs text-gray-500 capitalize">Priority: {selectedRegion.severity}</p>
          </div>
        )}
        
        <div className="absolute top-2 right-2 flex items-center space-x-2 text-xs">
          <div className="flex items-center"><div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>High</div>
          <div className="flex items-center"><div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>Medium</div>
          <div className="flex items-center"><div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>Low</div>
        </div>
      </div>
    </Card>
  );
}

// Simplified Resource Manager
function ResourceManager() {
  const resources = [
    { id: 1, name: 'Emergency Team A', status: 'available', location: 'Central' },
    { id: 2, name: 'Maintenance Crew', status: 'deployed', location: 'Downtown' },
    { id: 3, name: 'Traffic Control', status: 'available', location: 'North District' },
    { id: 4, name: 'Environmental Team', status: 'maintenance', location: 'Base' }
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'deployed': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card title="Teams & Resources" icon="👥" gradient="from-orange-500 to-red-600">
      <div className="space-y-3">
        {resources.map(resource => (
          <div key={resource.id} className="bg-white/80 rounded-lg p-3 border border-gray-100 hover:shadow-md transition-all">
            <div className="flex justify-between items-center mb-1">
              <h4 className="font-medium text-gray-800 text-sm">{resource.name}</h4>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(resource.status)}`}>
                {resource.status}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-600">
              <span>📍 {resource.location}</span>
              <button className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600">
                Deploy
              </button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// Notification System
function NotificationCenter({ notifications, onMarkAsRead, onClearAll }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm border border-white/30"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 z-50">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">Notifications</h3>
            <button 
              onClick={onClearAll}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear All
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.map((notification, index) => (
              <div 
                key={index}
                className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                onClick={() => onMarkAsRead(index)}
              >
                <div className="flex items-start">
                  <span className="mr-2 text-lg">{notification.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{notification.message}</p>
                    <p className="text-xs text-gray-500">{notification.time}</p>
                  </div>
                  {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Main Dashboard Component
export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [notifications, setNotifications] = useState([
    { message: 'Critical infrastructure alert downtown', icon: '🚨', time: '2 min ago', read: false },
    { message: 'Street maintenance completed', icon: '✅', time: '1 hour ago', read: false },
    { message: 'Team deployment successful', icon: '👥', time: '2 hours ago', read: true }
  ]);
  const [liveFeedMessages, setLiveFeedMessages] = useState([]);

  // Generate realistic data
  const generateRealisticData = () => {
    return {
      summary: { 
        newReports: Math.floor(Math.random() * 30) + 15, 
        inProgress: Math.floor(Math.random() * 20) + 8, 
        resolved: Math.floor(Math.random() * 60) + 30, 
        totalReports: 0 
      }
    };
  };

  useEffect(() => {
    setTimeout(() => {
      const data = generateRealisticData();
      data.summary.totalReports = 
        data.summary.newReports + 
        data.summary.inProgress + 
        data.summary.resolved;
      setDashboardData(data);
      setIsLoading(false);
    }, 1500);
      
    // Live updates
    const liveUpdates = [
      { text: '🔥 Pothole repair completed on Main Street', type: 'completed' },
      { text: '⚡ Traffic light maintenance scheduled', type: 'scheduled' },
      { text: '👤 New citizen report received', type: 'new' },
      { text: '✅ Park cleanup project finished', type: 'completed' },
      { text: '🚨 Emergency team responding to call', type: 'emergency' }
    ];

    let updateIndex = 0;
    const interval = setInterval(() => {
      const newUpdate = { 
        ...liveUpdates[updateIndex % liveUpdates.length], 
        id: Date.now(), 
        time: 'just now',
        isNew: true 
      };
      setLiveFeedMessages(prev => {
        const updated = [newUpdate, ...prev.map(msg => ({ ...msg, isNew: false }))];
        return updated.slice(0, 8);
      });
      updateIndex++;
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleSearch = (searchTerm) => {
    console.log('Searching for:', searchTerm);
  };

  const handleFilter = (filters) => {
    setSelectedFilter(filters.status);
  };

  const handleMarkAsRead = (index) => {
    setNotifications(prev => prev.map((notif, i) => 
      i === index ? { ...notif, read: true } : notif
    ));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-white mb-2">Loading Dashboard</h2>
          <p className="text-purple-200">Please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative">
      {/* Subtle background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
      </div>

      <div className="relative z-10 p-6">
        {/* Clean Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-4xl font-bold text-white mb-2">
              🏢 Civic Dashboard
            </h1>
            <p className="text-purple-200">City management simplified</p>
          </div>
          <div className="flex items-center gap-3">
            <NotificationCenter 
              notifications={notifications}
              onMarkAsRead={handleMarkAsRead}
              onClearAll={handleClearAllNotifications}
            />
            <button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-2 px-4 rounded-full transition-all duration-300 text-sm">
              📊 Reports
            </button>
          </div>
        </div>

        {/* Statistics - Clean Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="New Reports" 
            value={dashboardData?.summary?.newReports || 0} 
            icon="📋"
            color="blue"
            trend={12}
            isSelected={selectedFilter === 'new'}
            onClick={() => handleFilter({ status: 'new' })}
          />
          <StatCard 
            title="In Progress" 
            value={dashboardData?.summary?.inProgress || 0} 
            icon="⚡"
            color="yellow"
            trend={-5}
            isSelected={selectedFilter === 'inProgress'}
            onClick={() => handleFilter({ status: 'inProgress' })}
          />
          <StatCard 
            title="Resolved" 
            value={dashboardData?.summary?.resolved || 0} 
            icon="✅"
            color="green"
            trend={23}
            isSelected={selectedFilter === 'resolved'}
            onClick={() => handleFilter({ status: 'resolved' })}
          />
          <StatCard 
            title="Total Reports" 
            value={dashboardData?.summary?.totalReports || 0} 
            icon="📊"
            color="purple"
            trend={8}
            isSelected={selectedFilter === 'all'}
            onClick={() => handleFilter({ status: 'all' })}
          />
        </div>
        
        {/* Main Content - Simplified Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SearchAndFilter onSearch={handleSearch} onFilter={handleFilter} />
          <InteractiveMap />
          <ResourceManager />
        </div>

        {/* Live Feed - Clean Design */}
        <div className="mt-6">
          <Card title="Live Updates" gradient="from-red-500 to-pink-600" icon="📡">
            <div className="h-64 overflow-y-auto">
              {liveFeedMessages.map((message, index) => (
                <div 
                  key={message.id || index}
                  className={`p-3 rounded-lg mb-2 transition-all duration-300 ${
                    message.isNew ? 'bg-blue-50 border-l-4 border-blue-500' : 'bg-gray-50'
                  }`}
                >
                  <p className="text-gray-800 font-medium text-sm">{message.text}</p>
                  <span className="text-xs text-gray-500">{message.time}</span>
                </div>
              ))}
              {liveFeedMessages.length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500 text-center">
                    <span className="text-3xl mb-2 block">📡</span>
                    Monitoring for updates...
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}