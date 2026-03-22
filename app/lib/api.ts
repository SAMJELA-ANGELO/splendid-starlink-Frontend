import axios from 'axios';
import { User, Bundle, Purchase, Session, AuthResponse, ApiResponse } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://splendidstarlink.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log('API Request:', config.method?.toUpperCase(), config.url, 'Token present:', !!token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const auth = {
  signup: async (userData: { username: string; password: string; email?: string; phoneNumber?: string }): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials: { username: string; password: string }): Promise<ApiResponse<AuthResponse>> => {
    try {
      const response = await api.post('/auth/login', credentials);
      console.log('Login API response:', response);
      console.log('Login response data:', response.data);
      
      // Handle new response format from backend
      if (response.data.success && response.data.data) {
        // Successful login - new format with success flag
        console.log('Login successful - new format detected');
        return { 
          success: true, 
          data: {
            token: response.data.data.access_token,
            user: response.data.user || {
              id: response.data.user?.id || 'unknown',
              username: response.data.user?.username || credentials.username,
              isActive: response.data.user?.isActive || true,
              createdAt: new Date().toISOString()
            }
          }
        };
      } else if (response.data.access_token) {
        // Fallback - old format (direct token)
        console.log('Login successful - old format detected');
        return { 
          success: true, 
          data: {
            token: response.data.access_token,
            user: response.data.user || {
              id: response.data.id || response.data.sub || 'unknown',
              username: credentials.username,
              isActive: true,
              createdAt: new Date().toISOString()
            }
          }
        };
      } else if (response.data.success === false || response.data.message) {
        // Failed login - backend returns success: false or error message
        console.log('Login failed - error message found');
        return { 
          success: false, 
          message: response.data.message || 'Login failed'
        };
      } else {
        // Unexpected response format
        console.log('Login failed - unexpected response format');
        return { 
          success: false, 
          message: 'Unexpected response from server'
        };
      }
    } catch (error: any) {
      console.error('Login API error:', error);
      
      // Handle HTTP errors
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;
        
        if (status === 401) {
          return { 
            success: false, 
            message: 'Invalid username or password'
          };
        } else if (status === 400) {
          return { 
            success: false, 
            message: errorData?.message || 'Invalid request'
          };
        } else if (status === 500) {
          return { 
            success: false, 
            message: 'Server error. Please try again later'
          };
        } else {
          return { 
            success: false, 
            message: errorData?.message || 'Login failed'
          };
        }
      } else if (error.request) {
        return { 
          success: false, 
          message: 'Network error. Please check your connection'
        };
      } else {
        return { 
          success: false, 
          message: 'Login failed. Please try again.'
        };
      }
    }
  },

  logout: async (): Promise<ApiResponse<null>> => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  me: async (): Promise<ApiResponse<User>> => {
    try {
      const response = await api.get('/auth/me');
      
      // Handle different response formats from backend
      if (response.data.user) {
        return { success: true, data: response.data.user };
      } else if (response.data.id || response.data.username) {
        // Response contains user data directly
        return { success: true, data: response.data };
      } else if (Array.isArray(response.data) && response.data.length > 0) {
        // Response is array, take first element
        return { success: true, data: response.data[0] };
      }
      
      return { success: false, message: 'No user data found' };
    } catch (error) {
      throw error;
    }
  },
};

// Bundle endpoints (using /plans backend route)
export const bundles = {
  getAll: async (): Promise<ApiResponse<Bundle[]>> => {
    try {
      const response = await api.get('/plans');
      
      // Backend returns data directly as array, not wrapped in response object
      if (Array.isArray(response.data)) {
        const transformedBundles = response.data.map((bundle: any) => ({
          id: bundle._id || bundle.id,
          name: bundle.name,
          price: bundle.price,
          duration: bundle.duration * 60, // Backend returns hours, convert to minutes
          dataLimit: bundle.dataLimit || undefined,
          description: bundle.description || `Get ${bundle.duration} hours of high-speed internet access`,
          isActive: bundle.isActive !== false
        }));
        return { success: true, data: transformedBundles };
      }
      
      // Fallback: Handle wrapped response format
      if (response.data.success && response.data.data) {
        const transformedBundles = response.data.data.map((bundle: any) => ({
          id: bundle._id || bundle.id,
          name: bundle.name,
          price: bundle.price,
          duration: bundle.duration * 60, // Backend returns hours, convert to minutes
          dataLimit: bundle.dataLimit || undefined,
          description: bundle.description || `Get ${bundle.duration} hours of high-speed internet access`,
          isActive: bundle.isActive !== false
        }));
        return { success: true, data: transformedBundles };
      }
      
      return { success: false, message: 'Unexpected response format' };
    } catch (error) {
      throw error;
    }
  },

  purchase: async (planId: string, paymentData: { phone: string; name?: string }): Promise<ApiResponse<Purchase>> => {
    const response = await api.post('/payments/initiate', { planId, ...paymentData });
    return response.data;
  },
};

// Purchase endpoints (using /payments backend routes)
export const purchases = {
  getUserPurchases: async (): Promise<ApiResponse<Purchase[]>> => {
    try {
      const response = await api.get('/payments/user');
      
      // Handle different response formats from backend
      if (Array.isArray(response.data)) {
        return { success: true, data: response.data };
      } else if (response.data.purchases && Array.isArray(response.data.purchases)) {
        return { success: true, data: response.data.purchases };
      } else if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      
      return { success: false, message: 'No purchase data found' };
    } catch (error) {
      throw error;
    }
  },

  verifyPayment: async (transactionId: string): Promise<ApiResponse<Purchase>> => {
    const response = await api.get(`/payments/status/${transactionId}`);
    // Transform Fapshi response to Purchase format
    if (response.data.success && response.data.data) {
      const fapshiData = response.data.data;
      const purchase: Purchase = {
        id: fapshiData.transId || transactionId,
        userId: '', // Not available in status response
        bundleId: '', // Not available in status response
        amount: fapshiData.amount || 0,
        status: fapshiData.status === 'SUCCESSFUL' ? 'completed' : 
                fapshiData.status === 'FAILED' ? 'failed' : 'pending',
        paymentMethod: 'mobile_money',
        transactionId: fapshiData.transId || transactionId,
        createdAt: new Date().toISOString(),
      };
      return { success: true, data: purchase };
    }
    return response.data;
  },

  buyForOthers: async (data: {
    targetUsername: string;
    targetPassword: string;
    phoneNumber: string;
    planId: string;
  }): Promise<ApiResponse<any>> => {
    const response = await api.post('/payments/buy-for-others', data);
    return response.data;
  },
};

// Session endpoints
export const sessions = {
  getCurrent: async (): Promise<ApiResponse<Session>> => {
    try {
      const response = await api.get('/sessions/current');
      
      // Handle different response formats from backend
      if (response.data.session) {
        return { success: true, data: response.data.session };
      } else if (response.data.id || response.data.startTime) {
        // Response contains session data directly
        return { success: true, data: response.data };
      } else if (Array.isArray(response.data) && response.data.length > 0) {
        // Response is array, take first element
        return { success: true, data: response.data[0] };
      }
      
      return { success: false, message: 'No session data found' };
    } catch (error) {
      throw error;
    }
  },

  getStatus: async (): Promise<ApiResponse<{ isActive: boolean; remainingTime?: number }>> => {
    const response = await api.get('/sessions/status');
    return response.data;
  },
};

export default api;
