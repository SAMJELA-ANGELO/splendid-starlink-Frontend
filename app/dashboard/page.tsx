'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardContent } from '../components/ui/Card';
import { auth, sessions, purchases } from '../lib/api';
import { User, Session, Purchase } from '../lib/types';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [recentPurchases, setRecentPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    fetchUserData();
    const interval = setInterval(fetchSessionData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchUserData = async () => {
    try {
      const [userResponse, sessionResponse, purchasesResponse] = await Promise.all([
        auth.me(),
        sessions.getCurrent(),
        purchases.getUserPurchases(),
      ]);

      if (userResponse.success && userResponse.data) {
        setUser(userResponse.data);
      }

      if (sessionResponse.success && sessionResponse.data) {
        setCurrentSession(sessionResponse.data);
      }

      if (purchasesResponse.success && purchasesResponse.data) {
        setRecentPurchases(purchasesResponse.data.slice(0, 5));
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionData = async () => {
    try {
      const sessionResponse = await sessions.getCurrent();
      if (sessionResponse.success && sessionResponse.data) {
        setCurrentSession(sessionResponse.data);
      }
    } catch (error) {
      // Silent fail for session updates
    }
  };

  const handleLogout = async () => {
    try {
      await auth.logout();
    } catch (error) {
      // Continue with logout even if API call fails
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/auth/login');
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    } else {
      const days = Math.floor(minutes / 1440);
      const hours = Math.floor((minutes % 1440) / 60);
      return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:py-6 space-y-4 sm:space-y-0">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm sm:text-base text-gray-600">Welcome back, {user?.username}</p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <Link href="/buy" className="w-full sm:w-auto">
                <Button variant="primary" className="w-full sm:w-auto">Buy Bundle</Button>
              </Link>
              <Link href="/buy-for-others" className="w-full sm:w-auto">
                <Button variant="secondary" className="w-full sm:w-auto">Buy for Someone Else</Button>
              </Link>
              <Link href="/status" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto">Connection Status</Button>
              </Link>
              <Button variant="ghost" onClick={handleLogout} className="w-full sm:w-auto">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Connection Status */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900">Connection Status</h2>
              </CardHeader>
              <CardContent>
                {currentSession && currentSession.isActive ? (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-green-800 font-medium">Connected</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Session Started</p>
                        <p className="font-semibold">{formatDate(currentSession.startTime)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Remaining Time</p>
                        <p className="font-semibold">
                          {currentSession.remainingTime 
                            ? formatDuration(Math.ceil(currentSession.remainingTime / 60))
                            : 'Calculating...'}
                        </p>
                      </div>
                    </div>

                    {currentSession.dataUsed && (
                      <div>
                        <p className="text-sm text-gray-600">Data Used</p>
                        <div className="mt-2">
                          <div className="bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${Math.min((currentSession.dataUsed / 1000) * 100, 100)}%` }}
                            ></div>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {currentSession.dataUsed} MB used
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Connection</h3>
                    <p className="text-gray-600 mb-4">Purchase a bundle to start browsing</p>
                    <Link href="/buy">
                      <Button>Browse Bundles</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* User Info */}
          <div>
            <Card className="mb-6">
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900">Account Info</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Username</p>
                    <p className="font-medium">{user?.username}</p>
                  </div>
                  {user?.email && (
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{user.email}</p>
                    </div>
                  )}
                  {user?.phoneNumber && (
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">{user.phoneNumber}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Member Since</p>
                    <p className="font-medium">{formatDate(user?.createdAt || '')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Account Status</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user?.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Link href="/buy" className="block">
                    <Button className="w-full" variant="primary">
                      Buy New Bundle
                    </Button>
                  </Link>
                  <Link href="/status" className="block">
                    <Button className="w-full" variant="outline">
                      Check Connection
                    </Button>
                  </Link>
                  <Link href="/history" className="block">
                    <Button className="w-full" variant="ghost">
                      Purchase History
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Purchases */}
        {recentPurchases.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">Recent Purchases</h2>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bundle
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentPurchases.map((purchase) => (
                      <tr key={purchase.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {/* Bundle name would come from the API response */}
                          Bundle #{purchase.bundleId.slice(0, 8)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {purchase.amount} CFA
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(purchase.status)}`}>
                            {purchase.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(purchase.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
