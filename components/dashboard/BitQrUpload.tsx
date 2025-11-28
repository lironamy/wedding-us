'use client';

import { useState, useEffect } from 'react';
import jsQR from 'jsqr';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    cloudinary: any;
  }
}

interface BitQrUploadProps {
  enabled: boolean;
  qrImage: string;
  bitPhone: string;
  onEnabledChange: (enabled: boolean) => void;
  onQrScanned: (qrImage: string, bitPhone: string) => void;
}

export default function BitQrUpload({
  enabled,
  qrImage,
  bitPhone,
  onEnabledChange,
  onQrScanned,
}: BitQrUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  useEffect(() => {
    // Load Cloudinary upload widget script
    if (!document.getElementById('cloudinary-upload-widget')) {
      const script = document.createElement('script');
      script.id = 'cloudinary-upload-widget';
      script.src = 'https://upload-widget.cloudinary.com/global/all.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const scanQrFromImage = async (imageUrl: string): Promise<string | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          resolve(code.data);
        } else {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = imageUrl;
    });
  };

  const openUploadWidget = () => {
    if (!window.cloudinary) {
      toast.error('Cloudinary לא נטען עדיין. אנא נסה שוב.');
      return;
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    if (!cloudName) {
      toast.error('Cloudinary לא מוגדר. אנא הוסף את המשתנים לקובץ .env.local');
      return;
    }

    setUploading(true);
    setError('');

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName,
        uploadPreset: 'wedding_media',
        sources: ['local', 'camera'],
        multiple: false,
        maxFileSize: 5000000, // 5MB
        resourceType: 'image',
        clientAllowedFormats: ['jpg', 'jpeg', 'png'],
        folder: 'bit_qr_codes',
        language: 'he',
      },
      async (uploadError: any, result: any) => {
        if (uploadError) {
          console.error('Upload error:', uploadError);
          setError('שגיאה בהעלאת התמונה');
          setUploading(false);
          return;
        }

        if (result.event === 'success') {
          const mediaUrl = result.info.secure_url;
          widget.close();

          // Now scan the QR code
          setScanning(true);
          const qrData = await scanQrFromImage(mediaUrl);
          setScanning(false);
          setUploading(false);

          if (!qrData) {
            setError('לא הצלחנו לזהות קוד QR בתמונה. נסה להעלות תמונה ברורה יותר.');
            return;
          }

          // Check if it's a valid Bit payment link
          if (!qrData.includes('bit') && !qrData.includes('paybox')) {
            setError('הקוד שנסרק לא נראה כמו לינק תשלום של ביט. אנא וודא שהעלית את הקוד הנכון.');
            return;
          }

          onQrScanned(mediaUrl, qrData);
          toast.success('קוד QR נסרק בהצלחה!');
        }

        if (result.event === 'close') {
          setUploading(false);
        }
      }
    );

    widget.open();
  };

  const handleRemoveQr = () => {
    onQrScanned('', '');
  };

  return (
    <Card>
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">
          קבלת מתנות דרך ביט
        </h2>

        {/* Enable Checkbox */}
        <label className="flex items-center gap-3 cursor-pointer mb-4">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onEnabledChange(e.target.checked)}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-gray-700">אני רוצה לאפשר לאורחים לשלוח מתנות דרך ביט</span>
        </label>

        {/* Instructions and Upload - only show when enabled */}
        {enabled && (
          <div className="space-y-4 mt-4 border-t pt-4">
            {/* Info Icon with Label */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowInfoModal(true)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm font-medium">איך להוציא את קוד ה-QR מביט?</span>
              </button>
            </div>

            {/* Upload Area */}
            {!qrImage ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <button
                  type="button"
                  onClick={openUploadWidget}
                  disabled={uploading || scanning}
                  className="cursor-pointer flex flex-col items-center w-full"
                >
                  <svg
                    className="w-12 h-12 text-gray-400 mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-gray-600 font-medium">
                    {uploading ? 'מעלה...' : scanning ? 'סורק QR...' : 'לחצו להעלאת תמונת QR'}
                  </span>
                  <span className="text-gray-400 text-sm mt-1">PNG, JPG עד 5MB</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* QR Preview */}
                <div className="flex items-start gap-4">
                  <img
                    src={qrImage}
                    alt="Bit QR Code"
                    className="w-32 h-32 object-contain border rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="text-green-600 font-medium flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      קוד QR נסרק בהצלחה!
                    </p>
                    {bitPhone && (
                      <p className="text-gray-500 text-sm mt-1 break-all">
                        לינק: {bitPhone.length > 50 ? `${bitPhone.substring(0, 50)}...` : bitPhone}
                      </p>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveQr}
                      className="mt-3"
                    >
                      החלף תמונה
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}

            
          </div>
        )}
      </div>

      {/* Important Notice */}
      <div className="mt-4 p-4 bg-amber-50 border-r-4 border-amber-400 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-5 h-5 mt-0.5">
                  <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-amber-800 mb-1">מידע חשוב</h4>
                  <p className="text-sm text-amber-700">
                    קבלת מתנות דרך ביט כפופה להגבלות ולתנאי השימוש של אפליקציית ביט.
                    יש לוודא שחשבון ה-ביט שלכם פעיל ומאושר לקבלת תשלומים לפני השימוש בשירות.
                  </p>
                </div>
              </div>
            </div>

      {/* Info Modal */}
      <Modal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        title="איך להוציא את קוד ה-QR מביט?"
        size="sm"
        footer={
          <Button
            onClick={() => setShowInfoModal(false)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
          >
            הבנתי!
          </Button>
        }
      >
        <ol className="space-y-4">
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">1</span>
            <span className="text-gray-700 pt-0.5">פתחו את אפליקציית <strong className="text-blue-600">ביט</strong> בטלפון נייד</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">2</span>
            <span className="text-gray-700 pt-0.5">לחצו על <strong>פרופיל</strong> (בתפריט למטה)</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">3</span>
            <span className="text-gray-700 pt-0.5">לחצו על <strong>&quot;קוד ה-QR הקבוע שלי לקבלת כסף&quot;</strong></span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">4</span>
            <span className="text-gray-700 pt-0.5">לחצו על <strong>שיתוף הקוד</strong> ושמרו את התמונה לגלריה</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-sm">5</span>
            <span className="text-gray-700 pt-0.5">העלו את התמונה כאן</span>
          </li>
        </ol>
      </Modal>
    </Card>
  );
}
