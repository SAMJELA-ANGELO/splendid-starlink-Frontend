export interface User {
  id: string;
  username: string;
  email?: string;
  phoneNumber?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface Bundle {
  id: string;
  name: string;
  price: number;
  duration: number; // in minutes
  dataLimit?: number; // in MB
  description: string;
  isActive: boolean;
}

export interface Purchase {
  id: string;
  userId: string;
  bundleId: string;
  amount: number;
  serviceFee?: number;
  totalAmount?: number;
  feePercentage?: number;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod: string;
  transactionId?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface Session {
  id: string;
  userId: string;
  startTime: string;
  endTime?: string;
  dataUsed?: number;
  isActive: boolean;
  remainingTime?: number;
}

export interface AuthResponse {
  user: User;
  token: string;
  session?: Session;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
