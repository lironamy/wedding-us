'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';

export function TwilioSetup() {
  const [showInstructions, setShowInstructions] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('היי, זו הודעת מבחן מהמערכת!');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestMessage = async () => {
    if (!testPhone || !testMessage) {
      toast.error('נא למלא מספר טלפון והודעה');
      return;
    }

    try {
      setTesting(true);
      setTestResult(null);

      const response = await fetch('/api/twilio/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: testPhone,
          message: testMessage,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setTestResult({
          success: true,
          message: `הודעת המבחן נשלחה בהצלחה! Message ID: ${data.messageId}`,
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || 'שגיאה בשליחת הודעת מבחן',
        });
      }
    } catch (error: any) {
      setTestResult({
        success: false,
        message: error.message || 'שגיאה בשליחת הודעת מבחן',
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold mb-2">הגדרות Twilio WhatsApp</h2>
          <p className="text-gray-600">
            שלח הודעות WhatsApp דרך Twilio Business API
          </p>
        </div>

        {/* Status Check */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">סטטוס התקנה</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Twilio SDK מותקן</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-600">ℹ</span>
              <span>דורש הגדרת משתני סביבה (Environment Variables)</span>
            </div>
          </div>
        </div>

        {/* Instructions Toggle */}
        <div>
          <Button
            onClick={() => setShowInstructions(!showInstructions)}
            variant="outline"
            className="w-full"
          >
            {showInstructions ? 'הסתר הוראות התקנה' : 'הצג הוראות התקנה'}
          </Button>
        </div>

        {/* Instructions */}
        {showInstructions && (
          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-bold">הוראות התקנה - Twilio WhatsApp Business API</h3>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">שלב 1: יצירת חשבון Twilio</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>
                    היכנס ל-{' '}
                    <a
                      href="https://www.twilio.com/try-twilio"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      twilio.com/try-twilio
                    </a>{' '}
                    והירשם
                  </li>
                  <li>מלא את פרטי החשבון ואמת את המספר שלך</li>
                  <li>תקבל $15 קרדיט חינם</li>
                </ol>
              </div>

              <div>
                <h4 className="font-semibold mb-2">שלב 2: קבלת WhatsApp Business API</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>
                    בקונסול של Twilio, עבור ל-{' '}
                    <strong>Messaging → Try it out → Send a WhatsApp message</strong>
                  </li>
                  <li>
                    לחץ על <strong>"Request access to WhatsApp"</strong>
                  </li>
                  <li>מלא את הטופס (שם העסק, סוג העסק: Events/Wedding Services)</li>
                  <li>
                    <strong>חכה לאישור</strong> - בדרך כלל לוקח 1-2 שבועות
                  </li>
                </ol>
              </div>

              <div>
                <h4 className="font-semibold mb-2">שלב 3: קבלת פרטי התחברות</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>
                    בקונסול, עבור ל-<strong>Account → API keys & tokens</strong>
                  </li>
                  <li>
                    העתק את <strong>Account SID</strong> ו-<strong>Auth Token</strong>
                  </li>
                  <li>
                    עבור ל-<strong>Messaging → Senders</strong>
                  </li>
                  <li>
                    העתק את מספר ה-WhatsApp שקיבלת (פורמט: <code>whatsapp:+1415...</code>)
                  </li>
                </ol>
              </div>

              <div>
                <h4 className="font-semibold mb-2">שלב 4: יצירת Content Templates (עם תמונה)</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>
                    בקונסול Twilio, עבור ל-<strong>Messaging → Content Template Builder</strong>
                  </li>
                  <li>לחץ <strong>"Create new template"</strong></li>
                  <li>בחר <strong>"WhatsApp"</strong> כערוץ</li>
                  <li>בחר שפה: <strong>Hebrew (he)</strong></li>
                  <li><strong>Header</strong>: בחר "Media" → "Image" → סמן "Variable" (לתמונה דינאמית)</li>
                  <li><strong>Body</strong>: העתק את הטקסט למטה</li>
                </ol>
                <div className="bg-white border border-gray-300 rounded p-3 text-xs mt-2 font-sans" dir="rtl">
                  <div className="font-semibold mb-1">Template להזמנה - Body (העתק):</div>
                  <div className="whitespace-pre-wrap text-right">היי {'{{2}}'}, {'{{3}}'}
להזמינכם לחתונה שלנו 💍

נפגש ביום {'{{4}}'}
ב&quot;{'{{5}}'}&quot; בשעה {'{{6}}'}

{'{{7}}'} לחגוג איתכם,
{'{{8}}'}

לחצו על הקישור לאישור הגעה
{'{{9}}'}</div>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  <strong>משתנים:</strong> 1=תמונה (Header), 2=שם אורח, 3=שמחים/שמחות, 4=תאריך, 5=מקום, 6=שעה, 7=מתרגשים/מתרגשות, 8=שמות הזוג, 9=לינק RSVP
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  💡 התמונה (משתנה 1) נלקחת אוטומטית מהגדרות החתונה
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">שלב 5: הגדרת משתני סביבה</h4>
                <div className="bg-white border border-gray-300 rounded p-3 text-xs font-mono space-y-1">
                  <div># פרטי חשבון</div>
                  <div>TWILIO_ACCOUNT_SID=AC********************************</div>
                  <div>TWILIO_AUTH_TOKEN=********************************</div>
                  <div>TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886</div>
                  <div className="mt-2"># Content SIDs (מהקונסול אחרי אישור)</div>
                  <div># טמפלייט עם תמונה (להזמנות ותזכורות)</div>
                  <div>TWILIO_CONTENT_SID_WITH_IMAGE=HX********************************</div>
                  <div># טמפלייט טקסט בלבד (ליום לפני ותודה)</div>
                  <div>TWILIO_CONTENT_SID_TEXT_ONLY=HX********************************</div>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  הוסף את השורות האלו לקובץ <code>.env.local</code> בשורש הפרויקט
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">שלב 6: אישור Templates</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>אחרי יצירת ה-template, הוא יישלח לאישור WhatsApp</li>
                  <li>זמן אישור: 24-48 שעות (בדרך כלל פחות)</li>
                  <li>תקבל התראה במייל כשיאושר</li>
                  <li>העתק את ה-Content SID (מתחיל ב-HX) להגדרות</li>
                </ol>
              </div>

              <Alert variant="warning">
                <div className="text-sm space-y-1">
                  <div className="font-semibold">חשוב לדעת:</div>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Templates חייבים לקבל אישור מ-WhatsApp לפני שליחה</li>
                    <li>זמן אישור template: בדרך כלל כמה שעות עד יום</li>
                    <li>עלות: ~$0.005-0.01 למסר לישראל</li>
                    <li>תקציב ניסיון: $15.50 (מספיק ל-1500+ הודעות)</li>
                    <li>צריך template נפרד לכל סוג הודעה (הזמנה, תזכורת, וכו')</li>
                  </ul>
                </div>
              </Alert>
            </div>
          </div>
        )}

        {/* Test Message Section */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-bold mb-4">שלח הודעת מבחן</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">מספר טלפון (ישראל)</label>
              <input
                type="tel"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="050-1234567"
                className="w-full px-3 py-2 border rounded-lg"
                disabled={testing}
              />
              <p className="text-xs text-gray-600 mt-1">
                המספר שלך או מספר אחר לבדיקה
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">תוכן הודעה</label>
              <textarea
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg font-sans"
                disabled={testing}
              />
            </div>

            <Button
              onClick={handleTestMessage}
              disabled={testing || !testPhone || !testMessage}
              className="w-full"
            >
              {testing ? 'שולח...' : 'שלח הודעת מבחן'}
            </Button>

            {testResult && (
              <Alert variant={testResult.success ? 'success' : 'error'}>
                {testResult.message}
              </Alert>
            )}
          </div>
        </div>

        {/* Info */}
        <Alert variant="info">
          <div className="text-sm space-y-2">
            <div className="font-semibold">למידע נוסף:</div>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <a
                  href="https://www.twilio.com/docs/whatsapp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  תיעוד Twilio WhatsApp API
                </a>
              </li>
              <li>
                <a
                  href="https://console.twilio.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  Twilio Console
                </a>
              </li>
              <li>
                <a
                  href="https://www.twilio.com/whatsapp/pricing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  מחירון WhatsApp Business API
                </a>
              </li>
            </ul>
          </div>
        </Alert>
      </div>
    </Card>
  );
}
