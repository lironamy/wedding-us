'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';

type ClientStatus =
  | 'disconnected'
  | 'connecting'
  | 'qr_ready'
  | 'authenticated'
  | 'ready'
  | 'error';

interface WhatsAppState {
  status: ClientStatus;
  qrCode?: string;
  error?: string;
  sessionInfo?: {
    pushname?: string;
    wid?: string;
  };
}

export function WhatsAppConnection() {
  const [state, setState] = useState<WhatsAppState>({ status: 'disconnected' });
  const [loading, setLoading] = useState(false);
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);

  // Poll for status updates
  useEffect(() => {
    if (state.status === 'connecting' || state.status === 'qr_ready' || state.status === 'authenticated') {
      const interval = setInterval(async () => {
        await checkStatus();
      }, 2000); // Poll every 2 seconds

      setPollInterval(interval);

      return () => {
        clearInterval(interval);
      };
    } else {
      if (pollInterval) {
        clearInterval(pollInterval);
        setPollInterval(null);
      }
    }
  }, [state.status]);

  // Initial status check
  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/whatsapp/status');
      const data = await response.json();

      if (response.ok) {
        setState({
          status: data.status,
          qrCode: data.qrCode,
          error: data.error,
          sessionInfo: data.sessionInfo,
        });
      }
    } catch (error) {
      console.error('Error checking WhatsApp status:', error);
    }
  };

  const handleInitialize = async () => {
    try {
      setLoading(true);
      setState({ status: 'connecting' });

      const response = await fetch('/api/whatsapp/initialize', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize WhatsApp');
      }

      setState({
        status: data.status,
        qrCode: data.qrCode,
        sessionInfo: data.sessionInfo,
      });
    } catch (error: any) {
      console.error('Error initializing WhatsApp:', error);
      setState({
        status: 'error',
        error: error.message || 'Failed to initialize WhatsApp',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/whatsapp/disconnect', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect WhatsApp');
      }

      setState({ status: 'disconnected' });
    } catch (error: any) {
      console.error('Error disconnecting WhatsApp:', error);
      toast.error(error.message || 'שגיאה בניתוק WhatsApp');
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = () => {
    switch (state.status) {
      case 'disconnected':
        return {
          text: 'מנותק',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
        };
      case 'connecting':
        return {
          text: 'מתחבר...',
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
        };
      case 'qr_ready':
        return {
          text: 'ממתין לסריקת QR',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
        };
      case 'authenticated':
        return {
          text: 'מאומת - טוען...',
          color: 'text-green-600',
          bgColor: 'bg-green-100',
        };
      case 'ready':
        return {
          text: 'מחובר ומוכן',
          color: 'text-green-600',
          bgColor: 'bg-green-100',
        };
      case 'error':
        return {
          text: 'שגיאה',
          color: 'text-red-600',
          bgColor: 'bg-red-100',
        };
      default:
        return {
          text: 'לא ידוע',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">חיבור WhatsApp</h2>
            <p className="text-gray-600 mt-1">
              התחבר ל-WhatsApp כדי לשלוח הודעות ישירות לאורחים
            </p>
          </div>
          <div className={`px-4 py-2 rounded-full ${statusDisplay.bgColor}`}>
            <span className={`font-semibold ${statusDisplay.color}`}>
              {statusDisplay.text}
            </span>
          </div>
        </div>

        {/* Session Info */}
        {state.status === 'ready' && state.sessionInfo && (
          <Alert variant="success">
            <div className="space-y-1">
              <div className="font-semibold">מחובר בהצלחה!</div>
              {state.sessionInfo.pushname && (
                <div className="text-sm">שם: {state.sessionInfo.pushname}</div>
              )}
              {state.sessionInfo.wid && (
                <div className="text-sm dir-ltr text-right">
                  מספר: {state.sessionInfo.wid}
                </div>
              )}
            </div>
          </Alert>
        )}

        {/* Error Display */}
        {state.status === 'error' && state.error && (
          <Alert variant="error">
            <div className="font-semibold">שגיאה:</div>
            <div className="text-sm mt-1">{state.error}</div>
          </Alert>
        )}

        {/* QR Code Display */}
        {state.status === 'qr_ready' && state.qrCode && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="text-center space-y-4">
              <div className="text-lg font-semibold">סרוק את קוד ה-QR</div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>1. פתח את WhatsApp בטלפון שלך</p>
                <p>2. לחץ על תפריט (⋮) או הגדרות</p>
                <p>3. בחר "WhatsApp Web"</p>
                <p>4. סרוק את הקוד הזה</p>
              </div>
              <div className="flex justify-center">
                <img
                  src={state.qrCode}
                  alt="WhatsApp QR Code"
                  className="w-64 h-64 border-4 border-white shadow-lg"
                />
              </div>
              <div className="text-xs text-gray-500">
                הקוד מתחדש אוטומטית אם פג תוקפו
              </div>
            </div>
          </div>
        )}

        {/* Connecting State */}
        {state.status === 'connecting' && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
            <div className="text-gray-600">מתחבר ל-WhatsApp...</div>
          </div>
        )}

        {/* Authenticated State */}
        {state.status === 'authenticated' && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <div className="text-gray-600">אימות הצליח! טוען...</div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {state.status === 'disconnected' || state.status === 'error' ? (
            <Button
              onClick={handleInitialize}
              disabled={loading}
              size="lg"
              className="flex-1"
            >
              {loading ? 'מתחבר...' : 'התחבר ל-WhatsApp'}
            </Button>
          ) : state.status === 'ready' ? (
            <Button
              onClick={handleDisconnect}
              disabled={loading}
              variant="outline"
              size="lg"
              className="flex-1"
            >
              {loading ? 'מנתק...' : 'נתק'}
            </Button>
          ) : (
            <Button disabled size="lg" className="flex-1">
              מתחבר...
            </Button>
          )}

          {state.status !== 'disconnected' && state.status !== 'error' && (
            <Button
              onClick={checkStatus}
              variant="outline"
              size="lg"
            >
              רענן סטטוס
            </Button>
          )}
        </div>

        {/* Help Text */}
        {state.status === 'disconnected' && (
          <Alert variant="info">
            <div className="text-sm space-y-2">
              <div className="font-semibold">שימו לב:</div>
              <ul className="list-disc list-inside space-y-1">
                <li>החיבור נשמר בין כניסות למערכת</li>
                <li>מומלץ להשתמש במספר ייעודי לשליחת הזמנות</li>
                <li>ניתן לנתק בכל עת</li>
                <li>הודעות נשלחות עם השהיות למניעת ספאם</li>
              </ul>
            </div>
          </Alert>
        )}
      </div>
    </Card>
  );
}
