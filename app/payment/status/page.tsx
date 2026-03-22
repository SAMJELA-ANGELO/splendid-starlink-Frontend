import { Suspense } from 'react';
import PaymentStatusClient from '../payment-status-client';

function PaymentStatusLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}

export default function PaymentStatus() {
  return (
    <Suspense fallback={<PaymentStatusLoading />}>
      <PaymentStatusClient />
    </Suspense>
  );
}
