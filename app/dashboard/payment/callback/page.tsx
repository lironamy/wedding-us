'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function PaymentCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const weddingId = searchParams.get('weddingId');
  const packageGuests = searchParams.get('package');
  const orderId = searchParams.get('orderId');
  const status = searchParams.get('status'); // Invoice4U may send this
  const responseCode = searchParams.get('ResponseCode'); // Credit Guard response

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isInIframe, setIsInIframe] = useState(false);

  useEffect(() => {
    // Check if we're in an iframe
    const inIframe = window.self !== window.top;
    setIsInIframe(inIframe);

    const processPayment = async () => {
      try {
        // Check if payment was successful (ResponseCode 000 = success)
        const isSuccess = responseCode === '000' || status === 'success' || status === 'completed';

        if (isSuccess && weddingId && packageGuests) {
          // Update wedding in database
          const response = await fetch('/api/payments/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              weddingId,
              packageGuests: parseInt(packageGuests),
              orderId,
              success: true,
            }),
          });

          if (response.ok) {
            setSuccess(true);
            // If in iframe, notify parent window
            if (inIframe && window.parent) {
              window.parent.postMessage({
                type: 'PAYMENT_SUCCESS',
                packageGuests: parseInt(packageGuests),
                weddingId,
              }, '*');
            }
          } else {
            const data = await response.json();
            const errorMsg = data.error || 'אירעה שגיאה בעדכון החבילה';
            setError(errorMsg);
            if (inIframe && window.parent) {
              window.parent.postMessage({
                type: 'PAYMENT_ERROR',
                error: errorMsg,
              }, '*');
            }
          }
        } else {
          const errorMsg = 'התשלום לא הושלם או בוטל';
          setError(errorMsg);
          if (inIframe && window.parent) {
            window.parent.postMessage({
              type: 'PAYMENT_ERROR',
              error: errorMsg,
            }, '*');
          }
        }
      } catch (err) {
        console.error('Payment callback error:', err);
        const errorMsg = 'אירעה שגיאה בעיבוד התשלום';
        setError(errorMsg);
        if (inIframe && window.parent) {
          window.parent.postMessage({
            type: 'PAYMENT_ERROR',
            error: errorMsg,
          }, '*');
        }
      } finally {
        setLoading(false);
      }
    };

    processPayment();
  }, [weddingId, packageGuests, orderId, status, responseCode]);

  // If in iframe, show minimal UI - parent will handle the modal
  if (isInIframe) {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full"
            />
            <p className="text-gray-600">מעבד את התשלום...</p>
          </div>
        </div>
      );
    }

    if (success) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-green-50">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-green-700 font-medium">התשלום בוצע בהצלחה!</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  // Regular page view (not in iframe)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 mx-auto mb-6 border-4 border-primary border-t-transparent rounded-full"
            />
            <h2 className="text-xl font-semibold text-gray-800">מעבד את התשלום...</h2>
            <p className="text-gray-500 mt-2">אנא המתן</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-md">
            <CardContent className="text-center py-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-24 h-24 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center"
              >
                <svg className="w-12 h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>

              <h1 className="text-3xl font-bold text-gray-800 mb-4">התשלום בוצע בהצלחה!</h1>
              <p className="text-gray-600 mb-2">החבילה שלך שודרגה ל-{packageGuests} מוזמנים</p>
              <p className="text-sm text-gray-500 mb-6">קבלה נשלחה לאימייל שלך</p>

              <Button onClick={() => router.push('/dashboard/guests')} className="w-full">
                המשך לניהול אורחים
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-gray-800 mb-4">התשלום לא הושלם</h1>
            <p className="text-gray-600 mb-8">{error}</p>

            <div className="space-y-3">
              <Button onClick={() => router.push('/dashboard/wedding/edit')} className="w-full">
                נסה שוב
              </Button>
              <Button variant="outline" onClick={() => router.push('/dashboard')} className="w-full">
                חזרה לדשבורד
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
