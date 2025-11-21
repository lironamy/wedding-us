'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import MediaUpload from '@/components/dashboard/MediaUpload';
import BitQrUpload from '@/components/dashboard/BitQrUpload';
import { getGenderText } from '@/lib/utils/genderText';

interface WeddingFormProps {
  wedding?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export default function WeddingForm({ wedding, onSubmit, onCancel }: WeddingFormProps) {
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

  const partnerTypeLabels = {
    groom: 'חתן',
    bride: 'כלה'
  };

  // Available torn paper effects for transition between image and content
  const tornPaperEffects = [
    {
      id: 'none',
      name: 'ללא אפקט',
      url: '',
    },
    {
      id: 'torn1',
      name: 'נייר קרוע 1',
      url: 'https://64.media.tumblr.com/52f3f4542616d233b4bdef01fc22fe4b/0e2dd220497b2358-8c/s540x810/352ede408d4a46c68011c4ebe7e639a289ac7ba8.pnj',
    },
    {
      id: 'torn2',
      name: 'נייר קרוע 2',
      url: 'https://64.media.tumblr.com/79bb9229e726fa069278664509229883/1b93ac2a972d238e-9c/s540x810/524b4e38476153f160125e9882c69595bada675c.pnj',
    },
    {
      id: 'torn3',
      name: 'נייר קרוע 3',
      url: 'https://64.media.tumblr.com/7f595934e76b351c3185eee4beb593aa/1435469a36784852-60/s540x810/df411b9d0592a9c5717ec4210cb6a985b921e65d.pnj',
    },
    {
      id: 'torn4',
      name: 'נייר קרוע 4',
      url: 'https://64.media.tumblr.com/6c9beb7e457d141f8bd6110c5a01dffb/50c56bfeebf13bad-26/s540x810/1ebd561c7897b6e2e3b024e3ea39a0873e21b700.pnj',
    },
    {
      id: 'torn5',
      name: 'נייר קרוע 5',
      url: 'https://64.media.tumblr.com/125197364ac617bea05915e6c6659f0c/a0823e13d8878794-a5/s540x810/68ff766465968407fd81a7892e4111b88daae649.pnj',
    },
    {
      id: 'torn6',
      name: 'נייר קרוע 6',
      url: 'https://64.media.tumblr.com/1eab4c696fb31da9237c10073e2c0b85/efb83fbbff20637d-97/s540x810/3759ab1afae361f084473620f11e0bbac746d606.pnj',
    },
  ];

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);

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
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleColorChange = (colorType: 'primaryColor' | 'secondaryColor', value: string) => {
    setFormData((prev) => ({
      ...prev,
      theme: {
        ...prev.theme,
        [colorType]: value
      }
    }));
  };

