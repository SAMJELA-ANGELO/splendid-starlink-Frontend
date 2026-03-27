import axios from 'axios';
import { User, Bundle, Purchase, Session, AuthResponse, ApiResponse } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
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
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  logout: async (): Promise<ApiResponse<null>> => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  me: async (): Promise<ApiResponse<User>> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Bundle endpoints (using /plans backend route)
export const bundles = {
  getAll: async (): Promise<ApiResponse<Bundle[]>> => {
    const response = await api.get('/plans');
    return response.data;
  },

  purchase: async (planId: string, paymentData: { phone: string; name?: string }): Promise<ApiResponse<Purchase>> => {
    const response = await api.post('/payments/initiate', { planId, ...paymentData });
    return response.data;
  },
};

// Purchase endpoints (using /payments backend routes)
export const purchases = {
  getUserPurchases: async (): Promise<ApiResponse<Purchase[]>> => {
    const response = await api.get('/purchases/user');
    return response.data;
  },

  verifyPayment: async (transactionId: string): Promise<ApiResponse<Purchase>> => {
    const response = await api.get(`/payments/status/${transactionId}`);
    const data = response.data;
    // Transform Fapshi response to Purchase format
    if (data.success && data.data) {
      const fapshiData = data.data;
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
    return data;
  },

  buyForOthers: async (data: { targetUsername: string; targetPassword: string; phoneNumber: string; planId: string }): Promise<ApiResponse<Purchase>> => {
    const response = await api.post('/payments/buy-for-others', data);
    return response.data;
  },
};

// Session endpoints
export const sessions = {
  getCurrent: async (): Promise<ApiResponse<Session>> => {
    const response = await api.get('/sessions/current');
    return response.data;
  },

  getStatus: async (): Promise<ApiResponse<{ isActive: boolean; remainingTime?: number }>> => {
    const response = await api.get('/sessions/status');
    return response.data;
  },
};

export default api;
