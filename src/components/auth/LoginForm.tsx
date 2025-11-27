import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Loader } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const LoginForm: React.FC = () => {
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  // Signup fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('agent');
  // State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, signup, loginError, signupError } = useAuth();

  // Always show error from context, localStorage, or backend
  useEffect(() => {
    // Only show error if loginError is set and not logged in
    if (loginError && !isLoading && !loginEmail && !loginPassword) {
      setError(loginError);
    } else {
      setError('');
    }
  }, [loginError, isLoading, loginEmail, loginPassword]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const success = await login(loginEmail, loginPassword);
      // Always show error from context, localStorage, or backend
      const lastError = loginError || localStorage.getItem('penny-count-login-error') || 'Invalid credentials.';
      if (!success) {
        setError(lastError);
      } else {
        setError('');
        window.location.href = '/';
      }
    } catch (err: any) {
      setError(err?.message || loginError || localStorage.getItem('penny-count-login-error') || 'Login failed.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const success = await signup({ name, email, phone, password, role });
      if (!success) {
        setError(signupError || 'Sign up failed. Email may already exist.');
      } else {
        setError('');
        // Show success message and prompt to login
        alert('Sign up successful! Please log in using your credentials.');
        setTab('login');
      }
    } catch {
      setError('Sign up failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Shield className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Penny Count</h1>
          <p className="text-gray-600">Secure micro-lending management</p>
        </div>
        <div className="flex mb-6">
          <button
            onClick={() => setTab('login')}
            className={`flex-1 py-2 font-medium rounded-l-lg ${
              tab === 'login'
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setTab('signup')}
            className={`flex-1 py-2 font-medium rounded-r-lg ${
              tab === 'signup'
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Sign Up
          </button>
        </div>
        {tab === 'login' ? (
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-2">
                Email or Phone
              </label>
              <input
                id="login-email"
                name="email"
                type="text"
                autoComplete="username"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                required
              />
            </div>
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                required
              />
            </div>
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}
            {/* Add forgot password link */}
            {tab === 'login' && (
              <div className="text-right mb-2">
                <button
                  type="button"
                  className="text-emerald-600 hover:underline text-sm font-medium"
                  onClick={() => alert('Forgot password feature coming soon!')}
                >
                  Forgot password?
                </button>
              </div>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-500 text-white py-3 rounded-lg font-medium hover:bg-emerald-600 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <span>Login</span>
              )}
            </button>
          </form>
        ) : (
          <form className="space-y-6" onSubmit={handleSignup}>
            <div>
              <label htmlFor="signup-name" className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                id="signup-name"
                name="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                required
              />
            </div>
            <div>
              <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="signup-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                required
              />
            </div>
            <div>
              <label htmlFor="signup-phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                id="signup-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                required
              />
            </div>
            <div>
              <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="signup-password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                required
              />
            </div>
            <div>
              <label htmlFor="signup-role" className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                id="signup-role"
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              >
                <option value="owner">Owner</option>
                <option value="co-owner">Co-Owner</option>
                <option value="agent">Agent</option>
              </select>
            </div>
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-500 text-white py-3 rounded-lg font-medium hover:bg-emerald-600 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <span>Sign Up</span>
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};