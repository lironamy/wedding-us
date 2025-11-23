'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
    theme: {
      primaryColor: '#C4A57B',
      secondaryColor: '#2C3E50',
      fontFamily: 'Assistant'
    }
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

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

  const stepsLabels = ['בני הזוג', 'תאריך ומיקום', 'מדיה', 'מתנות', 'עיצוב'];

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
        theme: wedding.theme || {
          primaryColor: '#C4A57B',
          secondaryColor: '#2C3E50',
          fontFamily: 'Assistant'
        }
      });
    }
  }, [wedding]);

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

  const handleStepChange = (newStep: number) => {
    setCurrentStep(newStep);
  };

  const handleFinalSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Stepper
        initialStep={1}
        onStepChange={handleStepChange}
        onBeforeStepChange={handleBeforeStepChange}
        onFinalStepCompleted={handleFinalSubmit}
        stepsLabels={stepsLabels}
        backButtonText="חזור"
        nextButtonText="המשך"
        completeButtonText={wedding ? 'עדכן חתונה' : 'צור חתונה'}
        disableStepIndicators={false}
        isLoading={loading}
      >
        {/* Step 1: Partner Details */}
        <Step>
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">פרטי הזוג</h2>
              <p className="text-gray-500 mt-1">הזינו את שמות הזוג</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Partner 1 */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                {`שם ה${partnerTypeLabels[formData.partner1Type]}`}
                 <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    value={formData.partner1Type}
                    onChange={(e) => setFormData((prev) => ({ ...prev, partner1Type: e.target.value as 'groom' | 'bride' }))}
                    className="px-3 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary bg-white text-base"
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
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  {`שם ה${partnerTypeLabels[formData.partner2Type]}`}
                 <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    value={formData.partner2Type}
                    onChange={(e) => setFormData((prev) => ({ ...prev, partner2Type: e.target.value as 'groom' | 'bride' }))}
                    className="px-3 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary bg-white text-base"
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
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">תאריך ומיקום</h2>
              <p className="text-gray-500 mt-1">מתי ואיפה האירוע?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              label="כתובת מלאה"
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
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">מדיה ותוכן</h2>
              <p className="text-gray-500 mt-1">הוסיפו תמונה או וידאו והודעה אישית</p>
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
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-base"
                style={{ fontSize: '16px' }}
                placeholder="מוזמנים לחגוג איתנו..."
              />
            </div>
          </div>
        </Step>

        {/* Step 4: Gifts */}
        <Step>
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">קבלת מתנות</h2>
              <p className="text-gray-500 mt-1">אפשרו לאורחים לשלוח מתנות דיגיטליות</p>
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
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">עיצוב ההזמנה</h2>
              <p className="text-gray-500 mt-1">התאימו את הצבעים והאפקטים</p>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  צבע ראשי
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.theme.primaryColor}
                    onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                    className="h-12 w-20 rounded-lg border border-gray-300 cursor-pointer"
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
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.theme.secondaryColor}
                    onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                    className="h-12 w-20 rounded-lg border border-gray-300 cursor-pointer"
                  />
                  <Input
                    value={formData.theme.secondaryColor}
                    onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Color Preview */}
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-600 mb-3">תצוגה מקדימה:</p>
              <div className="flex gap-4">
                <div
                  className="flex-1 h-16 rounded-lg shadow-sm"
                  style={{ backgroundColor: formData.theme.primaryColor }}
                />
                <div
                  className="flex-1 h-16 rounded-lg shadow-sm"
                  style={{ backgroundColor: formData.theme.secondaryColor }}
                />
              </div>
            </div>

            {/* Torn Paper Effect */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">אפקט מעבר</h3>
              <p className="text-sm text-gray-500 mb-4">
                בחרו אפקט נייר קרוע שיופיע בין התמונה לתוכן ההזמנה
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {tornPaperEffects.map((effect) => (
                  <div
                    key={effect.id}
                    onClick={() => setFormData((prev) => ({ ...prev, backgroundPattern: effect.url }))}
                    className={`cursor-pointer rounded-xl border-2 overflow-hidden transition-all ${
                      formData.backgroundPattern === effect.url
                        ? 'border-primary ring-2 ring-primary ring-opacity-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {effect.url ? (
                      <div
                        className="h-20 bg-contain bg-no-repeat bg-bottom bg-gray-800"
                        style={{ backgroundImage: `url(${effect.url})` }}
                      />
                    ) : (
                      <div className="h-20 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">ללא</span>
                      </div>
                    )}
                    <div className="p-2 text-center bg-white">
                      <span className="text-xs font-medium">{effect.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Step>
      </Stepper>

      {/* Cancel Button */}
      <div className="flex justify-center">
        <Button type="button" variant="secondary" onClick={onCancel}>
          ביטול
        </Button>
      </div>
    </div>
  );
}