  const handleMediaUpload = (url: string, type: 'image' | 'video') => {
    setFormData((prev) => ({
      ...prev,
      mediaUrl: url,
      mediaType: type
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.groomName.trim()) {
      newErrors.groomName = `שם ה${partnerTypeLabels[formData.partner1Type]} חובה`;
    }
    if (!formData.brideName.trim()) {
      newErrors.brideName = `שם ה${partnerTypeLabels[formData.partner2Type]} חובה`;
    }
    if (!formData.eventDate) {
      newErrors.eventDate = 'תאריך האירוע חובה';
    }
    if (!formData.eventTime) {
      newErrors.eventTime = 'שעת האירוע חובה';
    }
    if (!formData.venue.trim()) {
      newErrors.venue = 'שם האולם חובה';
    }
    if (!formData.venueAddress.trim()) {
      newErrors.venueAddress = 'כתובת האולם חובה';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">פרטי החתונה</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Partner 1 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                שם בן/בת הזוג הראשון/ה <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <select
                  value={formData.partner1Type}
                  onChange={(e) => setFormData((prev) => ({ ...prev, partner1Type: e.target.value as 'groom' | 'bride' }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C4A57B] focus:border-transparent bg-white"
                >
                  <option value="groom">חתן</option>
                  <option value="bride">כלה</option>
                </select>
                <Input
                  name="groomName"
                  value={formData.groomName}
                  onChange={handleChange}
                  error={errors.groomName}
                  placeholder={`שם ה${partnerTypeLabels[formData.partner1Type]}`}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Partner 2 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                שם בן/בת הזוג השני/ה <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <select
                  value={formData.partner2Type}
                  onChange={(e) => setFormData((prev) => ({ ...prev, partner2Type: e.target.value as 'groom' | 'bride' }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C4A57B] focus:border-transparent bg-white"
                >
                  <option value="groom">חתן</option>
                  <option value="bride">כלה</option>
                </select>
                <Input
                  name="brideName"
                  value={formData.brideName}
                  onChange={handleChange}
                  error={errors.brideName}
                  placeholder={`שם ה${partnerTypeLabels[formData.partner2Type]}`}
                  className="flex-1"
                />
              </div>
            </div>

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
        </div>
      </Card>

      {/* Venue Information */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">מיקום האירוע</h2>

          <div className="space-y-4">
            <Input
              label="שם האולם"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              error={errors.venue}
              placeholder="לדוגמה: אולמי דיאנה"
              required
            />

            <Input
              label="כתובת מלאה"
              name="venueAddress"
              value={formData.venueAddress}
              onChange={handleChange}
              error={errors.venueAddress}
              placeholder="רחוב, מספר, עיר"
              required
            />
          </div>
        </div>
      </Card>

      {/* Description */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">תיאור (אופציונלי)</h2>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              הודעה אישית לאורחים
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C4A57B] focus:border-transparent"
              placeholder="מוזמנים לחגוג איתנו..."
            />
          </div>
        </div>
      </Card>

      {/* Media Upload */}
      <MediaUpload
        currentMediaUrl={formData.mediaUrl}
        currentMediaType={formData.mediaType}
        onUpload={handleMediaUpload}
        theme={formData.theme}
      />

      {/* Bit Gift Payment */}
      <BitQrUpload
        enabled={formData.enableBitGifts}
        qrImage={formData.bitQrImage}
        bitPhone={formData.bitPhone}
        onEnabledChange={(enabled) => setFormData((prev) => ({ ...prev, enableBitGifts: enabled }))}
        onQrScanned={(qrImage, bitPhone) => setFormData((prev) => ({ ...prev, bitQrImage: qrImage, bitPhone: bitPhone }))}
      />

      {/* Theme Customization */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">התאמת צבעים</h2>

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
                  className="h-12 w-20 rounded border border-gray-300 cursor-pointer"
                />
                <Input
                  value={formData.theme.primaryColor}
                  onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                  placeholder="#C4A57B"
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
                  className="h-12 w-20 rounded border border-gray-300 cursor-pointer"
                />
                <Input
                  value={formData.theme.secondaryColor}
                  onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                  placeholder="#2C3E50"
                />
              </div>
            </div>
          </div>

          {/* Color Preview */}
          <div className="mt-6 p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-3">תצוגה מקדימה:</p>
            <div className="flex gap-4">
              <div
                className="flex-1 h-20 rounded-lg shadow-sm"
                style={{ backgroundColor: formData.theme.primaryColor }}
              />
              <div
                className="flex-1 h-20 rounded-lg shadow-sm"
                style={{ backgroundColor: formData.theme.secondaryColor }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Torn Paper Effect Selection */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">אפקט מעבר בין תמונה לתוכן</h2>
          <p className="text-sm text-gray-600 mb-4">
            בחרו אפקט נייר קרוע שיופיע בין התמונה לתוכן ההזמנה
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {tornPaperEffects.map((effect) => (
              <div
                key={effect.id}
                onClick={() => setFormData((prev) => ({ ...prev, backgroundPattern: effect.url }))}
                className={`cursor-pointer rounded-lg border-2 overflow-hidden transition-all ${
                  formData.backgroundPattern === effect.url
                    ? 'border-gold ring-2 ring-gold ring-opacity-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {effect.url ? (
                  <div
                    className="h-24 bg-contain bg-no-repeat bg-bottom bg-gray-800"
                    style={{ backgroundImage: `url(${effect.url})` }}
                  />
                ) : (
                  <div className="h-24 bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">ללא אפקט</span>
                  </div>
                )}
                <div className="p-2 text-center">
                  <span className="text-sm font-medium">{effect.name}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Preview with selected effect */}
          {formData.backgroundPattern && (
            <div className="mt-6">
              <p className="text-sm text-gray-600 mb-3">תצוגה מקדימה:</p>
              <div className="relative rounded-lg border border-gray-200 overflow-hidden w-1/2 h-full">
                {/* User's uploaded image or placeholder */}
                <div className="relative">
                  {formData.mediaUrl ? (
                    formData.mediaType === 'video' ? (
                      <video
                        src={formData.mediaUrl}
                        className="w-full object-cover"
                        muted
                      />
                    ) : (
                      <img
                        src={formData.mediaUrl}
                        alt="תמונת ההזמנה"
                        className="w-full object-cover"
                      />
                    )
                  ) : (
                    <div className="w-full h-40 bg-linear-to-b from-gray-300 to-gray-400 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">התמונה שלכם תופיע כאן</span>
                    </div>
                  )}
                  {/* Torn paper effect - positioned at bottom of image */}
                  <div
                    className="absolute -bottom-1 left-0 right-0 h-16 bg-no-repeat bg-bottom pointer-events-none"
                    style={{
                      backgroundImage: `url(${formData.backgroundPattern})`,
                      backgroundSize: '100% auto',
                    }}
                  />
                </div>
                {/* Content area preview */}
                <div className="h-12 bg-[#fffff6] flex items-center justify-center">
                  <span className="text-gray-400 text-xs">תוכן ההזמנה</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <Button
          type="button"
          variant="secondary"
          onClick={() => setShowPreview(true)}
        >
          תצוגה מקדימה
        </Button>
        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={onCancel}>
            ביטול
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'שומר...' : wedding ? 'עדכן חתונה' : 'צור חתונה'}
          </Button>
        </div>
      </div>

      {/* Mobile Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">תצוגה מקדימה - מובייל</h3>
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            {/* Google Fonts for Preview */}
            <link
              href="https://fonts.googleapis.com/css2?family=Allura&family=Heebo:wght@300;400;500;700&family=Suez+One&display=swap"
              rel="stylesheet"
            />

            {/* Phone Frame */}
            <div className="p-4 bg-gray-100">
              <div className="mx-auto w-[320px] h-[568px] bg-[#fffff6] rounded-4xl shadow-xl border-4 border-gray-800 overflow-hidden relative">
                {/* Phone Notch */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-xl z-20"></div>

                {/* Phone Screen Content */}
                <div
                  className="relative h-full overflow-y-auto"
                  style={{ fontFamily: 'Heebo, Assistant, sans-serif' }}
                >
                  {/* Hero Image - Full display like actual invitation */}
                  {formData.mediaUrl && (
                    <div className="relative w-full">
                      {formData.mediaType === 'video' ? (
                        <video
                          src={formData.mediaUrl}
                          className="w-full h-auto object-contain"
                          muted
                          autoPlay
                          loop
                          playsInline
                        />
                      ) : (
                        <img
                          src={formData.mediaUrl}
                          alt="Wedding"
                          className="w-full h-auto object-contain"
                        />
                      )}
                    </div>
                  )}

                  {/* Torn Paper Effect */}
                  {formData.mediaUrl && formData.backgroundPattern && (
                    <div
                      className="relative h-12 w-full pointer-events-none -mt-1"
                      style={{
                        backgroundImage: `url("${formData.backgroundPattern}")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'top center',
                        backgroundSize: 'cover',
                      }}
                    />
                  )}

                  {/* Content */}
                  <div className="relative bg-[#fffff6] px-3 pt-2">
                    {/* Names - Decorative Font */}
                    <div className="mb-2 flex flex-wrap items-center justify-center gap-1 text-center">
                      <h1
                        className="text-2xl"
                        style={{
                          letterSpacing: '0.05em',
                          color: '#555050',
                          fontFamily: '"Suez One", "Heebo", serif',
                          fontWeight: 600,
                        }}
                      >
                        {formData.groomName || partnerTypeLabels[formData.partner1Type]}
                      </h1>
                      <span
                        className="text-2xl pt-1"
                        style={{
                          color: '#c2b57f',
                          fontFamily: '"Allura", cursive',
                        }}
                      >
                        &
                      </span>
                      <h1
                        className="text-2xl"
                        style={{
                          letterSpacing: '0.05em',
                          color: '#555050',
                          fontFamily: '"Suez One", "Heebo", serif',
                          fontWeight: 600,
                        }}
                      >
                        {formData.brideName || partnerTypeLabels[formData.partner2Type]}
                      </h1>
                    </div>

                    {/* Quote */}
                    <p className="text-center text-[8px] text-gray-400 px-2 mb-2">
                      מים רבים לא יוכלו לכבות את האהבה ונהרות לא ישטפוה
                    </p>

                    {/* Invitation Text */}
                    <p className="text-center text-xs text-gray-700 mb-2">
                      {getGenderText('happy', formData.partner1Type, formData.partner2Type)} ו{getGenderText('thrilled', formData.partner1Type, formData.partner2Type)} להזמינכם ליום המאושר בחיינו
                    </p>

                    {/* Event Times */}
                    <div className="text-center text-[10px] text-gray-700 space-y-0.5 mb-2">
                      <p>קבלת פנים {formData.eventTime || '--:--'}</p>
                      <p>חופה וקידושין {formData.eventTime || '--:--'}</p>
                    </div>

                    {/* Date Display Box */}
                    <div className="flex justify-center mb-2">
                      <div className="rounded px-3 py-2 inline-flex items-center gap-3">
                        <span className="text-[10px] font-medium w-12 text-center text-gray-600 border-b border-t border-zinc-400 py-1">
                          {formData.eventDate
                            ? new Date(formData.eventDate).toLocaleDateString('he-IL', { weekday: 'long' })
                            : 'יום'}
                        </span>
                        <div className="text-center">
                          <p className="text-[8px] text-gray-500">
                            {formData.eventDate
                              ? new Date(formData.eventDate).toLocaleDateString('he-IL', { month: 'long' })
                              : 'חודש'}
                          </p>
                          <p className="text-2xl font-bold text-gray-800">
                            {formData.eventDate ? new Date(formData.eventDate).getDate() : '--'}
                          </p>
                          <p className="text-[8px] text-gray-500">
                            {formData.eventDate ? new Date(formData.eventDate).getFullYear() : '----'}
                          </p>
                        </div>
                        <span className="text-[10px] font-medium w-12 text-center text-gray-600 border-b border-t border-zinc-400 py-1">
                          {formData.eventTime || '--:--'}
                        </span>
                      </div>
                    </div>

                    {/* Venue */}
                    <div className="mb-3 flex flex-col items-center text-center space-y-0.5">
                      <p className="text-xs font-medium text-gray-800">
                        בגן אירועים "{formData.venue || 'שם האולם'}"
                      </p>
                      <p className="text-[10px] text-gray-600">{formData.venueAddress || 'כתובת האולם'}</p>
                    </div>

                    {/* RSVP Placeholder */}
                    <div className="mb-3 p-2 border border-dashed border-gray-300 rounded-lg text-center">
                      <p className="text-[10px] text-gray-500">טופס אישור הגעה</p>
                    </div>

                    {/* Divider */}
                    <div
                      className="w-10 h-0.5 mx-auto mb-3"
                      style={{ backgroundColor: formData.theme.primaryColor, opacity: 0.5 }}
                    />

                    {/* Map Links */}
                    <div className="mb-3">
                      <h3 className="text-center text-xs font-medium text-gray-700 mb-2">
                        ניווט לאירוע
                      </h3>
                      <div className="flex gap-2 justify-center">
                        <div className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded text-[10px] flex items-center gap-1">
                          <span>📍</span>
                          <span>Google Maps</span>
                        </div>
                        <div className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded text-[10px] flex items-center gap-1">
                          <span>🚗</span>
                          <span>Waze</span>
                        </div>
                      </div>
                    </div>

                    {/* Gift Links */}
                    {formData.enableBitGifts && formData.bitPhone && (
                      <div className="mb-3">
                        <h3 className="text-center text-xs font-medium text-gray-700 mb-1">
                          רוצים לשלוח מתנה?
                        </h3>
                        <p className="text-center text-[9px] text-gray-500 mb-2">
                          תודה מראש על המחשבה
                        </p>
                        <div className="flex gap-2 justify-center">
                          <div className="px-3 py-1.5 bg-blue-500 text-white rounded text-[10px] flex items-center gap-1">
                            <span>💳</span>
                            <span>שליחת מתנה ב-Bit</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="py-3 border-t border-gray-200">
                      <p className="text-gray-400 text-[10px] text-center">
                        נשמח לראותכם בחגיגה שלנו
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
