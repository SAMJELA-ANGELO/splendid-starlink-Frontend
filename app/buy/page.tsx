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

export default function BuyBundle() {
  const [availableBundles, setAvailableBundles] = useState<Bundle[]>([]);
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [purchasing, setPurchasing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  // Check if user is logged in
  const isLoggedIn = typeof window !== 'undefined' && localStorage.getItem('token') !== null;

  useEffect(() => {
    // Don't check authentication immediately - let users browse bundles first
    fetchBundles();
  }, []);

  const fetchBundles = async () => {
    try {
      const response = await bundles.getAll();
      if (response.success && response.data) {
        setAvailableBundles(response.data);
      }
    } catch (error) {
      setErrors({ general: 'Failed to load bundles. Please refresh.' });
    }
  };

  const handleBundleSelect = (bundle: Bundle) => {
    // Check authentication when user tries to select a bundle
    const token = localStorage.getItem('token');
    if (!token) {
      // Store the selected bundle and redirect to login
      // User may have just signed up and needs to log in, or needs to create account
      sessionStorage.setItem('selectedBundle', JSON.stringify(bundle));
      sessionStorage.setItem('redirectPath', '/buy');
      router.push('/auth/login');
      return;
    }
    
    // User is authenticated, proceed with bundle selection
    setSelectedBundle(bundle);
    setErrors({});
  };

  const validatePhoneNumber = (phone: string) => {
    const cleanPhone = phone.replace(/\s/g, '');
    if (!cleanPhone) {
      return 'Phone number is required for payment';
    }
    // Fapshi accepts 9-digit Cameroon numbers starting with 6, 7, or 5
    if (!/^[67]\d{8}$/.test(cleanPhone)) {
      return 'Invalid phone number format. Use Fapshi format (e.g., 674818818)';
    }
    return '';
  };

  const handlePurchase = async () => {
    if (!selectedBundle) {
      setErrors({ general: 'Please select a bundle' });
      return;
    }

    const phoneError = validatePhoneNumber(phoneNumber);
    if (phoneError) {
      setErrors({ phoneNumber: phoneError });
      return;
    }

    // Show confirmation modal instead of purchasing directly
    setShowConfirmModal(true);
  };

  const confirmPurchase = async () => {
    if (!selectedBundle) {
      setErrors({ general: 'Please select a bundle' });
      return;
    }

    setShowConfirmModal(false);
    setPurchasing(true);
    
    try {
      const response = await bundles.purchase(selectedBundle.id, { phone: phoneNumber });
      
      if (response.success && response.data) {
        // Show success toast for payment initiation
        showSuccess('Payment request sent to your mobile phone. Please complete payment on your device.');
        
        // Redirect to payment status page
        router.push(`/payment/status?transactionId=${response.data.transactionId}`);
      } else {
        setErrors({ general: response.message || 'Purchase failed' });
      }
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setPurchasing(false);
    }
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

  return (
    <div className="min-h-screen bg-white py-4 sm:py-8">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          {/* Back Button */}
          <div className="mb-6 text-left">
            <Link
              href={isLoggedIn ? "/dashboard" : "/"}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors group"
            >
              <svg 
                className="w-5 h-5 mr-2 transform transition-transform group-hover:-translate-x-1" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Back to {isLoggedIn ? "Dashboard" : "Home"}</span>
            </Link>
          </div>
          
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-amber-100 rounded-full mb-4 sm:mb-6">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent mb-3 sm:mb-4">
            Choose Your Internet Bundle
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4 mb-4">
            Select the perfect plan that fits your needs and budget
          </p>
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-full inline-flex items-center text-sm sm:text-base">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Browse all bundles • Sign up when you're ready to purchase
          </div>
        </div>

        {errors.general && (
          <div className="mb-6 sm:mb-8 animate-fade-in">
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 sm:p-4 rounded-lg shadow-md">
              <div className="flex">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-sm sm:text-base">{errors.general}</span>
              </div>
            </div>
          </div>
        )}

        {/* Bundle Selection */}
        <div className="mb-8 sm:mb-12">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">Available Plans</h2>
            <p className="text-sm sm:text-base text-gray-600">Click on any plan to select and purchase</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {availableBundles.map((bundle, index) => (
              <div
                key={bundle.id}
                className={`transform transition-all duration-500 hover:scale-105 animate-fade-in-up`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Card
                  className={`relative overflow-hidden cursor-pointer transition-all duration-300 ${
                    selectedBundle?.id === bundle.id
                      ? 'ring-4 ring-amber-600 border-amber-600 shadow-2xl transform scale-105'
                      : 'hover:shadow-xl border-gray-200'
                  }`}
                  onClick={() => handleBundleSelect(bundle)}
                >
                  {bundle.name === 'Regular' && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-600 to-orange-600 text-white text-xs font-bold px-2 sm:px-3 py-1 rounded-bl-lg">
                      POPULAR
                    </div>
                  )}
                  
                  <CardContent className="p-4 sm:p-6 lg:p-8">
                    <div className="text-center">
                      <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full mb-4 sm:mb-6 ${
                        selectedBundle?.id === bundle.id
                          ? 'bg-amber-100'
                          : bundle.name === 'Starter'
                          ? 'bg-yellow-100'
                          : bundle.name === 'Regular'
                          ? 'bg-orange-100'
                          : 'bg-amber-100'
                      }`}>
                        <svg className={`w-6 h-6 sm:w-8 sm:h-8 ${
                          selectedBundle?.id === bundle.id
                            ? 'text-amber-700'
                            : bundle.name === 'Starter'
                            ? 'text-yellow-700'
                            : bundle.name === 'Regular'
                            ? 'text-orange-700'
                            : 'text-amber-700'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">{bundle.name}</h3>
                      
                      <div className="mb-4 sm:mb-6">
                        <div className="flex items-baseline justify-center">
                          <span className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold ${
                            selectedBundle?.id === bundle.id
                              ? 'text-amber-700'
                              : 'text-gray-900'
                          }`}>
                            {bundle.price}
                          </span>
                          <span className="text-lg sm:text-xl text-gray-500 ml-2">CFA</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                        <div className="flex items-center justify-center space-x-2 text-gray-600">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm sm:text-base font-medium">{formatDuration(bundle.duration)}</span>
                        </div>
                        {bundle.dataLimit && (
                          <div className="flex items-center justify-center space-x-2 text-gray-600">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <span className="text-sm sm:text-base font-medium">{bundle.dataLimit} MB data</span>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">{bundle.description}</p>
                      
                      <div className={`w-full h-1 rounded-full mb-3 sm:mb-4 ${
                        selectedBundle?.id === bundle.id
                          ? 'bg-amber-600'
                          : 'bg-gray-200'
                      }`}></div>
                      
                      <div className={`text-xs sm:text-sm font-semibold ${
                        selectedBundle?.id === bundle.id
                          ? 'text-amber-700'
                          : 'text-gray-400'
                      }`}>
                        {selectedBundle?.id === bundle.id ? '✓ Selected' : 'Click to select'}
                      </div>
                      
                      {!selectedBundle && (
                        <div className="text-xs text-gray-500 mt-2 text-center">
                          Sign up required to purchase
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Form */}
        {selectedBundle && (
          <div className="animate-fade-in">
            <Card className="bg-white shadow-2xl border-0 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-700 to-orange-600 p-4 sm:p-6 text-white">
                <h2 className="text-xl sm:text-2xl font-bold mb-2">Complete Your Purchase</h2>
                <p className="text-amber-100 text-sm sm:text-base">Secure payment with Mobile Money</p>
              </div>
              
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 sm:p-6 rounded-xl mb-6 sm:mb-8 border border-amber-100">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{selectedBundle.name} Plan</h3>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-gray-600 space-y-2 sm:space-y-0">
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm sm:text-base">{formatDuration(selectedBundle.duration)}</span>
                        </div>
                        {selectedBundle.dataLimit && (
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <span className="text-sm sm:text-base">{selectedBundle.dataLimit} MB</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-center sm:text-right">
                      <div className="text-3xl sm:text-4xl font-bold text-amber-700">{selectedBundle.price}</div>
                      <div className="text-gray-500 text-sm sm:text-base">CFA</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <Input
                      name="phoneNumber"
                      type="tel"
                      label="Mobile Money Phone Number"
                      value={phoneNumber}
                      onChange={(e) => {
                        setPhoneNumber(e.target.value);
                        if (errors.phoneNumber) {
                          setErrors(prev => ({ ...prev, phoneNumber: '' }));
                        }
                      }}
                      error={errors.phoneNumber}
                      placeholder="674818818"
                      required
                      className="text-base sm:text-lg"
                    />
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 p-4 sm:p-6 rounded-xl">
                    <h4 className="font-bold text-green-800 mb-3 sm:mb-4 flex items-center text-base sm:text-lg">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      How to Pay
                    </h4>
                    <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-green-700">
                      <div className="flex items-start space-x-2 sm:space-x-3">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">1</div>
                        <p>Enter your Mobile Money phone number above</p>
                      </div>
                      <div className="flex items-start space-x-2 sm:space-x-3">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">2</div>
                        <p>Click "Complete Purchase" to initiate payment</p>
                      </div>
                      <div className="flex items-start space-x-2 sm:space-x-3">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">3</div>
                        <p>You will receive a payment prompt on your phone</p>
                      </div>
                      <div className="flex items-start space-x-2 sm:space-x-3">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">4</div>
                        <p>Confirm the payment to activate your bundle instantly</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <p className="text-xs sm:text-sm text-amber-800">
                      Make sure you have sufficient balance in your Mobile Money account
                    </p>
                  </div>

                  {/* Service Fee Alert */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-blue-900 mb-1">Service Fee Information</h4>
                        <div className="text-xs sm:text-sm text-blue-800 space-y-1">
                          <p>• Fapshi service charge: <span className="font-semibold">4%</span> of transaction amount</p>
                          <p>• This fee is automatically included in the total amount</p>
                          <p>• Total amount to pay: <span className="font-bold text-blue-900">{(selectedBundle.price * 1.04).toFixed(0)} CFA</span></p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handlePurchase}
                    className="w-full bg-gradient-to-r from-amber-700 to-orange-600 hover:from-amber-800 hover:to-orange-700 text-base sm:text-lg font-semibold py-3 sm:py-4 transform transition-all duration-200 hover:scale-[1.02] shadow-lg"
                    loading={purchasing}
                    disabled={purchasing || !phoneNumber.trim()}
                  >
                    {purchasing ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Processing Payment...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Complete Purchase - {selectedBundle.price} CFA
                      </span>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmPurchase}
        title="Confirm Purchase"
        confirmText="Complete Purchase"
        confirmLoading={purchasing}
      >
        {selectedBundle && (
          <div className="space-y-3">
            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="font-semibold text-gray-900">{selectedBundle.name}</h4>
              <p className="text-sm text-gray-600">{selectedBundle.description}</p>
              <p className="text-lg font-bold text-gray-900 mt-2">
                {selectedBundle.price} CFA
              </p>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Payment Details:</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• Phone: {phoneNumber}</p>
                <p>• Service Fee (4%): {(selectedBundle.price * 0.04).toFixed(0)} CFA</p>
                <p>• Total Amount: <span className="font-bold">{(selectedBundle.price * 1.04).toFixed(0)} CFA</span></p>
              </div>
            </div>

            <div className="bg-yellow-50 p-3 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> After confirming, you will receive a payment prompt on your mobile phone. Please complete the payment using your Mobile Money PIN.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
