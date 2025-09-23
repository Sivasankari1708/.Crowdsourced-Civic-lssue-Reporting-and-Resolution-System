import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

// Enhanced Card Component
function Card({ title, children, className = "", gradient = "from-blue-500 to-purple-600", icon, actions }) {
  return (
    <div className={`relative group ${className}`}>
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${gradient} rounded-xl blur opacity-60 group-hover:opacity-100 transition duration-300`}></div>
      <div className="relative bg-white rounded-xl shadow-lg border border-gray-200 group-hover:scale-[1.02] transition-transform duration-300">
        <div className="p-6">
          {title && (
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center">
                {icon && <span className="mr-2 text-xl">{icon}</span>}
                {title}
                <div className="ml-2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </h3>
              {actions && <div className="flex space-x-2">{actions}</div>}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}

// KPI Card Component
function KPICard({ title, value, change, icon, color, subtitle }) {
  return (
    <Card gradient={`from-${color}-400 to-${color}-600`} className="hover:shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-3xl font-bold text-${color}-600 mb-1`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          {change && (
            <div className="flex items-center mt-2">
              <span className={`text-sm font-semibold ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {change >= 0 ? '↗' : '↘'} {Math.abs(change)}%
              </span>
              <span className="text-xs text-gray-500 ml-1">vs last month</span>
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

// Time Period Selector
function TimePeriodSelector({ selectedPeriod, onPeriodChange }) {
  const periods = [
    { key: '7d', label: '7 Days' },
    { key: '30d', label: '30 Days' },
    { key: '90d', label: '3 Months' },
    { key: '1y', label: '1 Year' }
  ];

  return (
    <div className="flex bg-gray-100 rounded-lg p-1">
      {periods.map(period => (
        <button
          key={period.key}
          onClick={() => onPeriodChange(period.key)}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
            selectedPeriod === period.key 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
}

// Advanced Filter Component
function AdvancedFilters({ filters, onFiltersChange }) {
  return (
    <Card title="Analytics Filters" icon="🎛️" gradient="from-purple-500 to-indigo-600">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
          <select
            value={filters.department}
            onChange={(e) => onFiltersChange({...filters, department: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Departments</option>
            <option value="infrastructure">🏗️ Infrastructure</option>
            <option value="public-safety">🚨 Public Safety</option>
            <option value="environment">🌱 Environment</option>
            <option value="transportation">🚦 Transportation</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Priority Level</label>
          <select
            value={filters.priority}
            onChange={(e) => onFiltersChange({...filters, priority: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">🔥 Urgent</option>
            <option value="high">🚨 High</option>
            <option value="medium">⚠️ Medium</option>
            <option value="low">🟢 Low</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            value={filters.status}
            onChange={(e) => onFiltersChange({...filters, status: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="reported">🆕 Reported</option>
            <option value="in-progress">⚡ In Progress</option>
            <option value="resolved">✅ Resolved</option>
            <option value="closed">🔒 Closed</option>
          </select>
        </div>
      </div>
    </Card>
  );
}

// Performance Metrics Component
function PerformanceMetrics({ data }) {
  return (
    <Card title="Performance Metrics" icon="🎯" gradient="from-green-500 to-emerald-600">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{data.avgResponseTime || '2.3h'}</div>
          <div className="text-sm text-blue-800">Avg Response Time</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{data.resolutionRate || '87%'}</div>
          <div className="text-sm text-green-800">Resolution Rate</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{data.citizenSatisfaction || '4.2★'}</div>
          <div className="text-sm text-purple-800">Citizen Rating</div>
        </div>
        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{data.costEfficiency || '$1.2K'}</div>
          <div className="text-sm text-orange-800">Avg Cost/Issue</div>
        </div>
      </div>
    </Card>
  );
}

// Heatmap Component
function HeatmapAnalysis({ data }) {
  const heatmapData = [
    { area: 'Downtown', hour: '9AM', intensity: 85 },
    { area: 'Downtown', hour: '12PM', intensity: 95 },
    { area: 'Downtown', hour: '3PM', intensity: 90 },
    { area: 'Downtown', hour: '6PM', intensity: 75 },
    { area: 'Residential', hour: '9AM', intensity: 45 },
    { area: 'Residential', hour: '12PM', intensity: 55 },
    { area: 'Residential', hour: '3PM', intensity: 65 },
    { area: 'Residential', hour: '6PM', intensity: 85 },
    { area: 'Industrial', hour: '9AM', intensity: 65 },
    { area: 'Industrial', hour: '12PM', intensity: 45 },
    { area: 'Industrial', hour: '3PM', intensity: 35 },
    { area: 'Industrial', hour: '6PM', intensity: 25 },
  ];

  const getHeatColor = (intensity) => {
    if (intensity >= 80) return 'bg-red-500';
    if (intensity >= 60) return 'bg-orange-500';
    if (intensity >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <Card title="Issue Intensity Heatmap" icon="🔥" gradient="from-red-500 to-pink-600">
      <div className="grid grid-cols-4 gap-2">
        <div className="font-semibold text-gray-600 text-sm p-2">Area / Time</div>
        <div className="font-semibold text-gray-600 text-sm p-2 text-center">9AM</div>
        <div className="font-semibold text-gray-600 text-sm p-2 text-center">12PM</div>
        <div className="font-semibold text-gray-600 text-sm p-2 text-center">3PM</div>
        
        {['Downtown', 'Residential', 'Industrial'].map(area => (
          <React.Fragment key={area}>
            <div className="font-medium text-gray-700 text-sm p-2">{area}</div>
            {['9AM', '12PM', '3PM'].map(hour => {
              const dataPoint = heatmapData.find(d => d.area === area && d.hour === hour);
              return (
                <div
                  key={`${area}-${hour}`}
                  className={`${getHeatColor(dataPoint?.intensity || 0)} text-white text-xs font-bold p-3 rounded text-center opacity-80 hover:opacity-100 transition-opacity cursor-pointer`}
                  title={`${area} at ${hour}: ${dataPoint?.intensity || 0}% activity`}
                >
                  {dataPoint?.intensity || 0}%
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </Card>
  );
}

// Trend Analysis Component
function TrendAnalysis({ data }) {
  return (
    <Card title="Trend Analysis & Forecasting" icon="📈" gradient="from-indigo-500 to-purple-600">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">↗ 15%</div>
                <div className="text-sm text-blue-800">Issue Volume Trend</div>
              </div>
              <div className="text-3xl text-blue-400">📊</div>
            </div>
            <div className="text-xs text-blue-600 mt-2">Increasing compared to last quarter</div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">↗ 23%</div>
                <div className="text-sm text-green-800">Resolution Speed</div>
              </div>
              <div className="text-3xl text-green-400">⚡</div>
            </div>
            <div className="text-xs text-green-600 mt-2">Faster resolution times</div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-600">↗ 8%</div>
                <div className="text-sm text-purple-800">Citizen Engagement</div>
              </div>
              <div className="text-3xl text-purple-400">👥</div>
            </div>
            <div className="text-xs text-purple-600 mt-2">More active participation</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">🔮 Predictive Insights</h4>
          <div className="text-sm text-gray-700 space-y-1">
            <p>• Peak issue reporting expected in downtown area during lunch hours</p>
            <p>• Infrastructure issues likely to increase by 12% next month</p>
            <p>• Optimal resource allocation: 3 teams for morning shift</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Export Component
function ExportOptions({ onExport }) {
  const exportTypes = [
    { type: 'pdf', label: '📄 PDF Report', color: 'red' },
    { type: 'excel', label: '📊 Excel Data', color: 'green' },
    { type: 'csv', label: '📋 CSV Export', color: 'blue' },
    { type: 'json', label: '🔗 JSON API', color: 'purple' }
  ];

  return (
    <Card title="Export Analytics" icon="💾" gradient="from-teal-500 to-cyan-600">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {exportTypes.map(exp => (
          <button
            key={exp.type}
            onClick={() => onExport(exp.type)}
            className={`bg-gradient-to-r from-${exp.color}-500 to-${exp.color}-600 text-white p-3 rounded-lg hover:from-${exp.color}-600 hover:to-${exp.color}-700 transition-all duration-300 text-sm font-semibold transform hover:scale-105`}
          >
            {exp.label}
          </button>
        ))}
      </div>
      <div className="mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
        <p>💡 <strong>Pro Tip:</strong> Schedule automated reports to be sent weekly to your email</p>
      </div>
    </Card>
  );
}

// Main Analytics Page Component
export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [filters, setFilters] = useState({
    department: 'all',
    priority: 'all',
    status: 'all'
  });

  const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Enhanced fallback data
  const getFallbackData = () => ({
    reportsByCategory: [
      { name: 'Potholes', reports: 85, resolved: 65, pending: 20 },
      { name: 'Street Lights', reports: 62, resolved: 55, pending: 7 },
      { name: 'Waste Management', reports: 45, resolved: 40, pending: 5 },
      { name: 'Graffiti', reports: 28, resolved: 25, pending: 3 },
      { name: 'Traffic Signals', reports: 35, resolved: 30, pending: 5 },
      { name: 'Noise Complaints', reports: 22, resolved: 18, pending: 4 }
    ],
    reportsOverTime: [
      { name: 'Jan', reports: 45, resolved: 42, inProgress: 3 },
      { name: 'Feb', reports: 52, resolved: 48, inProgress: 4 },
      { name: 'Mar', reports: 58, resolved: 52, inProgress: 6 },
      { name: 'Apr', reports: 48, resolved: 45, inProgress: 3 },
      { name: 'May', reports: 65, resolved: 58, inProgress: 7 },
      { name: 'Jun', reports: 72, resolved: 68, inProgress: 4 },
      { name: 'Jul', reports: 68, resolved: 64, inProgress: 4 }
    ],
    departmentalResponse: [
      { name: 'Resolved', value: 275, percentage: 78.4 },
      { name: 'In Progress', value: 45, percentage: 12.8 },
      { name: 'Pending', value: 31, percentage: 8.8 }
    ],
    performanceData: {
      avgResponseTime: '2.3h',
      resolutionRate: '87%',
      citizenSatisfaction: '4.2★',
      costEfficiency: '$1.2K'
    },
    departmentRadar: [
      { department: 'Infrastructure', efficiency: 85, satisfaction: 78, cost: 65 },
      { department: 'Public Safety', efficiency: 92, satisfaction: 88, cost: 70 },
      { department: 'Environment', efficiency: 78, satisfaction: 82, cost: 85 },
      { department: 'Transportation', efficiency: 88, satisfaction: 75, cost: 60 }
    ]
  });

  useEffect(() => {
    // Simulate API call with enhanced data
    setTimeout(() => {
      setAnalyticsData(getFallbackData());
      setIsLoading(false);
    }, 1000);
  }, [selectedPeriod, filters]);

  const handleExport = (type) => {
    console.log(`Exporting analytics as ${type}`);
    // Implement export functionality
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-700">Loading Analytics...</h2>
          <p className="text-gray-500">Crunching the numbers for you</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center">
              📊 Advanced Analytics
              <span className="ml-3 w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
            </h1>
            <p className="text-gray-600">Comprehensive insights and performance metrics</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <TimePeriodSelector 
              selectedPeriod={selectedPeriod}
              onPeriodChange={setSelectedPeriod}
            />
            <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all">
              📧 Schedule Report
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard 
            title="Total Issues"
            value="1,247"
            change={15}
            icon="📋"
            color="blue"
            subtitle="This month"
          />
          <KPICard 
            title="Resolution Rate"
            value="87%"
            change={5}
            icon="✅"
            color="green"
            subtitle="Target: 85%"
          />
          <KPICard 
            title="Avg Response"
            value="2.3h"
            change={-12}
            icon="⚡"
            color="purple"
            subtitle="Hours to first response"
          />
          <KPICard 
            title="Satisfaction"
            value="4.2★"
            change={8}
            icon="🌟"
            color="orange"
            subtitle="Citizen rating"
          />
        </div>

        {/* Filters */}
        <div className="mb-8">
          <AdvancedFilters filters={filters} onFiltersChange={setFilters} />
        </div>

        {/* Performance Metrics */}
        <div className="mb-8">
          <PerformanceMetrics data={analyticsData.performanceData} />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* Enhanced Bar Chart */}
          <Card title="Issues by Category" icon="📊" gradient="from-blue-500 to-indigo-600"
                actions={[
                  <button key="toggle" className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded">
                    Toggle View
                  </button>
                ]}>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={analyticsData.reportsByCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{fontSize: 12}} />
                <YAxis />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="reports" fill="#3b82f6" name="Total Reports" />
                <Bar dataKey="resolved" fill="#10b981" name="Resolved" />
                <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Enhanced Line Chart */}
          <Card title="Trends Over Time" icon="📈" gradient="from-green-500 to-emerald-600">
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={analyticsData.reportsOverTime}>
                <defs>
                  <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="reports" stroke="#3b82f6" fillOpacity={1} fill="url(#colorReports)" />
                <Area type="monotone" dataKey="resolved" stroke="#10b981" fillOpacity={1} fill="url(#colorResolved)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Enhanced Pie Chart */}
          <Card title="Status Distribution" icon="🥧" gradient="from-purple-500 to-pink-600">
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={analyticsData.departmentalResponse}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({name, percentage}) => `${name} (${percentage}%)`}
                >
                  {analyticsData.departmentalResponse?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} issues`, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Department Performance Radar */}
          <Card title="Department Performance" icon="🎯" gradient="from-orange-500 to-red-600">
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={analyticsData.departmentRadar}>
                <PolarGrid />
                <PolarAngleAxis dataKey="department" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="Efficiency" dataKey="efficiency" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                <Radar name="Satisfaction" dataKey="satisfaction" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                <Radar name="Cost Effectiveness" dataKey="cost" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Advanced Analysis Row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          <HeatmapAnalysis />
          <TrendAnalysis />
        </div>

        {/* Export Options */}
        <ExportOptions onExport={handleExport} />
      </div>
    </div>
  );
}