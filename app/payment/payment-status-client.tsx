'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Button from '../components/ui/Button';
import Card, { CardContent } from '../components/ui/Card';
import { purchases } from '../lib/api';
import { Purchase } from '../lib/types';

export default function PaymentStatusClient() {
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const transactionId = searchParams.get('transactionId');

  useEffect(() => {
    if (!transactionId) {
      router.push('/buy');
      return;
    }
    fetchPaymentStatus();
    // Poll for payment status every 5 seconds for up to 2 minutes
    const interval = setInterval(fetchPaymentStatus, 5000);
    const timeout = setTimeout(() => clearInterval(interval), 120000);
    
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [transactionId]);

  const fetchPaymentStatus = async () => {
    if (!transactionId) return;
    
    try {
      const response = await purchases.verifyPayment(transactionId);
      if (response.success && response.data) {
        setPurchase(response.data);
        if (response.data.status === 'completed') {
          // Payment successful, redirect to dashboard after 3 seconds
          setTimeout(() => {
            router.push('/dashboard');
          }, 3000);
        }
      }
    } catch (error) {
      console.error('Failed to fetch payment status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (!transactionId) return;
    
    setVerifying(true);
    try {
      const response = await purchases.verifyPayment(transactionId);
      if (response.success && response.data) {
        setPurchase(response.data);
        if (response.data.status === 'completed') {
          setTimeout(() => {
            router.push('/dashboard');
          }, 3000);
        }
      }
    } catch (error) {
      console.error('Failed to verify payment:', error);
    } finally {
      setVerifying(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'failed':
        return (
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728" />
            </svg>
          </div>
        );
      case 'pending':
      default:
        return (
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        );
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          title: 'Payment Successful!',
          description: 'Your bundle has been activated successfully.',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'failed':
        return {
          title: 'Payment Failed',
          description: 'Your payment could not be processed. Please try again.',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      case 'pending':
      default:
        return {
          title: 'Processing Payment',
          description: 'We are waiting for your payment confirmation. This may take a few moments.',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Transaction Not Found</h2>
            <p className="text-gray-600 mb-6">We couldn't find your transaction. Please try again.</p>
            <Link href="/buy">
              <Button>Back to Purchase</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusInfo = getStatusMessage(purchase.status);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardContent className="p-8">
            {getStatusIcon(purchase.status)}
            
            <div className="text-center">
              <h1 className={`text-2xl font-bold mb-2 ${statusInfo.color}`}>
                {statusInfo.title}
              </h1>
              <p className="text-gray-600 mb-6">
                {statusInfo.description}
              </p>

              {/* Transaction Details */}
              <div className={`p-4 rounded-lg ${statusInfo.bgColor} ${statusInfo.borderColor} border mb-6`}>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-900">Transaction ID</p>
                    <p className="font-mono text-xs bg-white bg-opacity-60 p-1 rounded mt-1">
                      {purchase.transactionId || transactionId}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Amount</p>
                    <p className="font-semibold">{purchase.amount} CFA</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Bundle</p>
                    <p className="font-mono text-xs bg-white bg-opacity-60 p-1 rounded mt-1">
                      {purchase.bundleId.slice(0, 8)}...
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Status</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.bgColor} ${statusInfo.color}`}>
                      {purchase.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {purchase.status === 'completed' && (
                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <p className="text-green-800 font-medium mb-2">
                      Redirecting to dashboard in 3 seconds...
                    </p>
                    <Link href="/dashboard">
                      <Button variant="primary">Go to Dashboard Now</Button>
                    </Link>
                  </div>
                )}

                {purchase.status === 'pending' && (
                  <div className="space-y-3">
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                      <p className="text-yellow-800 text-sm mb-3">
                        <strong>Payment Instructions:</strong>
                      </p>
                      <ul className="text-sm text-yellow-700 space-y-1 text-left">
                        <li>• Check your phone for the Mobile Money payment prompt</li>
                        <li>• Enter your Mobile Money PIN to confirm</li>
                        <li>• Wait for payment confirmation (this page will update automatically)</li>
                        <li>• If you don't receive a prompt, click "Check Payment Status" below</li>
                      </ul>
                    </div>
                    <Button
                      onClick={handleVerifyPayment}
                      loading={verifying}
                      variant="outline"
                      className="w-full"
                    >
                      {verifying ? 'Checking...' : 'Check Payment Status'}
                    </Button>
                  </div>
                )}

                {purchase.status === 'failed' && (
                  <div className="space-y-3">
                    <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                      <p className="text-red-800 text-sm">
                        If the problem persists, please contact our support team or try purchasing again.
                      </p>
                    </div>
                    <div className="flex space-x-3">
                      <Button
                        onClick={handleVerifyPayment}
                        loading={verifying}
                        variant="outline"
                        className="flex-1"
                      >
                        Try Again
                      </Button>
                      <Link href="/buy" className="flex-1">
                        <Button variant="primary" className="w-full">
                          New Purchase
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}

                <Link href="/dashboard" className="block">
                  <Button variant="ghost" className="w-full">
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
