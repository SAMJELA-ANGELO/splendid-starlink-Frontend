'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from './api';
import { User } from './types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  signup: (data: { username: string; password: string; email?: string; phoneNumber?: string }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setUser(null);
        return;
      }

      // Verify token is still valid by fetching user data
      try {
        const response = await auth.me();
        setUser(response.data || null);
        setError(null);
      } catch (err) {
        // Token is invalid, remove it
        localStorage.removeItem('token');
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
        setUser(null);
        setError('Session expired. Please login again.');
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await auth.login({ username, password });
      
      // response is ApiResponse<AuthResponse>
      // Structure: { success: true, data: { user, token } }
      const token = response?.data?.token;
      const userData = response?.data?.user;
      
      if (!token) {
        throw new Error('No token received from server');
      }

      // Store token in both localStorage and cookie
      localStorage.setItem('token', token);
      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
      }
      document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
      
      // Set user data and authenticated state
      setUser(userData || null);
      
      // Navigate to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Login failed';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: { username: string; password: string; email?: string; phoneNumber?: string }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await auth.signup(data);
      
      // Signup doesn't return a token, user needs to login after signup
      if (!response.success || !response.data?.user) {
        throw new Error('Signup failed');
      }

      // Just store the user info, no token yet
      const userData = {
        id: response.data.user.id,
        username: response.data.user.username,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Redirect to login page so user can authenticate
      router.push('/auth/login');
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Signup failed';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Call logout endpoint
      await auth.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Always clear local state and tokens
      localStorage.removeItem('token');
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
      setUser(null);
      setIsLoading(false);
      router.push('/auth/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        error,
        login,
        signup,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
