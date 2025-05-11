'use client'

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function ThankYouPage() {
  const searchParams = useSearchParams();
  const [customerInfo, setCustomerInfo] = useState({
    email: '',
    plan: '',
    subscription: ''
  });

  useEffect(() => {
    // Get session ID from URL if present
    const sessionId = searchParams.get('session_id');
    
    // If we have a session ID, we could fetch additional information from the server
    if (sessionId) {
      // For demonstration purposes, set some placeholder values
      // In a real implementation, you would fetch this from your Stripe webhook handler data
      setCustomerInfo({
        email: 'user@example.com',
        plan: 'Pro',
        subscription: 'Monthly'
      });
      
      // You could also make an API call to your backend to get the latest customer info
      // fetchCustomerInfoFromServer(sessionId);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-md">
        <div>
          <svg
            className="mx-auto h-16 w-16 text-emerald-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 13l4 4L19 7" 
            />
          </svg>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Thank You!
          </h2>
          <p className="mt-2 text-center text-gray-600">
            Your payment was successful and your subscription is now active.
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          <div className="rounded-md border border-gray-200 p-4">
            <h3 className="text-lg font-medium mb-2">Order Details</h3>
            <div className="text-sm space-y-2">
              {customerInfo.email && (
                <p><span className="font-medium">Email:</span> {customerInfo.email}</p>
              )}
              {customerInfo.plan && (
                <p><span className="font-medium">Plan:</span> {customerInfo.plan}</p>
              )}
              {customerInfo.subscription && (
                <p><span className="font-medium">Billing:</span> {customerInfo.subscription}</p>
              )}
            </div>
          </div>
          
          <div className="flex flex-col space-y-3">
            <Link href="/" 
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              Return to Home
            </Link>
            
            <Link href="/dashboard"
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 