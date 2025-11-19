'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import MediaUpload from '@/components/dashboard/MediaUpload';

interface WeddingFormProps {
  wedding?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export default function WeddingForm({ wedding, onSubmit, onCancel }: WeddingFormProps) {
  const [formData, setFormData] = useState({
    groomName: '',
    brideName: '',
    eventDate: '',
    eventTime: '',
    venue: '',
    venueAddress: '',
    description: '',
    mediaUrl: '',
    mediaType: 'image' as 'image' | 'video',
    bitPhone: '',
    payboxPhone: '',
    backgroundPattern: '',
    theme: {
      primaryColor: '#C4A57B',
      secondaryColor: '#2C3E50',
      fontFamily: 'Assistant'
    }
  });

  // Available background patterns
  const backgroundPatterns = [
    {
      id: 'none',
      name: 'ללא רקע',
      url: '',
    },
    {
      id: 'floral1',
      name: 'פרחים זהב',
      url: 'https://64.media.tumblr.com/8229aaeb4160bfd00ff2d66ce4b83890/79daf7a0c0d98bac-bd/s400x600/7eebe4dbbf5af0510ada7f36af71352255977f49.jpg',
    },
    {
      id: 'floral2',
      name: 'פרחים ורוד',
      url: 'https://64.media.tumblr.com/f6f1801f182ca11da93f02200e1c351c/2afe91728e79b83c-ef/s540x810/d89b8e0a31dda2c0e8b6759de16a50644f090be7.webp',
    },
    {
      id: 'floral3',
      name: 'פרחים קלאסי',
      url: 'https://64.media.tumblr.com/7d75fcb1d4a307ae9055d1a7d0bfa03c/02e627730a0c6bf9-0a/s540x810/2763d30a4035d4fe19cfa31f0710d6f4cb4d1c3d.jpg',
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
        eventDate: wedding.eventDate ? new Date(wedding.eventDate).toISOString().split('T')[0] : '',
        eventTime: wedding.eventTime || '',
        venue: wedding.venue || '',
        venueAddress: wedding.venueAddress || '',
        description: wedding.description || '',
        mediaUrl: wedding.mediaUrl || '',
        mediaType: wedding.mediaType || 'image',
        bitPhone: wedding.bitPhone || '',
        payboxPhone: wedding.payboxPhone || '',
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
      newErrors.groomName = 'שם החתן חובה';
    }
    if (!formData.brideName.trim()) {
      newErrors.brideName = 'שם הכלה חובה';
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
            <Input
              label="שם החתן"
              name="groomName"
              value={formData.groomName}
              onChange={handleChange}
              error={errors.groomName}
              required
            />

            <Input
              label="שם הכלה"
              name="brideName"
              value={formData.brideName}
              onChange={handleChange}
              error={errors.brideName}
              required
            />

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

      {/* Payment Information */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">
            פרטי תשלום למתנות (אופציונלי)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="מספר טלפון ל-Bit"
              name="bitPhone"
              value={formData.bitPhone}
              onChange={handleChange}
              placeholder="05xxxxxxxx"
            />

            <Input
              label="מספר טלפון ל-Paybox"
              name="payboxPhone"
              value={formData.payboxPhone}
              onChange={handleChange}
              placeholder="05xxxxxxxx"
            />
          </div>
        </div>
      </Card>

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

      {/* Background Pattern Selection */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">רקע להזמנה</h2>
          <p className="text-sm text-gray-600 mb-4">
            בחרי תמונת רקע עם פאטרן חוזר להזמנה שלך
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {backgroundPatterns.map((pattern) => (
              <div
                key={pattern.id}
                onClick={() => setFormData((prev) => ({ ...prev, backgroundPattern: pattern.url }))}
                className={`cursor-pointer rounded-lg border-2 overflow-hidden transition-all ${
                  formData.backgroundPattern === pattern.url
                    ? 'border-gold ring-2 ring-gold ring-opacity-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {pattern.url ? (
                  <div
                    className="h-32 bg-cover bg-center"
                    style={{ backgroundImage: `url(${pattern.url})` }}
                  />
                ) : (
                  <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">ללא רקע</span>
                  </div>
                )}
                <div className="p-2 text-center">
                  <span className="text-sm font-medium">{pattern.name}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Preview with selected pattern */}
          {formData.backgroundPattern && (
            <div className="mt-6">
              <p className="text-sm text-gray-600 mb-3">תצוגה מקדימה של הרקע:</p>
              <div className="relative h-40 rounded-lg border border-gray-200 overflow-hidden">
                <div
                  className="absolute inset-0 z-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${formData.backgroundPattern})`,
                    backgroundSize: '150px',
                    backgroundRepeat: 'repeat',
                  }}
                />
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
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

            {/* Phone Frame */}
            <div className="p-4 bg-gray-100">
              <div className="mx-auto w-[320px] h-[568px] bg-white rounded-[2rem] shadow-xl border-4 border-gray-800 overflow-hidden relative">
                {/* Phone Notch */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-xl z-10"></div>

                {/* Phone Screen Content */}
                <div
                  className="relative h-full overflow-y-auto pt-8"
                  style={{ fontFamily: formData.theme.fontFamily }}
                >
                  {/* Background Pattern */}
                  {formData.backgroundPattern ? (
                    <div
                      className="absolute inset-0 z-0 pointer-events-none"
                     
                    />
                  ) : (
                    <div
                      className="absolute inset-0 z-0 pointer-events-none"
                      style={{
                        background: `linear-gradient(135deg, ${formData.theme.primaryColor}15 0%, ${formData.theme.secondaryColor}15 100%)`,
                      }}
                    />
                  )}

                  {/* Content */}
                  <div className="relative z-10 p-4">
                    {/* Header */}
                    <div className="text-center mb-4">
                      <h1
                        className="text-2xl font-bold mb-1"
                        style={{ color: formData.theme.primaryColor }}
                      >
                        {formData.groomName || 'חתן'} ו{formData.brideName || 'כלה'}
                      </h1>
                      <p className="text-sm text-gray-600">מתחתנים!</p>
                    </div>

                    {/* Media */}
                    {formData.mediaUrl && (
                      <div className="mb-4 rounded-lg overflow-hidden shadow-md">
                        {formData.mediaType === 'video' ? (
                          <video
                            src={formData.mediaUrl}
                            className="w-full h-32 object-cover"
                            muted
                          />
                        ) : (
                          <img
                            src={formData.mediaUrl}
                            alt="Wedding"
                            className="w-full h-32 object-cover"
                          />
                        )}
                      </div>
                    )}

                    {/* Description */}
                    {formData.description && (
                      <p className="text-center text-gray-700 text-sm mb-4">
                        {formData.description}
                      </p>
                    )}

                    {/* Event Details Card */}
                    <div className="bg-white rounded-lg shadow-md p-3 mb-4">
                      <h3
                        className="text-sm font-semibold mb-2 text-center"
                        style={{ color: formData.theme.primaryColor }}
                      >
                        פרטי האירוע
                      </h3>
                      <div className="text-center text-xs text-gray-600 space-y-1">
                        <p>
                          {formData.eventDate
                            ? new Date(formData.eventDate).toLocaleDateString('he-IL', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })
                            : 'תאריך לא נבחר'}
                        </p>
                        <p>בשעה {formData.eventTime || '--:--'}</p>
                        <p className="font-medium">{formData.venue || 'שם האולם'}</p>
                        <p>{formData.venueAddress || 'כתובת האולם'}</p>
                      </div>
                    </div>

                    {/* Map Links */}
                    <div className="flex gap-2 justify-center mb-4">
                      <div className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs">
                        Google Maps
                      </div>
                      <div className="px-3 py-1.5 bg-cyan-600 text-white rounded text-xs">
                        Waze
                      </div>
                    </div>

                    {/* Gift Links */}
                    {(formData.bitPhone || formData.payboxPhone) && (
                      <div className="flex gap-2 justify-center">
                        {formData.bitPhone && (
                          <div className="px-3 py-1.5 bg-blue-500 text-white rounded text-xs">
                            Bit
                          </div>
                        )}
                        {formData.payboxPhone && (
                          <div className="px-3 py-1.5 bg-purple-600 text-white rounded text-xs">
                            Paybox
                          </div>
                        )}
                      </div>
                    )}
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
