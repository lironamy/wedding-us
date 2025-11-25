'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  clearingUrl: string;
  amount: number;
  packageGuests: number;
}

type PaymentStatus = 'pending' | 'success' | 'error';

export default function PaymentModal({
  isOpen,
  onClose,
  clearingUrl,
  amount,
  packageGuests,
}: PaymentModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Reset state when modal opens
      setPaymentStatus('pending');
      setLoading(true);
      setErrorMessage('');
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Listen for messages from the iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log('Payment message received:', event.data);

      if (event.data?.type === 'PAYMENT_SUCCESS') {
        setPaymentStatus('success');
      } else if (event.data?.type === 'PAYMENT_ERROR') {
        setPaymentStatus('error');
        setErrorMessage(event.data?.error || 'אירעה שגיאה בתשלום');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleGoToGuests = () => {
    onClose();
    router.push('/dashboard/guests');
  };

  // Success screen content
  const renderSuccessScreen = () => (
    <div className="p-8 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
        className="w-24 h-24 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center"
      >
        <svg className="w-12 h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-2">התשלום בוצע בהצלחה!</h2>
        <p className="text-gray-600 mb-6">
          החבילה שלך שודרגה ל-{packageGuests} מוזמנים
        </p>

        <Button onClick={handleGoToGuests} className="w-full text-lg py-3">
          המשך לניהול אורחים
        </Button>
      </motion.div>
    </div>
  );

  // Error screen content
  const renderErrorScreen = () => (
    <div className="p-8 text-center">
      <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
        <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-2">התשלום לא הושלם</h2>
      <p className="text-gray-600 mb-6">{errorMessage}</p>

      <div className="space-y-3">
        <Button onClick={() => setPaymentStatus('pending')} className="w-full">
          נסה שוב
        </Button>
        <Button variant="outline" onClick={onClose} className="w-full">
          סגור
        </Button>
      </div>
    </div>
  );

  // Payment form content (iframe)
  const renderPaymentForm = () => (
    <>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">תשלום מאובטח</h2>
            <p className="text-sm text-white/80">
              שדרוג ל-{packageGuests} מוזמנים | ₪{amount}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="absolute inset-0 bg-white flex items-center justify-center z-10" style={{ top: '76px' }}>
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full"
            />
            <p className="text-gray-600">טוען טופס תשלום מאובטח...</p>
          </div>
        </div>
      )}

      {/* Payment iframe */}
      <div className="relative" style={{ height: '500px' }}>
        <iframe
          src={clearingUrl}
          className="w-full h-full border-0"
          onLoad={() => setLoading(false)}
          allow="payment"
          title="תשלום מאובטח"
        />
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span>מאובטח ע"י Invoice4U</span>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            ביטול
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={paymentStatus === 'pending' ? onClose : undefined}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {paymentStatus === 'success' && renderSuccessScreen()}
            {paymentStatus === 'error' && renderErrorScreen()}
            {paymentStatus === 'pending' && renderPaymentForm()}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
