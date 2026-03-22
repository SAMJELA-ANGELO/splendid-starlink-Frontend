'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card, { CardHeader, CardContent } from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { useToast } from '../components/ToastProvider';
import { bundles, purchases } from '../lib/api';
import { Bundle } from '../lib/types';

export default function BuyForOthers() {
  const [availableBundles, setAvailableBundles] = useState<Bundle[]>([]);
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null);
  const [targetUsername, setTargetUsername] = useState('');
  const [targetPassword, setTargetPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [purchasing, setPurchasing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchBundles();
  }, []);

  const fetchBundles = async () => {
    try {
      const response = await bundles.getAll();
      if (response.success && response.data) {
        setAvailableBundles(response.data);
      }
    } catch (error) {
      showError('Failed to load bundles');
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Target username validation
    if (!targetUsername.trim()) {
      newErrors.targetUsername = 'Username is required';
    } else if (targetUsername.length < 3) {
      newErrors.targetUsername = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(targetUsername)) {
      newErrors.targetUsername = 'Username can only contain letters, numbers, and underscores';
    }

    // Password validation
    if (!targetPassword) {
      newErrors.targetPassword = 'Password is required';
    } else if (targetPassword.length < 6) {
      newErrors.targetPassword = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (targetPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Phone validation
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^[67]\d{8}$/.test(phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Invalid phone number format. Use Fapshi format (e.g., 674818818)';
    }

    // Bundle validation
    if (!selectedBundle) {
      newErrors.bundle = 'Please select a bundle';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePurchase = async () => {
    if (!validateForm()) return;

    setShowConfirmModal(true);
  };

  const confirmPurchase = async () => {
    if (!selectedBundle) return;

    setShowConfirmModal(false);
    setPurchasing(true);
    
    try {
      const response = await purchases.buyForOthers({
        targetUsername,
        targetPassword,
        phoneNumber: phoneNumber.replace(/\s/g, ''),
        planId: selectedBundle.id,
      });
      
      if (response.success && response.data) {
        showSuccess('Payment request sent! Target user created successfully.');
        
        // Redirect to payment status page
        router.push(`/payment/status?transactionId=${response.data.transactionId}`);
      } else {
        showError(response.message || 'Purchase failed');
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;
        
        switch (status) {
          case 400:
            showError(errorData?.message || 'Invalid input data');
            break;
          case 401:
            showError('Please login to continue');
            break;
          case 409:
            showError('Target username already exists. Please choose a different username.');
            break;
          case 500:
            showError('Server error. Please try again later');
            break;
          default:
            showError(errorData?.message || 'Purchase failed. Please try again.');
        }
      } else if (error.request) {
        showError('Network error. Please check your connection');
      } else {
        showError('Purchase failed. Please try again.');
      }
    } finally {
      setPurchasing(false);
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(minutes / 1440);
      return `${days} day${days > 1 ? 's' : ''}`;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-6">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" className="p-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Button>
              </Link>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Buy for Someone Else</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Target User Form */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900">Target User Details</h2>
                <p className="text-sm text-gray-600">Create account for the person you're buying for</p>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <Input
                    name="targetUsername"
                    type="text"
                    label="Username"
                    placeholder="Enter username"
                    value={targetUsername}
                    onChange={(e) => setTargetUsername(e.target.value)}
                    error={errors.targetUsername}
                    required
                  />

                  <Input
                    name="targetPassword"
                    type="password"
                    label="Password"
                    placeholder="Enter password"
                    value={targetPassword}
                    onChange={(e) => setTargetPassword(e.target.value)}
                    error={errors.targetPassword}
                    required
                  />

                  <Input
                    name="confirmPassword"
                    type="password"
                    label="Confirm Password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    error={errors.confirmPassword}
                    required
                  />

                  <Input
                    name="phoneNumber"
                    type="tel"
                    label="Phone Number (for payment)"
                    placeholder="674818818"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    error={errors.phoneNumber}
                    required
                  />

                  {errors.bundle && (
                    <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                      <p className="text-sm text-red-600">{errors.bundle}</p>
                    </div>
                  )}

                  <Button
                    onClick={handlePurchase}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 transform transition-all duration-200 hover:scale-[1.02] shadow-lg"
                    loading={purchasing}
                    disabled={purchasing}
                  >
                    {purchasing ? 'Processing...' : 'Complete Purchase'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Bundle Selection */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900">Select Internet Bundle</h2>
                <p className="text-sm text-gray-600">Choose the bundle you want to purchase</p>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : availableBundles.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No bundles available</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableBundles.map((bundle) => (
                      <div
                        key={bundle.id}
                        onClick={() => setSelectedBundle(bundle)}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                          selectedBundle?.id === bundle.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900">{bundle.name}</h3>
                          <span className="text-2xl font-bold text-gray-900">{bundle.price} CFA</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{bundle.description}</p>
                        <div className="flex items-center text-sm text-gray-500">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formatDuration(bundle.duration)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmPurchase}
        title="Confirm Purchase for Someone Else"
        confirmText="Complete Purchase"
        confirmLoading={purchasing}
      >
        {selectedBundle && (
          <div className="space-y-3">
            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Bundle Details</h4>
              <p className="text-sm text-gray-600">{selectedBundle.name}</p>
              <p className="text-lg font-bold text-gray-900">{selectedBundle.price} CFA</p>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Target User</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Username:</strong> {targetUsername}</p>
                <p><strong>Phone:</strong> {phoneNumber}</p>
              </div>
            </div>

            <div className="bg-green-50 p-3 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Payment Details</h4>
              <div className="text-sm text-green-800 space-y-1">
                <p>• Service Fee (4%): {(selectedBundle.price * 0.04).toFixed(0)} CFA</p>
                <p>• Total Amount: <span className="font-bold">{(selectedBundle.price * 1.04).toFixed(0)} CFA</span></p>
              </div>
            </div>

            <div className="bg-yellow-50 p-3 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> After payment, the target user can login with the provided credentials on their device.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
