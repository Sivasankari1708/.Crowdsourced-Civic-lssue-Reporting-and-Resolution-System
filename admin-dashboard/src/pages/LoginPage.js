import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));

    if (email === 'admin@civicapp.com' && password === 'admin123') {
      setSuccess('Login successful! Redirecting to dashboard...');
      
      // In a real app, you'd perform an API call here.
      // On success, call the onLoginSuccess prop.
      onLoginSuccess();
    } else {
      setError('Invalid email or password. Please try again.');
    }
  };

  // Variants for staggered children animations
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* Dynamic Background with a radial gradient for a fading glow effect */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, ease: "easeInOut" }}
        className="absolute inset-0 bg-[#860286]"
        style={{
          background: 'radial-gradient(ellipse at center, #e53385, #860286)',
        }}
      >
        {/* Animated Particles/Orbs with pulsating effect */}
        <div className="absolute inset-0 z-0">
          <motion.div
            animate={{ 
              x: ['0%', '100%', '0%'], 
              y: ['0%', '100%', '0%'], 
              scale: [1, 1.5, 1],
              rotate: [0, 180, 360],
              opacity: [0.3, 0.6, 0.3, 0.6, 0.3], // Pulsating opacity
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
              opacity: [0.2, 0.5, 0.2, 0.5, 0.2], // Pulsating opacity
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
              opacity: [0.4, 0.7, 0.4, 0.7, 0.4], // Pulsating opacity
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear", delay: 10 }}
            className="absolute w-20 h-20 bg-[#8C52FF] rounded-full blur-3xl opacity-40" 
            style={{ top: '60%', left: '30%' }}
          ></motion.div>
        </div>
        {/* Subtle geometric pattern or noise for texture */}
        <div className="absolute inset-0 bg-dots opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff33 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
      </motion.div>

      {/* The main login card with enhanced frosted glass and subtle glow */}
      <motion.div
        initial={{ y: -70, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 70, damping: 10 }}
        className="relative z-10 w-full max-w-lg p-10 space-y-8 bg-white/5 rounded-3xl shadow-3xl backdrop-blur-3xl border border-white/20 transform transition-all duration-300 hover:scale-[1.01] hover:shadow-glow"
      >
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="text-center"
        >
          {/* Logo with a more distinct, glowing appearance */}
          <motion.div
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ delay: 0.8, type: "spring", stiffness: 120, damping: 10 }}
            className="mb-6 flex justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="url(#gradient-icon)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-check drop-shadow-lg filter saturate-200">
              <defs>
                <linearGradient id="gradient-icon" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8C52FF" />
                  <stop offset="100%" stopColor="#6B0286" />
                </linearGradient>
              </defs>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/>
            </svg>
          </motion.div>

          <motion.h2 
            variants={itemVariants}
            className="text-5xl sm:text-6xl font-extrabold text-white leading-tight tracking-tight drop-shadow-xl"
          >
            Admin Login
          </motion.h2>
          <motion.p 
            variants={itemVariants}
            className="mt-2 text-lg text-white/70 drop-shadow-md font-light"
          >
            Civic Issue Resolution Portal
          </motion.p>
        </motion.div>

        <motion.form 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="mt-8 space-y-6" onSubmit={handleLogin}
        >
          <div className="rounded-md space-y-4">
            <motion.div variants={itemVariants}>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full px-5 py-4 text-gray-900 placeholder-gray-500 border-2 border-transparent rounded-xl focus:outline-none focus:ring-4 focus:ring-[#8C52FF] focus:border-[#8C52FF] text-lg transition duration-300 ease-in-out bg-white/90 hover:bg-white/100 shadow-inner-lg"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </motion.div>
            <motion.div variants={itemVariants} className="relative">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                className="relative block w-full pl-5 pr-12 py-4 text-gray-900 placeholder-gray-500 border-2 border-transparent rounded-xl focus:outline-none focus:ring-4 focus:ring-[#8C52FF] focus:border-[#8C52FF] text-lg transition duration-300 ease-in-out bg-white/90 hover:bg-white/100 shadow-inner-lg"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500 hover:text-gray-800 transition-colors duration-200"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye-off"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6 18a10.43 10.43 0 0 1-4-6c0-1.79 0-2.48.16-3"/><path d="M16.89 16.89l3.13 3.13L22 22"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </motion.div>
          </div>
          
          <motion.div variants={itemVariants} className="flex items-center justify-between text-white/80">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-5 w-5 text-[#8C52FF] focus:ring-[#8C52FF] border-gray-300 rounded transition-colors duration-200 cursor-pointer bg-white/20 checked:bg-[#8C52FF]"
              />
              <label htmlFor="remember-me" className="ml-2 block text-md">
                Remember me
              </label>
            </div>
            
            <div className="text-md">
              <a href="#" className="font-medium text-white/70 hover:text-[#8C52FF] transition-colors duration-200">
                Forgot password?
              </a>
            </div>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-red-300 bg-red-900/40 p-3 rounded-xl text-md text-center border border-red-500/70 backdrop-blur-sm"
            >
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-green-300 bg-green-900/40 p-3 rounded-xl text-md text-center border border-green-500/70 backdrop-blur-sm"
            >
              {success}
            </motion.div>
          )}

          <motion.div variants={itemVariants}>
            <button
              type="submit"
              className="group relative w-full flex items-center justify-center py-4 px-4 text-xl font-bold rounded-xl text-white bg-gradient-to-r from-[#8C52FF] to-[#6B0286] hover:from-[#6B0286] hover:to-[#8C52FF] focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-[#8C52FF] transform transition duration-400 ease-in-out hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl-glow"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-in mr-2 opacity-80 group-hover:opacity-100 transition-opacity"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>
              Sign In
            </button>
          </motion.div>
        </motion.form>
      </motion.div>
    </div>
  );
}
