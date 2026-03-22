'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardContent } from '../components/ui/Card';
import { sessions, auth } from '../lib/api';
import { Session } from '../lib/types';

export default function Status() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuthAndFetchStatus();
    const interval = setInterval(fetchSessionStatus, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const checkAuthAndFetchStatus = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    fetchSessionStatus();
  };

  const fetchSessionStatus = async () => {
    try {
      const response = await sessions.getCurrent();
      if (response.success && response.data) {
        setSession(response.data);
      } else {
        setSession(null);
      }
    } catch (error) {
      setSession(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSessionStatus();
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours} hours`;
    } else {
      const days = Math.floor(minutes / 1440);
      const hours = Math.floor((minutes % 1440) / 60);
      return hours > 0 ? `${days}d ${hours}h` : `${days} days`;
    }
  };

  const formatTimeRemaining = (seconds: number) => {
    if (seconds <= 0) return 'Expired';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getConnectionStrength = () => {
    // Simulate connection strength - in real app this would come from API
    return Math.floor(Math.random() * 3) + 3; // 3-5 bars
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
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Connection Status</h1>
              <p className="text-gray-600">Monitor your internet connection</p>
            </div>
            <div className="flex space-x-4">
              <Button variant="outline" onClick={handleRefresh} loading={refreshing}>
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Link href="/dashboard">
                <Button variant="primary">Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {session && session.isActive ? (
          /* Active Connection */
          <div className="space-y-6">
            {/* Connection Status Card */}
            <Card>
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-green-600 mb-2">Connected</h2>
                  <p className="text-gray-600 mb-6">You are currently connected to the internet</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Session Started</p>
                      <p className="font-semibold">{formatDate(session.startTime)}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Time Remaining</p>
                      <p className="font-semibold text-lg">
                        {session.remainingTime 
                          ? formatTimeRemaining(Math.ceil(session.remainingTime))
                          : 'Calculating...'}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Connection Speed</p>
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-4 rounded-sm ${
                                i < getConnectionStrength() ? 'bg-green-500' : 'bg-gray-300'
                              }`}
                            ></div>
                          ))}
                        </div>
                        <span className="font-semibold">Good</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Usage */}
            {session.dataUsed && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">Data Usage</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Data Used</span>
                        <span className="font-semibold">{session.dataUsed} MB</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-4">
                        <div 
                          className="bg-blue-600 h-4 rounded-full transition-all duration-300" 
                          style={{ width: `${Math.min((session.dataUsed / 1000) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Upload Speed</p>
                        <p className="font-semibold">2.5 Mbps</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Download Speed</p>
                        <p className="font-semibold">15.2 Mbps</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Connection Details */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Connection Details</h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Session ID</p>
                    <p className="font-mono text-sm bg-gray-100 p-2 rounded">{session.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">IP Address</p>
                    <p className="font-mono text-sm bg-gray-100 p-2 rounded">192.168.1.100</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">MAC Address</p>
                    <p className="font-mono text-sm bg-gray-100 p-2 rounded">00:1B:44:11:3A:B7</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Connected Device</p>
                    <p className="font-mono text-sm bg-gray-100 p-2 rounded">Mobile Device</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* No Active Connection */
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Not Connected</h2>
            <p className="text-gray-600 mb-8">You don't have an active internet connection</p>
            
            <div className="space-y-4">
              <Card className="max-w-md mx-auto">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Get Connected</h3>
                  <div className="space-y-3">
                    <Link href="/buy">
                      <Button className="w-full" variant="primary">
                        Purchase a Bundle
                      </Button>
                    </Link>
                    <Link href="/dashboard">
                      <Button className="w-full" variant="outline">
                        Go to Dashboard
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Troubleshooting */}
            <Card className="max-w-2xl mx-auto mt-8">
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Troubleshooting</h3>
              </CardHeader>
              <CardContent>
                <div className="text-left space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 font-semibold text-sm">1</span>
                    </div>
                    <div>
                      <p className="font-medium">Check your bundle status</p>
                      <p className="text-sm text-gray-600">Ensure you have an active, unused bundle</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 font-semibold text-sm">2</span>
                    </div>
                    <div>
                      <p className="font-medium">Verify payment completion</p>
                      <p className="text-sm text-gray-600">Make sure your last payment was successful</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 font-semibold text-sm">3</span>
                    </div>
                    <div>
                      <p className="font-medium">Contact support</p>
                      <p className="text-sm text-gray-600">If issues persist, reach out to our support team</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
