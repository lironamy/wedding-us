'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { ModernDatePicker, ModernTimePicker } from '@/components/ui/DateTimePicker';
import { Card } from '@/components/ui/Card';
import { Stepper, Step } from '@/components/ui/Stepper';
import MediaUpload from '@/components/dashboard/MediaUpload';
import BitQrUpload from '@/components/dashboard/BitQrUpload';
import RefundRequestModal from '@/components/dashboard/RefundRequestModal';
import TemplateSelector from '@/components/dashboard/TemplateSelector';
import InvitationRenderer from '@/components/invitation/InvitationRenderer';
import { getGenderText } from '@/lib/utils/genderText';
import hebrewDate from 'hebrew-date';

interface WeddingFormStepperProps {
  wedding?: any;
  onSubmit: (data: any, options?: { skipRedirect?: boolean }) => Promise<void>;
  onCancel: () => void;
}

export default function WeddingFormStepper({ wedding, onSubmit, onCancel }: WeddingFormStepperProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    groomName: '',
    brideName: '',
    contactPhone: '',
    partner1Type: 'groom' as 'groom' | 'bride',
    partner2Type: 'bride' as 'groom' | 'bride',
    eventDate: '',
    eventTime: '',
    chuppahTime: '',
    venue: '',
    venueAddress: '',
    description: '',
    mediaUrl: '',
    mediaType: 'image' as 'image' | 'video',
    mediaPosition: { x: 50, y: 50 } as { x: number; y: number },
    bitPhone: '',
    payboxPhone: '',
    enableBitGifts: false,
    bitQrImage: '',
    bitPaymentLink: '',
    backgroundPattern: '',
    invitationTemplate: 'classic',
    maxGuests: 200,
    seatingMode: 'auto' as 'auto' | 'manual',
    askAboutMeals: true,
    mealOptions: {
      regular: true,
      vegetarian: true,
      vegan: true,
      kids: true,
      glutenFree: true,
      other: true,
    },
    customOtherMealName: '',
    theme: {
      primaryColor: '#7950a5',
      secondaryColor: '#2C3E50',
      fontFamily: 'Assistant'
    }
  });

  // Package options - loaded from database
  const [packageOptions, setPackageOptions] = useState<{ guests: number; price: number; label: string }[]>([]);
  const [pricingLoading, setPricingLoading] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Payment state
  const [paymentClearingUrl, setPaymentClearingUrl] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paidPackageGuests, setPaidPackageGuests] = useState(0);

  // Refund modal state
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundData, setRefundData] = useState({
    currentPackage: 0,
    requestedPackage: 0,
    paidAmount: 0,
  });

  // Already paid modal state
  const [showAlreadyPaidModal, setShowAlreadyPaidModal] = useState(false);
  const [alreadyPaidMessage, setAlreadyPaidMessage] = useState('');

  const partnerTypeLabels = {
    groom: 'חתן',
    bride: 'כלה'
  };

  const tornPaperEffects = [
    { id: 'none', name: 'ללא אפקט', url: '' },
    { id: 'torn1', name: 'נייר קרוע 1', url: 'https://64.media.tumblr.com/52f3f4542616d233b4bdef01fc22fe4b/0e2dd220497b2358-8c/s540x810/352ede408d4a46c68011c4ebe7e639a289ac7ba8.pnj' },
    { id: 'torn2', name: 'נייר קרוע 2', url: 'https://64.media.tumblr.com/79bb9229e726fa069278664509229883/1b93ac2a972d238e-9c/s540x810/524b4e38476153f160125e9882c69595bada675c.pnj' },
    { id: 'torn3', name: 'נייר קרוע 3', url: 'https://64.media.tumblr.com/7f595934e76b351c3185eee4beb593aa/1435469a36784852-60/s540x810/df411b9d0592a9c5717ec4210cb6a985b921e65d.pnj' },
    { id: 'torn4', name: 'נייר קרוע 4', url: 'https://64.media.tumblr.com/6c9beb7e457d141f8bd6110c5a01dffb/50c56bfeebf13bad-26/s540x810/1ebd561c7897b6e2e3b024e3ea39a0873e21b700.pnj' },
    { id: 'torn5', name: 'נייר קרוע 5', url: 'https://64.media.tumblr.com/125197364ac617bea05915e6c6659f0c/a0823e13d8878794-a5/s540x810/68ff766465968407fd81a7892e4111b88daae649.pnj' },
    { id: 'torn6', name: 'נייר קרוע 6', url: 'https://64.media.tumblr.com/1eab4c696fb31da9237c10073e2c0b85/efb83fbbff20637d-97/s540x810/3759ab1afae361f084473620f11e0bbac746d606.pnj' },
  ];

  // Dynamic steps - add payment step only if paid package
  const baseStepsLabels = ['פרטי האירוע', 'מדיה', 'מתנות', 'סידורי ישיבה', 'עיצוב', 'תצוגה מקדימה', 'חבילה'];
  const stepsLabels = formData.maxGuests > 200
    ? [...baseStepsLabels, 'תשלום']
    : baseStepsLabels;

  // Track if initial load happened to prevent re-initialization after save
  const initialLoadDone = useRef(false);
  // Track wedding ID to detect if it's a different wedding
  const loadedWeddingId = useRef<string | null>(null);

  useEffect(() => {
    // Only initialize formData on first load or if wedding ID changed
    const currentWeddingId = wedding?._id || null;
    if (wedding && (!initialLoadDone.current || loadedWeddingId.current !== currentWeddingId)) {
      console.log('=== Initializing formData from wedding ===');
      console.log('askAboutMeals from wedding:', wedding.askAboutMeals);
      initialLoadDone.current = true;
      loadedWeddingId.current = currentWeddingId;
      setFormData({
        groomName: wedding.groomName || '',
        brideName: wedding.brideName || '',
        contactPhone: wedding.contactPhone || '',
        partner1Type: wedding.partner1Type || 'groom',
        partner2Type: wedding.partner2Type || 'bride',
        eventDate: wedding.eventDate ? new Date(wedding.eventDate).toISOString().split('T')[0] : '',
        eventTime: wedding.eventTime || '',
        chuppahTime: wedding.chuppahTime || '',
        venue: wedding.venue || '',
        venueAddress: wedding.venueAddress || '',
        description: wedding.description || '',
        mediaUrl: wedding.mediaUrl || '',
        mediaType: wedding.mediaType || 'image',
        mediaPosition: wedding.mediaPosition || { x: 50, y: 50 },
        bitPhone: wedding.bitPhone || '',
        payboxPhone: wedding.payboxPhone || '',
        enableBitGifts: wedding.enableBitGifts || false,
        bitQrImage: wedding.bitQrImage || '',
        bitPaymentLink: wedding.bitPaymentLink || '',
        backgroundPattern: wedding.backgroundPattern || '',
        invitationTemplate: wedding.invitationTemplate || 'classic',
        maxGuests: wedding.maxGuests || 200,
        seatingMode: wedding.seatingSettings?.mode || 'auto',
        askAboutMeals: wedding.askAboutMeals !== false, // Default to true
        mealOptions: wedding.mealOptions || {
          regular: true,
          vegetarian: true,
          vegan: true,
          kids: true,
          glutenFree: true,
          other: true,
        },
        customOtherMealName: wedding.customOtherMealName || '',
        theme: wedding.theme || {
          primaryColor: '#7950a5',
          secondaryColor: '#2C3E50',
          fontFamily: 'Assistant'
        }
      });
    }
  }, [wedding]);

  // Load package pricing from database
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const response = await fetch('/api/admin/pricing');
        const data = await response.json();
        if (data.pricing && data.pricing.length > 0) {
          setPackageOptions(data.pricing.map((p: any) => ({
            guests: p.guests,
            price: p.price,
            label: p.label,
          })));
        }
      } catch (error) {
        console.error('Error fetching pricing:', error);
      } finally {
        setPricingLoading(false);
      }
    };

    fetchPricing();
  }, []);

  // Listen for payment messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'PAYMENT_SUCCESS') {
        setPaymentSuccess(true);
        setPaidPackageGuests(event.data.packageGuests);
      } else if (event.data?.type === 'PAYMENT_ERROR') {
        setPaymentError(event.data.error || 'אירעה שגיאה בתשלום');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleMediaUpload = (url: string, type: 'image' | 'video') => {
    setFormData((prev) => ({ ...prev, mediaUrl: url, mediaType: type }));
  };

  const validateIsraeliPhone = (phone: string): boolean => {
    // Remove spaces, dashes, and other common separators
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

    // Israeli mobile: 05X-XXXXXXX (10 digits starting with 05)
    // Israeli landline: 0X-XXXXXXX (9-10 digits starting with 0)
    // With country code: +972 or 972
    const israeliMobileRegex = /^(0[5][0-9]{8}|(\+?972)[5][0-9]{8})$/;
    const israeliLandlineRegex = /^(0[2-9][0-9]{7,8}|(\+?972)[2-9][0-9]{7,8})$/;

    return israeliMobileRegex.test(cleanPhone) || israeliLandlineRegex.test(cleanPhone);
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    // Step 1: Combined Partner Details + Date & Venue
    if (step === 1) {
      if (!formData.groomName.trim()) {
        newErrors.groomName = `שם ה${partnerTypeLabels[formData.partner1Type]} חובה`;
      }
      if (!formData.brideName.trim()) {
        newErrors.brideName = `שם ה${partnerTypeLabels[formData.partner2Type]} חובה`;
      }
      if (!formData.contactPhone.trim()) {
        newErrors.contactPhone = 'מספר טלפון נייד חובה';
      } else if (!validateIsraeliPhone(formData.contactPhone)) {
        newErrors.contactPhone = 'מספר טלפון נייד לא תקין (לדוגמה: 050-1234567)';
      }
      if (!formData.eventDate) newErrors.eventDate = 'תאריך האירוע חובה';
      if (!formData.eventTime) newErrors.eventTime = 'שעת האירוע חובה';
      if (!formData.venue.trim()) newErrors.venue = 'שם האולם חובה';
      if (!formData.venueAddress.trim()) newErrors.venueAddress = 'כתובת האולם חובה';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBeforeStepChange = (current: number, next: number): boolean => {
    // Only validate when moving forward
    if (next > current) {
      return validateStep(current);
    }
    return true;
  };

  const handleStepChange = async (newStep: number) => {
    console.log('=== handleStepChange ===');
    console.log('Previous step:', currentStep);
    console.log('New step:', newStep);
    console.log('Wedding ID:', wedding?._id);
    console.log('FormData:', JSON.stringify(formData, null, 2));

    const prevStep = currentStep;
    setCurrentStep(newStep);

    // Auto-save when leaving step 1 (event details: partner details + date/venue)
    if (prevStep === 1 && newStep > 1 && wedding?._id) {
      try {
        console.log('=== Auto-saving event details after step 1 ===');
        await onSubmit(formData, { skipRedirect: true });
        console.log('Event details saved successfully');
      } catch (error) {
        console.error('Error auto-saving event details:', error);
      }
    }

    // When entering payment step (step 8), save wedding data first, then fetch clearing URL
    if (newStep === 8 && wedding?._id) {
      // Save wedding data before payment (without redirect)
      try {
        console.log('=== Saving wedding data before payment step ===');
        console.log('Calling onSubmit with formData...');
        await onSubmit(formData, { skipRedirect: true });
        console.log('Wedding data saved successfully');
      } catch (error) {
        console.error('Error saving wedding data:', error);
      }

      // Then fetch payment URL if needed
      if (formData.maxGuests > 200 && !paymentClearingUrl) {
        await fetchPaymentUrl();
      }
    }
  };

  const fetchPaymentUrl = async () => {
    setPaymentLoading(true);
    setPaymentError('');

    console.log('=== Fetching Payment URL ===');
    console.log('Wedding ID:', wedding?._id);
    console.log('Selected package (maxGuests):', formData.maxGuests);
    console.log('Current wedding maxGuests:', wedding?.maxGuests);
    console.log('Wedding payment status:', wedding?.paymentStatus);
    console.log('Wedding paid package:', wedding?.paymentDetails?.packageGuests);
    console.log('Wedding paid amount:', wedding?.paymentDetails?.amount);

    try {
      const selectedPackage = packageOptions.find(p => p.guests === formData.maxGuests);
      if (!selectedPackage) return;

      console.log('Selected package price:', selectedPackage.price);

      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weddingId: wedding._id,
          packageGuests: formData.maxGuests,
          amount: selectedPackage.price,
        }),
      });

      const data = await response.json();
      console.log('Payment API response:', data);

      if (data.success) {
        if (data.alreadyPaid) {
          // Already paid - show confirmation modal
          setAlreadyPaidMessage(data.message || 'כבר שילמת עבור חבילה זו');
          setShowAlreadyPaidModal(true);
        } else if (!data.paymentRequired) {
          // Free package - show confirmation modal
          setAlreadyPaidMessage(data.message || 'החבילה הופעלה בהצלחה');
          setShowAlreadyPaidModal(true);
        } else if (data.clearingUrl) {
          setPaymentClearingUrl(data.clearingUrl);
        }
      } else if (data.tooManyGuests) {
        // User has too many guests for the requested package
        console.log('Too many guests:', data.guestCount, 'for package:', data.requestedPackage);
        setPaymentError(data.message);
      } else if (data.requiresRefund) {
        // Show refund modal
        setRefundData({
          currentPackage: data.currentPackage,
          requestedPackage: data.requestedPackage,
          paidAmount: data.paidAmount,
        });
        setShowRefundModal(true);
      } else {
        setPaymentError(data.error || data.message || 'אירעה שגיאה ביצירת התשלום');
      }
    } catch (error) {
      console.error('Error fetching payment URL:', error);
      setPaymentError('אירעה שגיאה. נסה שוב.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleFinalSubmit = async () => {
    console.log('=== handleFinalSubmit ===');
    console.log('Current step:', currentStep);
    console.log('=== FormData being saved ===');
    console.log('askAboutMeals:', formData.askAboutMeals);
    console.log('Full FormData:', JSON.stringify(formData, null, 2));

    if (!validateStep(currentStep)) {
      console.log('Validation failed for step:', currentStep);
      return;
    }

    setLoading(true);
    try {
      console.log('Calling onSubmit with askAboutMeals =', formData.askAboutMeals);
      // Save the wedding data
      await onSubmit(formData);
      console.log('onSubmit completed successfully');
      // Payment is handled in step 8 iframe - user will be redirected after payment
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Hide Footer */}
      <style jsx global>{`
        footer {
          display: none !important;
        }
        body {
          padding-bottom: 0 !important;
        }
      `}</style>

      <Stepper
        initialStep={1}
        onStepChange={handleStepChange}
        onBeforeStepChange={handleBeforeStepChange}
        onFinalStepCompleted={handleFinalSubmit}
        stepsLabels={stepsLabels}
        backButtonText="חזור"
        nextButtonText="המשך"
        completeButtonText={
          formData.maxGuests > 200
            ? `${wedding ? 'עדכן' : 'צור'} ועבור לתשלום`
            : wedding ? 'עדכן חתונה' : 'צור חתונה'
        }
        disableStepIndicators={false}
        hideStepIndicators={currentStep === 8}
        hideFooter={currentStep === 8}
        fullWidthContent={currentStep === 8}
        fullHeightLayout={true}
        onCancel={onCancel}
        cancelButtonText="ביטול"
        isLoading={loading}
      >
        {/* Step 1: Event Details (Partner Details + Date & Venue) */}
        <Step>
          <div className="space-y-3 sm:space-y-5">
            <div className="text-center mb-2 sm:mb-4">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900">פרטי האירוע</h2>
              <p className="text-xs sm:text-base text-gray-500 mt-0.5 sm:mt-1">הזינו את פרטי הזוג והאירוע</p>
            </div>

            {/* Partner Details Section */}
            <div className="space-y-2 sm:space-y-4">
              <h3 className="text-sm sm:text-lg font-medium text-gray-800">פרטי הזוג</h3>
              <div className="grid grid-cols-1 gap-2 sm:gap-4">
                {/* Partner 1 */}
                <div className="flex flex-row gap-2 items-start">
                  <select
                    value={formData.partner1Type}
                    onChange={(e) => setFormData((prev) => ({ ...prev, partner1Type: e.target.value as 'groom' | 'bride' }))}
                    className="w-16 sm:w-24 px-1.5 sm:px-3 py-2.5 sm:py-3.5 border-2 border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary focus:border-primary bg-white text-sm"
                    style={{ fontSize: '16px' }}
                  >
                    <option value="groom">חתן</option>
                    <option value="bride">כלה</option>
                  </select>
                  <div className="flex-1">
                    <Input
                      label={`שם ה${partnerTypeLabels[formData.partner1Type]}`}
                      name="groomName"
                      value={formData.groomName}
                      onChange={handleChange}
                      error={errors.groomName}
                    />
                  </div>
                </div>

                {/* Partner 2 */}
                <div className="flex flex-row gap-2 items-start">
                  <select
                    value={formData.partner2Type}
                    onChange={(e) => setFormData((prev) => ({ ...prev, partner2Type: e.target.value as 'groom' | 'bride' }))}
                    className="w-16 sm:w-24 px-1.5 sm:px-3 py-2.5 sm:py-3.5 border-2 border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary focus:border-primary bg-white text-sm"
                    style={{ fontSize: '16px' }}
                  >
                    <option value="groom">חתן</option>
                    <option value="bride">כלה</option>
                  </select>
                  <div className="flex-1">
                    <Input
                      label={`שם ה${partnerTypeLabels[formData.partner2Type]}`}
                      name="brideName"
                      value={formData.brideName}
                      onChange={handleChange}
                      error={errors.brideName}
                    />
                  </div>
                </div>

                {/* Contact Phone */}
                <Input
                  label="טלפון נייד ליצירת קשר"
                  name="contactPhone"
                  type="tel"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  error={errors.contactPhone}
                />
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-2 sm:my-4" />

            {/* Date & Venue Section */}
            <div className="space-y-2 sm:space-y-4">
              <h3 className="text-sm sm:text-lg font-medium text-gray-800">תאריך ומיקום</h3>

              {/* Date and Times - same row on desktop, stacked on mobile */}
              <div className="flex flex-col sm:grid sm:grid-cols-3 gap-2 sm:gap-4">
                <ModernDatePicker
                  label="תאריך האירוע"
                  name="eventDate"
                  type="date"
                  value={formData.eventDate}
                  onChange={(value) => {
                    setFormData((prev) => ({ ...prev, eventDate: value }));
                    if (errors.eventDate) {
                      setErrors((prev) => ({ ...prev, eventDate: '' }));
                    }
                  }}
                  error={errors.eventDate}
                  required
                  minDate={new Date()}
                />
                <ModernTimePicker
                  label="שעת קבלת פנים"
                  name="eventTime"
                  type="time"
                  value={formData.eventTime}
                  onChange={(value) => {
                    setFormData((prev) => ({ ...prev, eventTime: value }));
                    if (errors.eventTime) {
                      setErrors((prev) => ({ ...prev, eventTime: '' }));
                    }
                  }}
                  error={errors.eventTime}
                  required
                />
                <ModernTimePicker
                  label="שעת חופה"
                  name="chuppahTime"
                  type="time"
                  value={formData.chuppahTime}
                  onChange={(value) => setFormData((prev) => ({ ...prev, chuppahTime: value }))}
                />
              </div>

              <Input
                label="שם האולם"
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                error={errors.venue}
                required
              />

              <Input
                label="כתובת מלאה (רחוב, מספר, עיר)"
                name="venueAddress"
                value={formData.venueAddress}
                onChange={handleChange}
                error={errors.venueAddress}
                required
              />
            </div>
          </div>
        </Step>

        {/* Step 2: Media & Description */}
        <Step>
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">מדיה ותוכן</h2>
              <p className="text-sm sm:text-base text-gray-500 mt-1">הוסיפו תמונה והודעה אישית</p>
            </div>

            <MediaUpload
              currentMediaUrl={formData.mediaUrl}
              currentMediaType={formData.mediaType}
              onUpload={handleMediaUpload}
              mediaPosition={formData.mediaPosition}
              onPositionChange={(position) => setFormData((prev) => ({ ...prev, mediaPosition: position }))}
              theme={formData.theme}
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                הודעה אישית לאורחים (אופציונלי)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={2}
                maxLength={80}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-base"
                style={{ fontSize: '16px' }}
                placeholder="מים רבים לא יוכלו לכבות את האהבה ונהרות לא ישטפוה"
              />
              <p className="text-xs text-gray-500 text-left">
                {formData.description?.length || 0}/80 תווים
              </p>
            </div>
          </div>
        </Step>

        {/* Step 3: Gifts */}
        <Step>
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">קבלת מתנות</h2>
              <p className="text-sm sm:text-base text-gray-500 mt-1">אפשרו לאורחים לשלוח מתנות דיגיטליות</p>
            </div>

            <BitQrUpload
              enabled={formData.enableBitGifts}
              qrImage={formData.bitQrImage}
              bitPhone={formData.bitPhone}
              onEnabledChange={(enabled) => setFormData((prev) => ({ ...prev, enableBitGifts: enabled }))}
              onQrScanned={(qrImage, bitPhone) => setFormData((prev) => ({ ...prev, bitQrImage: qrImage, bitPhone: bitPhone }))}
            />
          </div>
        </Step>

        {/* Step 4: Seating Mode */}
        <Step>
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">סידורי ישיבה</h2>
              <p className="text-sm sm:text-base text-gray-500 mt-1">בחרו כיצד תרצו לנהל את סידורי הישיבה באירוע</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Auto Mode */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFormData((prev) => ({ ...prev, seatingMode: 'auto' }))}
                className={`relative cursor-pointer rounded-2xl border-2 p-5 sm:p-6 transition-all ${
                  formData.seatingMode === 'auto'
                    ? 'border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                {/* Selected Indicator */}
                {formData.seatingMode === 'auto' && (
                  <div className="absolute top-3 left-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                )}

                <div className="text-center">
                  {/* Icon */}
                  <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-primary/20 to-pink-500/20 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                    </svg>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">אוטומטי</h3>
                  <p className="text-sm text-gray-600 mb-4">המערכת תסדר את האורחים בשולחנות באופן חכם</p>

                  <ul className="text-right text-sm text-gray-500 space-y-2">
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>סידור אוטומטי לפי קבוצות (משפחה, חברים...)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>התחשבות בהעדפות "ליד" ו"רחוק מ-"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>עדכון אוטומטי כשאורחים מאשרים הגעה</span>
                    </li>
                  </ul>
                </div>
              </motion.div>

              {/* Manual Mode */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFormData((prev) => ({ ...prev, seatingMode: 'manual' }))}
                className={`relative cursor-pointer rounded-2xl border-2 p-5 sm:p-6 transition-all ${
                  formData.seatingMode === 'manual'
                    ? 'border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                {/* Selected Indicator */}
                {formData.seatingMode === 'manual' && (
                  <div className="absolute top-3 left-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                )}

                <div className="text-center">
                  {/* Icon */}
                  <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                    </svg>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">ידני</h3>
                  <p className="text-sm text-gray-600 mb-4">תסדרו את האורחים בעצמכם בגרירה ושחרור</p>

                  <ul className="text-right text-sm text-gray-500 space-y-2">
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>שליטה מלאה על מיקום כל אורח</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>גרירה ושחרור אינטואיטיבית</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>מתאים למי שמעדיף לסדר לבד</span>
                    </li>
                  </ul>
                </div>
              </motion.div>
            </div>

            {/* Info Notes */}
            <div className="space-y-3">
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-blue-800 font-medium">ניתן לשנות בכל עת</p>
                    <p className="text-sm text-blue-600 mt-1">
                      תמיד תוכלו לעבור בין מצב אוטומטי לידני בהגדרות סידורי הישיבה בדשבורד
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-purple-800 font-medium">הדרכה מפורטת מחכה לכם</p>
                    <p className="text-sm text-purple-600 mt-1">
                      לאחר סיום הגדרת החתונה, תמצאו פירוט נוסף והדרכה מלאה בעמוד סידורי הישיבה בדשבורד
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Step>

        {/* Step 5: Design */}
        <Step>
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">עיצוב ההזמנה</h2>
              <p className="text-sm sm:text-base text-gray-500 mt-1">בחרו תבנית והתאימו את העיצוב</p>
            </div>

            {/* Meal Preferences Question */}
            <div className="bg-gray-50 rounded-xl p-4 sm:p-6 mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                האם תרצו לשאול את האורחים איזה סוג אוכל הם מעוניינים?
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                אם תבחרו כן, האורחים יוכלו לבחור את סוג המנה המועדף עליהם
              </p>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, askAboutMeals: true }))}
                  className={`flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all ${
                    formData.askAboutMeals
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <span className="text-lg mb-1">✓</span>
                  <span className="block">כן, לשאול</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    console.log('=== Setting askAboutMeals to FALSE ===');
                    setFormData((prev) => {
                      console.log('Previous askAboutMeals:', prev.askAboutMeals);
                      return { ...prev, askAboutMeals: false };
                    });
                  }}
                  className={`flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all ${
                    !formData.askAboutMeals
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <span className="text-lg mb-1">✕</span>
                  <span className="block">לא, כולם רגיל</span>
                </button>
              </div>

              {/* Meal Type Selection - Only show when askAboutMeals is true */}
              {formData.askAboutMeals && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-3">בחרו אילו סוגי מנות מיוחדות להציג לאורחים:</p>
                  <p className="text-xs text-gray-500 mb-3">מנה רגילה היא ברירת המחדל - אורחים שלא יבחרו מנה מיוחדת יחושבו כרגיל</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { key: 'vegetarian', label: 'צמחוני', icon: '🥗' },
                      { key: 'vegan', label: 'טבעוני', icon: '🌱' },
                      { key: 'kids', label: 'מנת ילדים', icon: '🧒' },
                      { key: 'glutenFree', label: 'ללא גלוטן', icon: '🌾' },
                      { key: 'other', label: formData.customOtherMealName || 'אחר', icon: '🍽️' },
                    ].map((meal) => (
                      <button
                        key={meal.key}
                        type="button"
                        onClick={() => {
                          const mealKey = meal.key as keyof typeof formData.mealOptions;
                          setFormData((prev) => ({
                            ...prev,
                            mealOptions: {
                              ...prev.mealOptions,
                              [mealKey]: !prev.mealOptions[mealKey],
                            },
                            // Clear custom name if unchecking 'other'
                            ...(mealKey === 'other' && prev.mealOptions.other ? { customOtherMealName: '' } : {}),
                          }));
                        }}
                        className={`flex items-center gap-2 py-2 px-3 rounded-lg border-2 text-sm transition-all ${
                          formData.mealOptions[meal.key as keyof typeof formData.mealOptions]
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        <span>{meal.icon}</span>
                        <span>{meal.label}</span>
                        {formData.mealOptions[meal.key as keyof typeof formData.mealOptions] && (
                          <svg className="w-4 h-4 mr-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                  {/* Custom name input for 'other' meal type */}
                  {formData.mealOptions.other && (
                    <div className="mt-3">
                      <Input
                        type="text"
                        value={formData.customOtherMealName}
                        onChange={(e) => setFormData((prev) => ({ ...prev, customOtherMealName: e.target.value }))}
                        placeholder="הקלידו שם למנה (למשל: כשר למהדרין, ללא לקטוז...)"
                        className="w-full text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">השם שתכתבו יוצג לאורחים במקום "אחר"</p>
                    </div>
                  )}
                </div>
              )}

              {!formData.askAboutMeals && (
                <p className="text-xs text-gray-500 mt-3 text-center">
                  כל האורחים ייחשבו כמנה רגילה
                </p>
              )}
            </div>

            {/* Template Selection */}
            <div className="mb-8">
              <TemplateSelector
                selectedTemplate={formData.invitationTemplate}
                onSelectTemplate={(templateId) => setFormData((prev) => ({ ...prev, invitationTemplate: templateId }))}
              />
            </div>

          </div>
        </Step>

        {/* Step 5: Preview */}
        <Step>
          <div className="space-y-4">
            <div className="text-center mb-2">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">תצוגה מקדימה</h2>
              <p className="text-sm text-gray-500 mt-1">כך תיראה ההזמנה שלכם במובייל</p>
            </div>

            {/* Preview Container */}
            <div className="flex justify-center py-4">
              {/* Phone Frame - iPhone style */}
              <div
                className="relative bg-gradient-to-b from-gray-800 via-gray-900 to-gray-800 rounded-[3rem] p-2 shadow-2xl"
                style={{
                  width: '280px',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255,255,255,0.1)'
                }}
              >
                {/* Phone inner bezel */}
                <div className="bg-black rounded-[2.5rem] overflow-hidden relative">
                  {/* Dynamic Island / Notch */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 bg-black rounded-full px-6 py-1.5 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-800" />
                    <div className="w-12 h-3 rounded-full bg-gray-800" />
                  </div>

                  {/* Screen content */}
                  <div
                    className="bg-white overflow-hidden"
                    style={{ height: '500px' }}
                  >
                    <div
                      className="overflow-y-auto overflow-x-hidden h-full"
                      style={{
                        transform: 'scale(0.65)',
                        transformOrigin: 'top center',
                        width: '154%',
                        marginRight: '-27%',
                        height: '769px' // 500px / 0.65 = 769px to compensate for scale
                      }}
                    >
                    <InvitationRenderer
                      wedding={{
                        ...formData,
                        _id: wedding?._id || 'preview',
                        eventDate: formData.eventDate || new Date().toISOString().split('T')[0],
                        uniqueUrl: wedding?.uniqueUrl || 'preview',
                        status: wedding?.status || 'draft',
                      } as any}
                      dateParts={(() => {
                        const date = formData.eventDate ? new Date(formData.eventDate) : new Date();
                        const hebrew = hebrewDate(date);

                        const convertToHebrewDay = (day: number) => {
                          if (day <= 0 || day > 30) return String(day);
                          if (day === 15) return 'ט״ו';
                          if (day === 16) return 'ט״ז';
                          const units = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
                          const tens = ['', 'י', 'כ', 'ל'];
                          const dayTens = Math.floor(day / 10);
                          const dayUnits = day % 10;
                          const letters: string[] = [];
                          if (dayTens > 0) letters.push(tens[dayTens]);
                          if (dayUnits > 0) letters.push(units[dayUnits]);
                          if (letters.length === 1) return `${letters[0]}׳`;
                          return letters.map((l, i) => i === letters.length - 2 ? `${l}״` : l).join('');
                        };

                        const hebrewMonthFormatter = new Intl.DateTimeFormat('he-IL-u-ca-hebrew', { month: 'long' });
                        const hebrewMonth = hebrewMonthFormatter.format(date);

                        return {
                          day: date.getDate(),
                          month: date.toLocaleDateString('he-IL', { month: 'long' }),
                          year: date.getFullYear(),
                          weekday: date.toLocaleDateString('he-IL', { weekday: 'long' }),
                          hebrewDate: `${convertToHebrewDay(hebrew.date)} ב${hebrewMonth}`.trim(),
                          hebrewWeekday: date.toLocaleDateString('he-IL', { weekday: 'long' }),
                        };
                      })()}
                      isRSVP={false}
                    />
                    </div>
                  </div>

                  {/* Home indicator */}
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-28 h-1 bg-gray-600 rounded-full" />
                </div>

                {/* Side buttons - volume */}
                <div className="absolute -left-0.5 top-24 w-0.5 h-6 bg-gray-700 rounded-l-full" />
                <div className="absolute -left-0.5 top-32 w-0.5 h-10 bg-gray-700 rounded-l-full" />
                <div className="absolute -left-0.5 top-44 w-0.5 h-10 bg-gray-700 rounded-l-full" />
                {/* Side button - power */}
                <div className="absolute -right-0.5 top-32 w-0.5 h-14 bg-gray-700 rounded-r-full" />
              </div>
            </div>

            {/* Confirmation message */}
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                ניתן לגלול בתוך התצוגה כדי לראות את כל ההזמנה
              </p>
              <p className="text-xs text-gray-400">
                לא מרוצים? חזרו לשלבים הקודמים לעריכה
              </p>
            </div>
          </div>
        </Step>

        {/* Step 6: Package Selection */}
        <Step>
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">בחירת חבילה</h2>
              <p className="text-sm sm:text-base text-gray-500 mt-1">בחרו את כמות המוזמנים המקסימלית</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {packageOptions.map((pkg) => {
                const isSelected = formData.maxGuests === pkg.guests;
                const isFree = pkg.price === 0;

                return (
                  <motion.div
                    key={pkg.guests}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={async () => {
                      console.log('=== Package Selection ===');
                      console.log('Current package (before change):', formData.maxGuests);
                      console.log('Selected new package:', pkg.guests);
                      console.log('Wedding paid status:', wedding?.paymentStatus);
                      console.log('Wedding paid package:', wedding?.paymentDetails?.packageGuests);
                      console.log('Wedding paid amount:', wedding?.paymentDetails?.amount);

                      // Fetch current guest count
                      if (wedding?._id) {
                        try {
                          const res = await fetch(`/api/guests?weddingId=${wedding._id}&countOnly=true`);
                          const data = await res.json();
                          console.log('Current guest count:', data.count);
                          if (pkg.guests < data.count) {
                            console.log(`⚠️ WARNING: User has ${data.count} guests but selected package for ${pkg.guests}!`);
                          }
                        } catch (e) {
                          console.log('Could not fetch guest count');
                        }
                      }

                      setFormData((prev) => ({ ...prev, maxGuests: pkg.guests }));
                    }}
                    className={`relative cursor-pointer rounded-xl sm:rounded-2xl border-2 p-3 sm:p-6 transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    {/* Free Badge */}
                    {isFree && (
                      <div className="absolute -top-2 sm:-top-3 -right-2 sm:-right-3 bg-green-500 text-white text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-md">
                        חינם!
                      </div>
                    )}

                    {/* Selected Indicator */}
                    {isSelected && (
                      <div className="absolute top-2 sm:top-3 left-2 sm:left-3 w-5 h-5 sm:w-6 sm:h-6 bg-primary rounded-full flex items-center justify-center">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="sm:w-3.5 sm:h-3.5">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      </div>
                    )}

                    <div className="text-center">
                      {/* Guest Count */}
                      <div className="mb-1 sm:mb-2">
                        <span className="text-2xl sm:text-4xl font-bold text-gray-900">{pkg.guests}</span>
                        <div className="text-gray-500 text-xs sm:text-sm mt-0.5">מוזמנים</div>
                      </div>

                      {/* Price */}
                      <div className={`text-lg sm:text-2xl font-bold ${isFree ? 'text-green-600' : 'text-primary'}`}>
                        {pkg.label}
                      </div>

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">
                        {isFree ? 'מושלם להתחלה' : `עד ${pkg.guests} אורחים`}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Info Box */}
            <div className="p-3 sm:p-4 bg-blue-50 border border-blue-100 rounded-lg sm:rounded-xl">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" className="sm:w-4 sm:h-4">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4M12 8h.01" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-blue-800 font-medium">מה כוללת החבילה?</p>
                  <ul className="text-xs sm:text-sm text-blue-700 mt-1 space-y-0.5 sm:space-y-1">
                    <li>• ניהול אורחים עד למכסה שנבחרה</li>
                    <li>• שליחת הודעות WhatsApp אוטומטיות</li>
                    <li>• דף RSVP מותאם אישית</li>
                    <li>• סידורי ישיבה</li>
                    <li>• סטטיסטיקות ודוחות</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Current Selection Summary */}
            <div className="p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl text-center">
              <p className="text-xs sm:text-sm text-gray-600">
                החבילה הנבחרת: <span className="font-bold text-gray-900">{formData.maxGuests} מוזמנים</span>
                {' - '}
                <span className={formData.maxGuests === 200 ? 'text-green-600 font-bold' : 'text-primary font-bold'}>
                  {packageOptions.find(p => p.guests === formData.maxGuests)?.label}
                </span>
              </p>
            </div>
          </div>
        </Step>

        {/* Step 7: Payment (only if paid package) */}
        {formData.maxGuests > 200 && (
          <Step>
            <div className="space-y-4 sm:space-y-6">


              {/* Payment Error */}
              {paymentError && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg sm:rounded-xl text-center"
                >
                  <p className="text-sm sm:text-base text-red-600">{paymentError}</p>
                  <button
                    onClick={fetchPaymentUrl}
                    className="mt-2 text-xs sm:text-sm text-red-700 underline hover:no-underline"
                  >
                    נסה שוב
                  </button>
                </motion.div>
              )}

              {/* Loading State */}
              {paymentLoading && (
                <div className="flex flex-col items-center justify-center py-12 sm:  bg-gray-50 rounded-xl sm:rounded-2xl">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-12 h-12 sm:w-14 sm:h-14 border-4 border-primary border-t-transparent rounded-full"
                  />
                  <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600 font-medium px-4 text-center">טוען טופס תשלום מאובטח...</p>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">אנא המתן</p>
                </div>
              )}

              {/* Payment iframe */}
              {paymentClearingUrl && !paymentLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl sm:rounded-2xl overflow-hidden shadow-xl border-2 border-gray-100"
                >


                  {/* Iframe content */}
                  <div className="bg-white overflow-hidden" style={{ height: 'calc(100vh - 200px)', minHeight: '400px', width: '100%' }}>
                    <iframe
                      src={paymentClearingUrl}
                      className="w-full h-full border-0"
                      allow="payment"
                      title="טופס תשלום מאובטח"
                    />
                  </div>

                  {/* Iframe footer */}
                  <div className="bg-gray-50 px-3 sm:px-5 py-2 sm:py-3 border-t flex flex-col sm:flex-row items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>מאובטח ע"י Invoice4U</span>
                    </div>
                    <div className="text-xs text-gray-400">קבלה תישלח אוטומטית למייל</div>
                  </div>
                </motion.div>
              )}
            </div>
          </Step>
        )}
      </Stepper>

      {/* Payment Success Modal */}
      <AnimatePresence>
        {paymentSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              {/* Success Animation */}
              <div className="bg-linear-to-br from-green-400 to-emerald-500 p-6 sm:p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-white rounded-full flex items-center justify-center shadow-lg"
                >
                  <motion.svg
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="w-10 h-10 sm:w-12 sm:h-12 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </motion.svg>
                </motion.div>
              </div>

              {/* Content */}
              <div className="p-6 sm:p-8 text-center">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">התשלום בוצע בהצלחה!</h2>
                <p className="text-sm sm:text-base text-gray-600 mb-2">
                  החבילה שלך שודרגה ל-{paidPackageGuests || formData.maxGuests} מוזמנים
                </p>
                <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">קבלה נשלחה לאימייל שלך</p>

                <div className="space-y-2 sm:space-y-3">
                  <Button
                    onClick={() => router.push('/dashboard/guests')}
                    className="w-full"
                  >
                    המשך לניהול אורחים
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/dashboard')}
                    className="w-full"
                  >
                    חזרה לדשבורד
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Refund Request Modal */}
      <RefundRequestModal
        isOpen={showRefundModal}
        onClose={() => setShowRefundModal(false)}
        weddingId={wedding?._id || ''}
        currentPackage={refundData.currentPackage}
        requestedPackage={refundData.requestedPackage}
        paidAmount={refundData.paidAmount}
        userEmail={session?.user?.email || ''}
        userName={session?.user?.name || ''}
        userPhone={wedding?.contactPhone || formData.contactPhone || ''}
      />

      {/* Already Paid / Free Package Confirmation Modal */}
      <AnimatePresence>
        {showAlreadyPaidModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              {/* Success Icon */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 flex justify-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 text-center">
                <h2 className="text-xl font-bold text-gray-900 mb-3">{alreadyPaidMessage}</h2>
                <p className="text-gray-600 mb-6">
                  החבילה שלך: {formData.maxGuests} מוזמנים
                </p>

                <div className="space-y-3">
                  <Button
                    onClick={() => {
                      setShowAlreadyPaidModal(false);
                      router.push('/dashboard/guests');
                    }}
                    className="w-full"
                  >
                    המשך לניהול אורחים
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAlreadyPaidModal(false);
                      router.push('/dashboard');
                    }}
                    className="w-full"
                  >
                    חזרה לדשבורד
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
