'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { useRouter } from 'next/navigation';

interface ExcelImportProps {
  weddingId: string;
}

export function ExcelImport({ weddingId }: ExcelImportProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
      ];

      if (!validTypes.includes(selectedFile.type)) {
        setError('יש להעלות קובץ אקסל (.xlsx או .xls)');
        setFile(null);
        return;
      }

      setFile(selectedFile);
      setError('');
      setSuccess('');
      setValidationErrors([]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('נא לבחור קובץ');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setValidationErrors([]);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('weddingId', weddingId);

      const response = await fetch('/api/guests/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import guests');
      }

      setSuccess(data.message);

      if (data.validationErrors && data.validationErrors.length > 0) {
        setValidationErrors(data.validationErrors);
      }

      // Clear file after successful upload
      setFile(null);
      if (document.querySelector('input[type="file"]')) {
        (document.querySelector('input[type="file"]') as HTMLInputElement).value = '';
      }

      // Redirect to guests page after 2 seconds
      setTimeout(() => {
        router.push('/dashboard/guests');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'שגיאה בייבוא האורחים');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">הוראות</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>הורד את תבנית האקסל (לחץ על הכפתור למטה)</li>
          <li>מלא את פרטי האורחים בקובץ האקסל</li>
          <li>
            העמודות הנדרשות:
            <ul className="list-disc list-inside mr-6 mt-1">
              <li>שם מלא (חובה)</li>
              <li>טלפון (חובה)</li>
              <li>אימייל (אופציונלי)</li>
              <li>קבוצה משפחתית (אופציונלי)</li>
              <li>מספר מוזמנים (אופציונלי)</li>
            </ul>
          </li>
          <li>העלה את הקובץ באמצעות הטופס למטה</li>
        </ol>

        <div className="mt-4">
          <Button variant="outline" asChild>
            <a href="/api/guests/template" download>
              ⬇️ הורד תבנית אקסל
            </a>
          </Button>
        </div>
      </Card>

      {/* Upload Form */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">העלאת קובץ</h2>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="file-upload"
              className="block text-sm font-medium mb-2"
            >
              בחר קובץ אקסל
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-gold file:text-white
                hover:file:bg-gold-dark
                file:cursor-pointer cursor-pointer"
            />
          </div>

          {file && (
            <div className="text-sm text-gray-600">
              קובץ נבחר: <span className="font-medium">{file.name}</span>
            </div>
          )}

          {error && <Alert variant="error">{error}</Alert>}

          {success && <Alert variant="success">{success}</Alert>}

          {validationErrors.length > 0 && (
            <Alert variant="warning">
              <div className="font-semibold mb-2">שגיאות ואזהרות:</div>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {validationErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </Alert>
          )}

          <div className="flex gap-3">
            <Button onClick={handleUpload} disabled={!file || loading}>
              {loading ? 'מייבא...' : 'ייבא אורחים'}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/guests')}
              disabled={loading}
            >
              ביטול
            </Button>
          </div>
        </div>
      </Card>

      {/* Example */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">דוגמה לקובץ אקסל</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2">שם מלא</th>
                <th className="border px-4 py-2">טלפון</th>
                <th className="border px-4 py-2">אימייל</th>
                <th className="border px-4 py-2">קבוצה משפחתית</th>
                <th className="border px-4 py-2">מספר מוזמנים</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border px-4 py-2">יוסי כהן</td>
                <td className="border px-4 py-2">0501234567</td>
                <td className="border px-4 py-2">yossi@example.com</td>
                <td className="border px-4 py-2">משפחת כהן</td>
                <td className="border px-4 py-2 text-center">2</td>
              </tr>
              <tr>
                <td className="border px-4 py-2">שרה לוי</td>
                <td className="border px-4 py-2">0527654321</td>
                <td className="border px-4 py-2"></td>
                <td className="border px-4 py-2">משפחת לוי</td>
                <td className="border px-4 py-2 text-center">4</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
