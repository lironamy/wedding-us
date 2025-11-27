'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Image from 'next/image';
import ImagePositionEditor from './ImagePositionEditor';

interface MediaUploadProps {
  currentMediaUrl?: string;
  currentMediaType?: 'image' | 'video';
  onUpload: (url: string, type: 'image' | 'video') => void;
  mediaPosition?: { x: number; y: number };
  onPositionChange?: (position: { x: number; y: number }) => void;
  theme?: {
    primaryColor: string;
    secondaryColor: string;
  };
}

declare global {
  interface Window {
    cloudinary: any;
  }
}

export default function MediaUpload({
  currentMediaUrl,
  currentMediaType,
  onUpload,
  mediaPosition = { x: 50, y: 50 },
  onPositionChange,
  theme = { primaryColor: '#7950a5', secondaryColor: '#2C3E50' }
}: MediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentMediaUrl);
  const [previewType, setPreviewType] = useState(currentMediaType);

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

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName,
        uploadPreset: 'wedding_media',
        sources: ['local', 'url', 'camera'],
        multiple: false,
        maxFileSize: 10000000, // 10MB
        resourceType: 'image',
        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        cropping: false,
        folder: 'weddings',
        language: 'he',
        text: {
          he: {
            or: 'או',
            back: 'חזרה',
            close: 'סגור',
            menu: {
              files: 'הקבצים שלי',
              web: 'כתובת אינטרנט',
              camera: 'מצלמה'
            },
            local: {
              browse: 'בחר קובץ',
              dd_title_single: 'גרור תמונה לכאן',
              drop_title_single: 'שחרר כדי להעלות'
            }
          }
        }
      },
      (error: any, result: any) => {
        setUploading(false);

        if (error) {
          console.error('Upload error:', error);
          toast.error('שגיאה בהעלאת הקובץ');
          return;
        }

        if (result.event === 'success') {
          const mediaUrl = result.info.secure_url;
          const mediaType = result.info.resource_type === 'video' ? 'video' : 'image';

          setPreviewUrl(mediaUrl);
          setPreviewType(mediaType);
          onUpload(mediaUrl, mediaType);

          widget.close();
        }
      }
    );

    widget.open();
  };

  const removeMedia = () => {
    setPreviewUrl(undefined);
    setPreviewType(undefined);
    onUpload('', 'image');
  };

  return (
    <Card>
      <div className="p-6">
        <h2
          className="text-xl font-semibold mb-4"
          style={{ color: theme.primaryColor }}
        >
          תמונה להזמנה
        </h2>

        {previewUrl ? (
          <div className="space-y-4">
            {/* Image Position Editor - only for images, not videos */}
            {previewType === 'image' && onPositionChange ? (
              <ImagePositionEditor
                imageUrl={previewUrl}
                position={mediaPosition}
                onPositionChange={onPositionChange}
              />
            ) : (
              /* Simple Preview for videos */
              <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
                {previewType === 'video' ? (
                  <video
                    src={previewUrl}
                    className="w-full h-full object-cover"
                    controls
                  />
                ) : (
                  <Image
                    src={previewUrl}
                    alt="תצוגה מקדימה"
                    fill
                    className="object-cover"
                  />
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={openUploadWidget}
                disabled={uploading}
              >
                {uploading ? 'מעלה...' : 'החלף תמונה'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={removeMedia}
              >
                הסר
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
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
              <p className="mt-4 text-gray-600">לא הועלתה תמונה</p>
              <p className="text-sm text-gray-500 mt-2">
                JPG, PNG, GIF, WEBP עד 10MB
              </p>
              <p className="text-sm text-blue-600 mt-2 font-medium">
                💡 מומלץ להעלות תמונה עומדת (Portrait) לתצוגה אופטימלית
              </p>
            </div>

            <Button
              type="button"
              onClick={openUploadWidget}
              disabled={uploading}
              className="w-full"
            >
              {uploading ? 'מעלה...' : 'העלה תמונה'}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
