'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import emailjs from '@emailjs/browser';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface RefundRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  weddingId: string;
  currentPackage: number;
  requestedPackage: number;
  paidAmount: number;
  userEmail: string;
  userName: string;
  userPhone?: string;
}

export default function RefundRequestModal({
  isOpen,
  onClose,
  weddingId,
  currentPackage,
  requestedPackage,
  paidAmount,
  userEmail,
  userName,
  userPhone,
}: RefundRequestModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [packagePrices, setPackagePrices] = useState<Record<number, number>>({});
  const [refundAmount, setRefundAmount] = useState(0);
  const [pricingLoading, setPricingLoading] = useState(true);

  const [formData, setFormData] = useState({
    fullName: userName || '',
    email: userEmail || '',
    phone: userPhone || '',
    reason: '',
  });

  // Load package pricing from database
  useEffect(() => {
    const fetchPricing = async () => {
      setPricingLoading(true);
      try {
        const response = await fetch('/api/admin/pricing');
        const data = await response.json();
        if (data.pricing && data.pricing.length > 0) {
          const prices: Record<number, number> = {};
          data.pricing.forEach((p: any) => {
            prices[p.guests] = p.price;
          });
          setPackagePrices(prices);
        }
      } catch (error) {
        console.error('Error fetching pricing:', error);
      } finally {
        setPricingLoading(false);
      }
    };

    if (isOpen) {
      fetchPricing();
    }
  }, [isOpen]);

  // Calculate refund amount when prices are loaded
  useEffect(() => {
    const currentPrice = packagePrices[currentPackage] || 0;
    const requestedPrice = packagePrices[requestedPackage] || 0;
    const priceDifference = currentPrice - requestedPrice;
    // Refund is the price difference, but cannot exceed what was actually paid
    setRefundAmount(Math.min(priceDifference, paidAmount));
  }, [packagePrices, currentPackage, requestedPackage, paidAmount]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('=== Refund Request Started ===');
    console.log('Wedding ID:', weddingId);
    console.log('Current Package:', currentPackage);
    console.log('Requested Package:', requestedPackage);
    console.log('Paid Amount:', paidAmount);
    console.log('Refund Amount:', refundAmount);

    try {
      // Step 1: Validate with API (check guest count)
      console.log('Step 1: Validating guest count...');
      const validateResponse = await fetch('/api/refund-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weddingId,
          requestedPackage,
        }),
      });

      const validateData = await validateResponse.json();
      console.log('Validation response:', validateData);

      if (!validateData.success) {
        console.log('Validation FAILED:', validateData.error);
        setError(validateData.error || 'לא ניתן לבצע את הבקשה');
        setLoading(false);
        return;
      }

      console.log('Validation PASSED - Guest count OK');

      // Step 2: Send email to admin
      const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
      const templateId = process.env.NEXT_PUBLIC_EMAILJS_REFUND_TEMPLATE_ID || process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
      const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

      if (!serviceId || !templateId || !publicKey) {
        throw new Error('EmailJS configuration missing');
      }

      const templateParams = {
        to_email: process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'agathario91@gmail.com',
        to_name: 'מנהל המערכת',
        from_name: formData.fullName,
        from_email: formData.email,
        subject: `בקשת החזר כספי - ${formData.fullName} - ₪${refundAmount}`,
        message: `
בקשת החזר כספי חדשה

פרטי המבקש:
━━━━━━━━━━━━━━━━━━━━━━━━
שם מלא: ${formData.fullName}
אימייל: ${formData.email}
טלפון נייד: ${formData.phone}

פרטי התשלום:
━━━━━━━━━━━━━━━━━━━━━━━━
מזהה חתונה: ${weddingId}
חבילה נוכחית: ${currentPackage} מוזמנים
חבילה מבוקשת: ${requestedPackage} מוזמנים
סכום ששולם: ₪${paidAmount}
סכום החזר מבוקש: ₪${refundAmount}

אופן ההחזר:
━━━━━━━━━━━━━━━━━━━━━━━━
זיכוי לכרטיס האשראי שאיתו בוצע התשלום (עד 14 ימי עסקים)

סיבת הבקשה:
━━━━━━━━━━━━━━━━━━━━━━━━
${formData.reason || 'לא צוינה סיבה'}
        `.trim(),
        reply_to: formData.email,
      };

      console.log('Step 2: Sending email to admin...');
      await emailjs.send(serviceId, templateId, templateParams, publicKey);
      console.log('Email sent successfully!');

      // Step 3: Update wedding package in database
      console.log('Step 3: Updating wedding package in database...');
      const updateResponse = await fetch('/api/refund-request', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weddingId,
          newPackage: requestedPackage,
        }),
      });

      const updateData = await updateResponse.json();
      console.log('Update response:', updateData);

      if (!updateData.success) {
        console.error('Failed to update wedding package:', updateData.error);
        // Still show success since email was sent, but log the error
      } else {
        console.log('Wedding package updated successfully to:', requestedPackage);
      }

      console.log('=== Refund Request Completed Successfully ===');
      setSuccess(true);
    } catch (err) {
      console.error('Error sending refund request:', err);
      setError('אירעה שגיאה בשליחת הבקשה');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 sm:px-6 py-3 sm:py-4 text-white flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold">בקשת החזר כספי</h2>
                  <p className="text-xs sm:text-sm text-white/80">
                    מעבר מ-{currentPackage} ל-{requestedPackage} מוזמנים
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
              {success ? (
                <div className="text-center py-4 sm:py-8">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">הבקשה נשלחה בהצלחה!</h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                    נטפל בבקשתך בהקדם ונחזור אליך תוך 3-5 ימי עסקים.
                  </p>
                  <p className="text-xs sm:text-sm text-amber-600 bg-amber-50 rounded-lg p-2 sm:p-3 mb-3 sm:mb-4">
                    הזיכוי יכנס לכרטיס האשראי שאיתו שילמת תוך 14 ימי עסקים מאישור הבקשה.
                  </p>
                  <Button onClick={() => {
                    onClose();
                    router.push('/dashboard');
                  }}>
                    המשך לסקירה כללית
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                  {/* Refund summary */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm sm:text-base text-amber-800">סכום ההחזר המשוער:</span>
                      <span className="text-xl sm:text-2xl font-bold text-amber-600">₪{refundAmount}</span>
                    </div>
                    <p className="text-xs text-amber-600 mt-1">
                      * הסכום הסופי יחושב לפי מדיניות ההחזרים שלנו
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-2 sm:p-3 text-xs sm:text-sm">
                      {error}
                    </div>
                  )}

                  {/* Refund method notice */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <div>
                        <h4 className="text-sm sm:text-base font-semibold text-blue-800">אופן ההחזר</h4>
                        <p className="text-xs sm:text-sm text-blue-700 mt-1">
                          הזיכוי יבוצע לכרטיס האשראי שאיתו בוצע התשלום המקורי, תוך 14 ימי עסקים מאישור הבקשה.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Personal details */}
                  <div className="space-y-2 sm:space-y-3">
                    <h4 className="text-sm sm:text-base font-semibold text-gray-700">פרטים ליצירת קשר</h4>

                    <Input
                      label="שם מלא"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                    />

                    <Input
                      label="אימייל"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />

                    <Input
                      label="טלפון נייד"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="050-0000000"
                      required
                    />
                  </div>

                  {/* Reason */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      סיבת הבקשה (אופציונלי)
                    </label>
                    <textarea
                      name="reason"
                      value={formData.reason}
                      onChange={handleChange}
                      rows={2}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                      placeholder="ספר לנו למה אתה רוצה להוריד את החבילה..."
                    />
                  </div>

                  {/* Submit */}
                  <div className="flex gap-2 sm:gap-3 pt-2 sm:pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      className="flex-1"
                    >
                      ביטול
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={loading}
                    >
                      {loading ? 'שולח...' : 'שלח בקשה'}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
