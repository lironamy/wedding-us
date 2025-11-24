'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Stepper, Step } from '@/components/ui/Stepper';
import MediaUpload from '@/components/dashboard/MediaUpload';
import BitQrUpload from '@/components/dashboard/BitQrUpload';
import { getGenderText } from '@/lib/utils/genderText';

interface WeddingFormStepperProps {
  wedding?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export default function WeddingFormStepper({ wedding, onSubmit, onCancel }: WeddingFormStepperProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    groomName: '',
    brideName: '',
    partner1Type: 'groom' as 'groom' | 'bride',
    partner2Type: 'bride' as 'groom' | 'bride',
    eventDate: '',
    eventTime: '',
    venue: '',
    venueAddress: '',
    description: '',
    mediaUrl: '',
    mediaType: 'image' as 'image' | 'video',
    bitPhone: '',
    payboxPhone: '',
    enableBitGifts: false,
    bitQrImage: '',
    bitPaymentLink: '',
    backgroundPattern: '',
    maxGuests: 200,
    theme: {
      primaryColor: '#7950a5',
      secondaryColor: '#2C3E50',
      fontFamily: 'Assistant'
    }
  });

  // Package options (TEST PRICES - change back to real prices before production!)
  const packageOptions = [
    { guests: 200, price: 0, label: 'חינם' },
    { guests: 300, price: 1, label: '₪1' },
    { guests: 400, price: 2, label: '₪2' },
    { guests: 500, price: 3, label: '₪3' },
    { guests: 600, price: 4, label: '₪4' },
    { guests: 700, price: 5, label: '₪5' },
    { guests: 800, price: 1, label: '₪1' },
    { guests: 900, price: 2, label: '₪2' },
    { guests: 1000, price: 3, label: '₪3' },
  ];

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
  const baseStepsLabels = ['בני הזוג', 'תאריך ומיקום', 'מדיה', 'מתנות', 'עיצוב', 'חבילה'];
  const stepsLabels = formData.maxGuests > 200
    ? [...baseStepsLabels, 'תשלום']
    : baseStepsLabels;

  useEffect(() => {
    if (wedding) {
      setFormData({
        groomName: wedding.groomName || '',
        brideName: wedding.brideName || '',
        partner1Type: wedding.partner1Type || 'groom',
        partner2Type: wedding.partner2Type || 'bride',
        eventDate: wedding.eventDate ? new Date(wedding.eventDate).toISOString().split('T')[0] : '',
        eventTime: wedding.eventTime || '',
        venue: wedding.venue || '',
        venueAddress: wedding.venueAddress || '',
        description: wedding.description || '',
        mediaUrl: wedding.mediaUrl || '',
        mediaType: wedding.mediaType || 'image',
        bitPhone: wedding.bitPhone || '',
        payboxPhone: wedding.payboxPhone || '',
        enableBitGifts: wedding.enableBitGifts || false,
        bitQrImage: wedding.bitQrImage || '',
        bitPaymentLink: wedding.bitPaymentLink || '',
        backgroundPattern: wedding.backgroundPattern || '',
        maxGuests: wedding.maxGuests || 200,
        theme: wedding.theme || {
          primaryColor: '#7950a5',
          secondaryColor: '#2C3E50',
          fontFamily: 'Assistant'
        }
      });
    }
  }, [wedding]);

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

  const handleColorChange = (colorType: 'primaryColor' | 'secondaryColor', value: string) => {
    setFormData((prev) => ({
      ...prev,
      theme: { ...prev.theme, [colorType]: value }
    }));
  };

  const handleMediaUpload = (url: string, type: 'image' | 'video') => {
    setFormData((prev) => ({ ...prev, mediaUrl: url, mediaType: type }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.groomName.trim()) {
        newErrors.groomName = `שם ה${partnerTypeLabels[formData.partner1Type]} חובה`;
      }
      if (!formData.brideName.trim()) {
        newErrors.brideName = `שם ה${partnerTypeLabels[formData.partner2Type]} חובה`;
      }
    }

    if (step === 2) {
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
    setCurrentStep(newStep);

    // When entering payment step (step 7), fetch clearing URL
    if (newStep === 7 && formData.maxGuests > 200 && wedding?._id && !paymentClearingUrl) {
      await fetchPaymentUrl();
    }
  };

  const fetchPaymentUrl = async () => {
    setPaymentLoading(true);
    setPaymentError('');

    try {
      const selectedPackage = packageOptions.find(p => p.guests === formData.maxGuests);
      if (!selectedPackage) return;

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

      if (data.success && data.clearingUrl) {
        setPaymentClearingUrl(data.clearingUrl);
      } else {
        setPaymentError(data.error || 'אירעה שגיאה ביצירת התשלום');
      }
    } catch (error) {
      console.error('Error fetching payment URL:', error);
      setPaymentError('אירעה שגיאה. נסה שוב.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setLoading(true);
    try {
      // Save the wedding data
      await onSubmit(formData);
      // Payment is handled in step 7 iframe - user will be redirected after payment
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
        hideStepIndicators={currentStep === 7}
        fullWidthContent={currentStep === 7}
        fullHeightLayout={true}
        onCancel={onCancel}
        cancelButtonText="ביטול"
        isLoading={loading}
      >
        {/* Step 1: Partner Details */}
        <Step>
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">פרטי הזוג</h2>
              <p className="text-sm sm:text-base text-gray-500 mt-1">הזינו את שמות הזוג</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              {/* Partner 1 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                {`שם ה${partnerTypeLabels[formData.partner1Type]}`}
                 <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={formData.partner1Type}
                    onChange={(e) => setFormData((prev) => ({ ...prev, partner1Type: e.target.value as 'groom' | 'bride' }))}
                    className="w-full sm:w-auto px-3 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary bg-white text-base"
                    style={{ fontSize: '16px' }}
                  >
                    <option value="groom">חתן</option>
                    <option value="bride">כלה</option>
                  </select>
                  <Input
                    name="groomName"
                    value={formData.groomName}
                    onChange={handleChange}
                    error={errors.groomName}
                    label={`שם ה${partnerTypeLabels[formData.partner1Type]}`}
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Partner 2 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {`שם ה${partnerTypeLabels[formData.partner2Type]}`}
                 <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={formData.partner2Type}
                    onChange={(e) => setFormData((prev) => ({ ...prev, partner2Type: e.target.value as 'groom' | 'bride' }))}
                    className="w-full sm:w-auto px-3 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary bg-white text-base"
                    style={{ fontSize: '16px' }}
                  >
                    <option value="groom">חתן</option>
                    <option value="bride">כלה</option>
                  </select>
                  <Input
                    name="brideName"
                    value={formData.brideName}
                    onChange={handleChange}
                    error={errors.brideName}
                    label={`שם ה${partnerTypeLabels[formData.partner2Type]}`}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </Step>

        {/* Step 2: Date & Venue */}
        <Step>
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">תאריך ומיקום</h2>
              <p className="text-sm sm:text-base text-gray-500 mt-1">מתי ואיפה האירוע?</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <Input
                label="תאריך האירוע"
                name="eventDate"
                type="date"
                value={formData.eventDate}
                onChange={handleChange}
                error={errors.eventDate}
                required
              />

              <Input
                label="שעת האירוע"
                name="eventTime"
                type="time"
                value={formData.eventTime}
                onChange={handleChange}
                error={errors.eventTime}
                required
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
              label="כתובת מלאה- רחוב מספר עיר"
              name="venueAddress"
              value={formData.venueAddress}
              onChange={handleChange}
              error={errors.venueAddress}
              required
            />
          </div>
        </Step>

        {/* Step 3: Media & Description */}
        <Step>
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">מדיה ותוכן</h2>
              <p className="text-sm sm:text-base text-gray-500 mt-1">הוסיפו תמונה או וידאו והודעה אישית</p>
            </div>

            <MediaUpload
              currentMediaUrl={formData.mediaUrl}
              currentMediaType={formData.mediaType}
              onUpload={handleMediaUpload}
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
                rows={4}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-base"
                style={{ fontSize: '16px' }}
                placeholder="מוזמנים לחגוג איתנו..."
              />
            </div>
          </div>
        </Step>

        {/* Step 4: Gifts */}
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

        {/* Step 5: Design */}
        <Step>
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">עיצוב ההזמנה</h2>
              <p className="text-sm sm:text-base text-gray-500 mt-1">התאימו את הצבעים והאפקטים</p>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  צבע ראשי
                </label>
                <div className="flex items-center gap-2 sm:gap-3">
                  <input
                    type="color"
                    value={formData.theme.primaryColor}
                    onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                    className="h-10 sm:h-12 w-16 sm:w-20 rounded-lg border border-gray-300 cursor-pointer"
                  />
                  <Input
                    value={formData.theme.primaryColor}
                    onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  צבע משני
                </label>
                <div className="flex items-center gap-2 sm:gap-3">
                  <input
                    type="color"
                    value={formData.theme.secondaryColor}
                    onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                    className="h-10 sm:h-12 w-16 sm:w-20 rounded-lg border border-gray-300 cursor-pointer"
                  />
                  <Input
                    value={formData.theme.secondaryColor}
                    onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Color Preview */}
            <div className="p-3 sm:p-4 rounded-xl border border-gray-200 bg-gray-50">
              <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">תצוגה מקדימה:</p>
              <div className="flex gap-3 sm:gap-4">
                <div
                  className="flex-1 h-12 sm:h-16 rounded-lg shadow-sm"
                  style={{ backgroundColor: formData.theme.primaryColor }}
                />
                <div
                  className="flex-1 h-12 sm:h-16 rounded-lg shadow-sm"
                  style={{ backgroundColor: formData.theme.secondaryColor }}
                />
              </div>
            </div>

            {/* Torn Paper Effect */}
            <div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">אפקט מעבר</h3>
              <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                בחרו אפקט נייר קרוע שיופיע בין התמונה לתוכן ההזמנה
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                {tornPaperEffects.map((effect) => (
                  <div
                    key={effect.id}
                    onClick={() => setFormData((prev) => ({ ...prev, backgroundPattern: effect.url }))}
                    className={`cursor-pointer rounded-lg sm:rounded-xl border-2 overflow-hidden transition-all ${
                      formData.backgroundPattern === effect.url
                        ? 'border-primary ring-2 ring-primary ring-opacity-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {effect.url ? (
                      <div
                        className="h-16 sm:h-20 bg-contain bg-no-repeat bg-bottom bg-gray-800"
                        style={{ backgroundImage: `url(${effect.url})` }}
                      />
                    ) : (
                      <div className="h-16 sm:h-20 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">ללא</span>
                      </div>
                    )}
                    <div className="p-1.5 sm:p-2 text-center bg-white">
                      <span className="text-xs font-medium">{effect.name}</span>
                    </div>
                  </div>
                ))}
              </div>
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
                    onClick={() => setFormData((prev) => ({ ...prev, maxGuests: pkg.guests }))}
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
                <div className="flex flex-col items-center justify-center py-12 sm:py-16 bg-gray-50 rounded-xl sm:rounded-2xl">
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
              <div className="bg-gradient-to-br from-green-400 to-emerald-500 p-6 sm:p-8 text-center">
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
    </>
  );
}
