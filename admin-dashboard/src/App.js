import IssuesPage from './pages/IssuesPage';
import AnalyticsPage from './pages/AnalyticsPage';
import DashboardPage from './pages/DashboardPage';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';


const App = () => {


  // State hooks - All hooks must be at the top level of the component
  const [isAuthReady, setIsAuthReady] = useState(true);
  const [currentPage, setCurrentPage] = useState('login');
  const [userId, setUserId] = useState(null);
  const [issues, setIssues] = useState([
    { id: 1, description: 'Pothole on Main Street', status: 'Pending' },
    { id: 2, description: 'Streetlight not working', status: 'Resolved' }
  ]);
  const [loading, setLoading] = useState(false);
  const [newIssue, setNewIssue] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Dummy authentication logic
  const DUMMY_EMAIL = 'admin@civicapp.com';
  const DUMMY_PASSWORD = 'admin123';

  // No backend fetching, issues are local only

  // Handler functions
  const handleLogout = () => {
    setUserId(null);
    setCurrentPage('login');
  };

  const handleAddIssue = (e) => {
    e.preventDefault();
    if (!newIssue.trim()) return;
    setIssues(prev => ([
      ...prev,
      { id: Date.now(), description: newIssue, status: 'Pending' }
    ]));
    setNewIssue('');
  };

  const handleDeleteIssue = (id) => {
    setIssues(prev => prev.filter(issue => issue.id !== id));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginSuccess('');
    if (email === DUMMY_EMAIL && password === DUMMY_PASSWORD) {
      setUserId('dummy-user');
      setLoginSuccess('Login successful! Redirecting to dashboard...');
      setTimeout(() => setCurrentPage('dashboard'), 1000);
    } else {
      setLoginError('Invalid email or password.');
      setLoginSuccess('');
    }
  };

  // Rendering Functions (now stateless)


  const renderIssuesPage = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-8 text-white min-h-screen bg-transparent"
    >
      <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 drop-shadow-lg">Civic Issues</h1>
      <p className="text-white/80 text-lg">
        Manage and track civic issues reported by the community.
      </p>
      <form onSubmit={handleAddIssue} className="flex gap-4 mt-6">
        <input
          type="text"
          value={newIssue}
          onChange={(e) => setNewIssue(e.target.value)}
          placeholder="Enter a new civic issue..."
          className="flex-grow px-5 py-3 text-gray-900 placeholder-gray-500 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#8C52FF] bg-white/90 shadow-inner-lg"
        />
        <button
          type="submit"
          className="bg-gradient-to-r from-[#8C52FF] to-[#6B0286] text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:scale-105 transition-transform duration-300"
        >
          Add Issue
        </button>
      </form>
      <div className="mt-8 space-y-4">
        {loading && <p>Loading issues...</p>}
        {!loading && issues.length === 0 && <p>No issues found.</p>}
        {issues.map((issue) => (
          <div key={issue.id} className="bg-white/10 rounded-2xl p-4 flex justify-between items-center backdrop-blur-sm border border-white/20 shadow-lg">
            <p className="text-lg">{issue.description}</p>
            <button
              onClick={() => handleDeleteIssue(issue.id)}
              className="text-red-400 hover:text-red-600 transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );

  const renderAnalyticsPage = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-8 text-white min-h-screen bg-transparent"
    >
      <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 drop-shadow-lg">Data Analytics</h1>
      <p className="text-white/80 text-lg">
        Visualize key metrics and trends for civic issues.
      </p>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/20 shadow-lg">
          <h3 className="text-2xl font-bold mb-2">Issues by Category</h3>
          <p className="text-white/70">A placeholder chart showing issue categories.</p>
        </div>
        <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/20 shadow-lg">
          <h3 className="text-2xl font-bold mb-2">Resolution Time</h3>
          <p className="text-white/70">A placeholder chart showing average resolution time.</p>
        </div>
      </div>
    </motion.div>
  );

  const renderLayout = (children) => {
    return (
      <div className="flex flex-col md:flex-row min-h-screen font-sans bg-[#1a001a]">
        <aside className="w-full md:w-64 bg-white/5 backdrop-blur-lg border-b md:border-r border-white/20 p-6 flex flex-col items-center shadow-2xl">
          <div className="flex flex-col items-center mb-10">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 150 }}
              className="mb-4"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="url(#gradient-icon)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-check drop-shadow-lg filter saturate-200">
                <defs>
                  <linearGradient id="gradient-icon" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8C52FF" />
                    <stop offset="100%" stopColor="#6B0286" />
                  </linearGradient>
                </defs>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="m9 12 2 2 4-4" />
              </svg>
            </motion.div>
            <h2 className="text-3xl font-extrabold text-white text-center leading-tight drop-shadow-lg">
              Civic Portal
            </h2>
          </div>
          <nav className="w-full">
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => setCurrentPage('dashboard')}
                  className={`w-full flex items-center px-4 py-3 rounded-xl transition-colors duration-200 ${
                    currentPage === 'dashboard'
                      ? 'bg-gradient-to-r from-[#8C52FF] to-[#6B0286] text-white shadow-lg transform scale-[1.02]'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m0 0l-7 7m7-7v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage('issues')}
                  className={`w-full flex items-center px-4 py-3 rounded-xl transition-colors duration-200 ${
                    currentPage === 'issues'
                      ? 'bg-gradient-to-r from-[#8C52FF] to-[#6B0286] text-white shadow-lg transform scale-[1.02]'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Issues
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage('analytics')}
                  className={`w-full flex items-center px-4 py-3 rounded-xl transition-colors duration-200 ${
                    currentPage === 'analytics'
                      ? 'bg-gradient-to-r from-[#8C52FF] to-[#6B0286] text-white shadow-lg transform scale-[1.02]'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2zm7-2v8a2 2 0 01-2 2h-2a2 2 0 01-2-2v-8m5 0a2 2 0 012-2h2a2 2 0 012 2v8a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Analytics
                </button>
              </li>
            </ul>
          </nav>
          <div className="mt-auto w-full">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center py-3 px-4 rounded-xl text-white bg-red-600/70 hover:bg-red-700/80 transition-colors duration-200 shadow-md transform hover:scale-105"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </aside>
        <main className="flex-1 p-0 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    );
  };

  const renderLoginPage = () => {
    const containerVariants = {
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1,
        },
      },
    };

    const itemVariants = {
      hidden: { opacity: 0, y: 20 },
      show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
    };

    return (
      <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
          className="absolute inset-0 bg-[#860286]"
          style={{
            background: 'radial-gradient(ellipse at center, #e53385, #860286)',
          }}
        >
          <div className="absolute inset-0 z-0">
            <motion.div
              animate={{
                x: ['0%', '100%', '0%'],
                y: ['0%', '100%', '0%'],
                scale: [1, 1.5, 1],
                rotate: [0, 180, 360],
                opacity: [0.3, 0.6, 0.3, 0.6, 0.3],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute w-24 h-24 bg-[#FF00A2] rounded-full blur-3xl opacity-30"
              style={{ top: '15%', left: '10%' }}
            ></motion.div>
            <motion.div
              animate={{
                x: ['100%', '0%', '100%'],
                y: ['100%', '0%', '100%'],
                scale: [1, 1.2, 1],
                rotate: [0, -180, -360],
                opacity: [0.2, 0.5, 0.2, 0.5, 0.2],
              }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 5 }}
              className="absolute w-32 h-32 bg-[#FF00A2] rounded-full blur-3xl opacity-20"
              style={{ bottom: '20%', right: '5%' }}
            ></motion.div>
            <motion.div
              animate={{
                x: ['0%', '50%', '0%'],
                y: ['50%', '0%', '50%'],
                scale: [1, 1.3, 1],
                rotate: [0, 90, 180],
                opacity: [0.4, 0.7, 0.4, 0.7, 0.4],
              }}
              transition={{ duration: 18, repeat: Infinity, ease: "linear", delay: 10 }}
              className="absolute w-20 h-20 bg-[#8C52FF] rounded-full blur-3xl opacity-40"
              style={{ top: '60%', left: '30%' }}
            ></motion.div>
          </div>
          <div className="absolute inset-0 bg-dots opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff33 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        </motion.div>
        <motion.div
          initial={{ y: -70, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 70, damping: 10 }}
          className="relative z-10 w-full max-w-sm p-8 space-y-6 bg-white/5 rounded-3xl shadow-3xl backdrop-blur-3xl border border-white/20 transform transition-all duration-300 hover:scale-[1.01] hover:shadow-glow"
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 120, damping: 10 }}
              className="mb-4 flex justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="url(#gradient-icon)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-check drop-shadow-lg filter saturate-200">
                <defs>
                  <linearGradient id="gradient-icon" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8C52FF" />
                    <stop offset="100%" stopColor="#6B0286" />
                  </linearGradient>
                </defs>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="m9 12 2 2 4-4" />
              </svg>
            </motion.div>
            <motion.h2
              variants={itemVariants}
              className="text-3xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight drop-shadow-xl"
            >
              Welcome Back!
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="mt-1 text-base text-white/70 drop-shadow-md font-light"
            >
              Civic Issue Resolution Portal
            </motion.p>
          </motion.div>
          <motion.form
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="mt-6 space-y-4" onSubmit={handleLogin}
          >
            <motion.div variants={itemVariants} className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@civicapp.com"
                className="w-full px-5 py-3 pl-12 text-gray-900 placeholder-gray-500 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#8C52FF] bg-white/90 shadow-inner-lg transition-all duration-300"
              />
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
            </motion.div>
            <motion.div variants={itemVariants} className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="admin123"
                className="w-full px-5 py-3 pl-12 text-gray-900 placeholder-gray-500 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#8C52FF] bg-white/90 shadow-inner-lg transition-all duration-300"
              />
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15a3 3 0 100-6 3 3 0 000 6z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6c3.418 0 6.643 1.458 9 4a14.9 14.9 0 01-3.693 4.237M3 10a14.9 14.9 0 013.693 4.237" /></svg>
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.87 13.87a2 2 0 11-2.83-2.83m.03-3.13a9 9 0 0113.89 0m-13.89 0a9 9 0 00-13.89 0m7.56-4.94a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm-1.5 6a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12.025l1.09 2.05L5 15l2.458 2.025 1.09-2.05L12 14l2.458-2.025-1.09-2.05L17 9l-2.458-2.025-1.09 2.05L12 10l-2.458 2.025-1.09-2.05z" /></svg>
                )}
              </button>
            </motion.div>
            <motion.div variants={itemVariants} className="flex justify-between items-center text-sm">
              <div className="flex items-center">
                <input type="checkbox" id="remember-me" className="form-checkbox text-[#8C52FF] rounded border-gray-300" />
                <label htmlFor="remember-me" className="ml-2 text-white/70">Remember me</label>
              </div>
              <button className="text-white/70 hover:text-white transition-colors duration-200">Forgot password?</button>
            </motion.div>

            {loginError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-red-300 bg-red-900/40 p-3 rounded-xl text-md text-center border border-red-500/70 backdrop-blur-sm"
              >
                {loginError}
              </motion.div>
            )}
            {loginSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-green-300 bg-green-900/40 p-3 rounded-xl text-md text-center border border-green-500/70 backdrop-blur-sm"
              >
                {loginSuccess}
              </motion.div>
            )}

            <motion.div variants={itemVariants}>
              <button
                type="submit"
                className="group relative w-full flex items-center justify-center py-4 px-4 text-xl font-bold rounded-xl text-white bg-gradient-to-r from-[#8C52FF] to-[#6B0286] hover:from-[#6B0286] hover:to-[#8C52FF] focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-[#8C52FF] transform transition duration-400 ease-in-out hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl-glow"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-in mr-2 opacity-80 group-hover:opacity-100 transition-opacity"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" x2="3" y1="12" y2="12" /></svg>
                Sign In
              </button>
            </motion.div>
          </motion.form>
        </motion.div>
      </div>
    );
  };

  const renderPage = () => {
    if (!isAuthReady) {
      return (
        <div className="min-h-screen flex items-center justify-center text-white text-xl">
          <p>Initializing application...</p>
        </div>
      );
    }
    switch (currentPage) {
      case 'dashboard':
        return renderLayout(<DashboardPage />);
      case 'issues':
        return renderLayout(<IssuesPage />);
      case 'analytics':
        return renderLayout(<AnalyticsPage />);
      case 'login':
        return renderLoginPage();
      default:
        return <div className="min-h-screen flex items-center justify-center text-white text-xl">
          <p>404 Page Not Found</p>
        </div>;
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        body {
          font-family: 'Inter', sans-serif;
          background-color: #1a001a;
        }
        .shadow-3xl {
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), 0 0 100px rgba(140, 82, 255, 0.3);
        }
        .shadow-inner-lg {
          box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
        }
        .shadow-glow {
          box-shadow: 0 0 40px rgba(140, 82, 255, 0.6), 0 0 20px rgba(255, 0, 162, 0.5);
        }
        .hover\\:shadow-xl-glow:hover {
          box-shadow: 0 0 60px rgba(140, 82, 255, 0.8), 0 0 30px rgba(255, 0, 162, 0.7);
        }
        .bg-dots {
          background-image: radial-gradient(#ffffff33 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
      <script src="https://cdn.tailwindcss.com"></script>
      <AnimatePresence mode="wait">
        {renderPage()}
      </AnimatePresence>
    </>
  );
};

export default App;
