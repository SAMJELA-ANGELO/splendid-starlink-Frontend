'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card, { CardHeader, CardContent } from '../../components/ui/Card';
import { auth } from '../../lib/api';
import { useToast } from '../../components/ToastProvider';

export default function Signup() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { confirmPassword, ...signupData } = formData;
      const response = await auth.signup(signupData);
      
      if (response.success) {
        // Backend register returns { success: true, message: string, user: { id: string, username: string } }
        // No token returned, user needs to login after signup
        const user = (response as any).user || (response as any).data?.user;
        if (user) {
          localStorage.setItem('user', JSON.stringify({
            id: user.id,
            username: user.username,
            isActive: user.isActive || true,
            createdAt: new Date().toISOString(),
          }));
        }
        
        showSuccess('Account created successfully! Please sign in to continue.');
        
        // Check if there's a selected bundle from before signup
        const selectedBundle = sessionStorage.getItem('selectedBundle');
        if (selectedBundle) {
          // User selected a bundle before signup, redirect to login with intent to go to buy page
          sessionStorage.setItem('redirectPath', '/buy');
          sessionStorage.removeItem('selectedBundle'); // Clean up
          setTimeout(() => router.push('/auth/login'), 1500);
        } else {
          // Normal signup flow, redirect to login
          setTimeout(() => router.push('/auth/login'), 1500);
        }
      } else {
        // Handle different error formats
        const errorMessage = response.message || 'Signup failed';
        showError(errorMessage);
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      
      // Handle different error types
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;
        
        switch (status) {
          case 400:
            showError(errorData?.message || 'Invalid input data');
            break;
          case 409:
            showError('Username already exists. Please choose a different username.');
            break;
          case 500:
            showError('Server error. Please try again later');
            break;
          default:
            showError(errorData?.message || 'Signup failed. Please try again.');
        }
      } else if (error.request) {
        showError('Network error. Please check your connection');
      } else {
        showError('Signup failed. Please try again.');
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
              Create Account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Join our Wi-Fi hotspot service
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
                required
                placeholder="Choose a username"
              />

              <Input
                name="password"
                type="password"
                label="Password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                required
                placeholder="Create a password"
              />

              <Input
                name="confirmPassword"
                type="password"
                label="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                required
                placeholder="Confirm your password"
              />

              <Button
                type="submit"
                className="w-full"
                loading={loading}
                disabled={loading}
              >
                Create Account
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
                  href="/auth/login"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Already have an account? Sign in
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
