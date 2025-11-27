import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';

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
  const [loginError, setLoginError] = useState<string | null>(null);
  const [signupError, setSignupError] = useState<string | null>(null);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem('penny-count-user');
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setUser(null);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const userProfile: User = {
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone || '',
          role: data.role as 'owner' | 'co-owner' | 'agent',
          photo: data.photo,
          isActive: data.is_active,
          assignedLines: data.assigned_lines || [],
          createdAt: new Date(data.created_at)
        };
        setUser(userProfile);
        localStorage.setItem('penny-count-user', JSON.stringify(userProfile));
      }
    } catch (error: any) {
      console.error('Error loading user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: { name: string; email: string; phone: string; password: string; role: string }) => {
    if (userData.password.length < 8) {
      setSignupError('Password must be at least 8 characters long.');
      return false;
    }

    setSignupError(null);
    setIsLoading(true);

    try {
      console.log('Attempting signup for:', userData.email);

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            phone: userData.phone,
            role: userData.role
          }
        }
      });

      console.log('Signup response:', {
        hasUser: !!authData?.user,
        error: authError?.message
      });

      if (authError) {
        console.error('Signup error:', authError);
        throw authError;
      }

      if (authData.user) {
        console.log('Creating user profile for:', authData.user.id);

        const { error: profileError } = await supabase
          .from('users')
          .insert([{
            id: authData.user.id,
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            role: userData.role,
            is_active: true,
            assigned_lines: []
          }]);

        if (profileError) {
          console.error('Profile creation error:', profileError);
          throw profileError;
        }

        console.log('Signup successful');
        setIsLoading(false);
        return true;
      }

      setIsLoading(false);
      return false;
    } catch (err: any) {
      console.error('Signup caught error:', err);
      let msg = err?.message || 'Sign up failed.';
      if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('already exists')) {
        msg = 'Email already exists.';
      }
      setSignupError(msg);
      setIsLoading(false);
      return false;
    }
  };

  const login = async (emailOrPhone: string, password: string): Promise<boolean> => {
    setLoginError(null);
    setIsLoading(true);

    try {
      console.log('Attempting login for:', emailOrPhone);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailOrPhone,
        password: password,
      });

      console.log('Login response:', {
        hasUser: !!data?.user,
        error: error?.message
      });

      if (error) {
        console.error('Login error:', error);
        throw error;
      }

      if (data.user) {
        await loadUserProfile(data.user.id);
        return true;
      }

      setIsLoading(false);
      return false;
    } catch (error: any) {
      console.error('Login caught error:', error);
      const errorMessage = error.message || 'Invalid credentials.';
      setLoginError(errorMessage);
      setIsLoading(false);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, loginError, signupError }}>
      {children}
    </AuthContext.Provider>
  );
};