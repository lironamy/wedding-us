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
    theme: {
      primaryColor: '#C4A57B',
      secondaryColor: '#2C3E50',
      fontFamily: 'Assistant'
    }
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel}>
          ביטול
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'שומר...' : wedding ? 'עדכן חתונה' : 'צור חתונה'}
        </Button>
      </div>
    </form>
  );
}
