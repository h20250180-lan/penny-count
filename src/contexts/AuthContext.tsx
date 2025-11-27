import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { dataService } from '../services/dataService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (emailOrPhone: string, password: string) => Promise<boolean>;
  signup: (user: { name: string; email: string; phone: string; password: string; role: string }) => Promise<boolean>;
  logout: () => void;
  loginError: string | null;
  signupError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Add error state for login/signup
  const [loginError, setLoginError] = useState<string | null>(null);
  const [signupError, setSignupError] = useState<string | null>(null);

  const logout = () => {
    setUser(null);
    localStorage.removeItem('penny-count-user');
    localStorage.removeItem('penny-count-token');
  };

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('penny-count-user');
    const storedToken = localStorage.getItem('penny-count-token');
    console.log('LOAD SESSION:', { storedUser, storedToken }); // Debug: verify session load
    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Convert createdAt string back to Date object
        if (parsedUser.createdAt) {
          parsedUser.createdAt = new Date(parsedUser.createdAt);
        }
        // Defensive: ensure id is present
        if (parsedUser._id && !parsedUser.id) parsedUser.id = parsedUser._id;
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('penny-count-user');
      }
    } else {
      setUser(null);
    }
    setIsLoading(false);
  }, []);

  const signup = async (user: { name: string; email: string; phone: string; password: string; role: string }) => {
    // Password strength validation (optional, for better UX)
    if (user.password.length < 8) {
      setSignupError('Password must be at least 8 characters long.');
      return false;
    }
    try {
      // Ensure role is typed correctly for backend
      const res = await dataService.createUser({
        ...user,
        role: user.role as any // fix: cast to any to avoid invalid spread/union error
      });
      return !!res;
    } catch (err: any) {
      // Show backend error for duplicate email/phone
      let msg = err?.message || 'Sign up failed.';
      if (msg.toLowerCase().includes('email')) msg = 'Email already exists.';
      if (msg.toLowerCase().includes('phone')) msg = 'Phone number already exists.';
      setSignupError(msg);
      return false;
    }
  };

  // Fix: Map backend _id to id for frontend compatibility
  const login = async (emailOrPhone: string, password: string): Promise<boolean> => {
    setLoginError(null);
    setIsLoading(true);
    try {
      let res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailOrPhone, password })
      });
      if (!res.ok) {
        // Try login with phone
        res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/users/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: emailOrPhone, password })
        });
      }
      // Debug: log response status and body
      const debugRes = res.clone();
      let debugText = await debugRes.text();
      console.log('Login response status:', res.status);
      console.log('Login response body:', debugText);
      if (res.ok) {
        let { user, token } = await res.json();
        if (user._id) user.id = user._id.toString();
        if (user.createdAt && typeof user.createdAt === 'string') {
          user.createdAt = new Date(user.createdAt);
        }
        user.isActive = user.isActive ?? true;
        user.role = user.role ?? 'agent';
        setUser(user);
        localStorage.setItem('penny-count-user', JSON.stringify(user));
        localStorage.setItem('penny-count-token', token);
        localStorage.removeItem('penny-count-login-error');
        setIsLoading(false);
        return true;
      } else {
        let errMsg = 'Invalid credentials.';
        try {
          const data = await res.json();
          errMsg = data.message || errMsg;
        } catch {
          errMsg = debugText || errMsg;
        }
        setLoginError(errMsg);
        localStorage.setItem('penny-count-login-error', errMsg);
        setIsLoading(false);
        return false;
      }
    } catch (error: any) {
      setLoginError(error.message || 'Login failed.');
      localStorage.setItem('penny-count-login-error', error.message || 'Login failed.');
      setIsLoading(false);
      return false;
    }
  };

  // Expose error states in context for UI feedback
  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, loginError, signupError }}>
      {children}
    </AuthContext.Provider>
  );
};