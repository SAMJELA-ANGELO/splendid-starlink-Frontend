'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card, { CardHeader, CardContent } from '../../components/ui/Card';
import { auth } from '../../lib/api';
import { useToast } from '../../components/ToastProvider';

export default function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await auth.login(formData);
      
      if (response.success && response.data) {
        console.log('Login successful, response data:', response.data);
        
        // Store token from API response (new format)
        const token = response.data.token;
        console.log('Storing token:', token);
        localStorage.setItem('token', token);
        
        // Store user data from API response
        const user = response.data.user || {
          id: 'unknown',
          username: formData.username,
          isActive: true,
          createdAt: new Date().toISOString(),
        };
        console.log('Storing user:', user);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Verify token was stored
        const storedToken = localStorage.getItem('token');
        console.log('Token stored successfully:', !!storedToken);
        
        // Check if there's a redirect intent from bundles page
        const redirectPath = sessionStorage.getItem('redirectPath') || '/dashboard';
        sessionStorage.removeItem('redirectPath'); // Clear the redirect path
        
        showSuccess('Login successful! Redirecting...');
        setTimeout(() => router.push(redirectPath), 1000);
      } else {
        // Handle different error formats
        const errorMessage = response.message || 'Login failed';
        showError(errorMessage);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle different error types
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;
        
        switch (status) {
          case 400:
            showError(errorData?.message || 'Please provide username and password');
            break;
          case 401:
            showError('Invalid username or password');
            break;
          case 500:
            showError('Server error. Please try again later');
            break;
          default:
            showError(errorData?.message || 'Login failed. Please try again.');
        }
      } else if (error.request) {
        showError('Network error. Please check your connection');
      } else {
        showError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-md animate-fade-in">
        <Card>
          <CardHeader>
            <h2 className="text-center text-3xl font-extrabold text-gray-900">
              Sign In
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Access your Wi-Fi hotspot account
            </p>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input
                name="username"
                type="text"
                label="Username"
                value={formData.username}
                onChange={handleChange}
                error={errors.username}
                required
                placeholder="Enter your username"
                autoComplete="username"
              />

              <Input
                name="password"
                type="password"
                label="Password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                required
                placeholder="Enter your password"
                autoComplete="current-password"
              />

              <Button
                type="submit"
                className="w-full"
                loading={loading}
                disabled={loading}
              >
                Sign In
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or</span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Link
                  href="/auth/signup"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Don't have an account? Sign up
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
