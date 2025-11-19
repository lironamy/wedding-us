'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';

interface GiftsDashboardProps {
  weddingId: string;
  bitPhone?: string;
  payboxPhone?: string;
}

interface Gift {
  guestId: string;
  name: string;
  phone: string;
  amount: number;
  method: string;
  rsvpStatus: string;
  date: string;
}

interface Statistics {
  totalGifts: number;
  guestsWithGifts: number;
  totalGuests: number;
  confirmedGuests: number;
  giftsByMethod: {
    bit: number;
    paybox: number;
  };
  averageGift: number;
  giftRate: number;
}

export function GiftsDashboard({ weddingId, bitPhone, payboxPhone }: GiftsDashboardProps) {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [allGuests, setAllGuests] = useState<any[]>([]);

  // Form for adding gift
  const [giftForm, setGiftForm] = useState({
    guestId: '',
    amount: 0,
    method: 'bit' as 'bit' | 'paybox' | 'none',
  });

  // Load data
  const loadData = async () => {
    try {
      setLoading(true);
      const [giftsRes, guestsRes] = await Promise.all([
        fetch(`/api/gifts?weddingId=${weddingId}`),
        fetch(`/api/guests?weddingId=${weddingId}`),
      ]);

      const giftsData = await giftsRes.json();
      const guestsData = await guestsRes.json();

      if (giftsRes.ok) {
        setStatistics(giftsData.statistics);
        setGifts(giftsData.gifts || []);
      }

      if (guestsRes.ok) {
        setAllGuests(guestsData.guests || []);
      }
    } catch (error) {
      console.error('Error loading gifts data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [weddingId]);

  // Add/update gift
  const handleAddGift = async () => {
    if (!giftForm.guestId) {
      alert('נא לבחור אורח');
      return;
    }

    try {
      const response = await fetch('/api/gifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(giftForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add gift');
      }

      setShowAddModal(false);
      setGiftForm({ guestId: '', amount: 0, method: 'bit' });
      loadData();
    } catch (error: any) {
      alert(error.message || 'שגיאה בהוספת מתנה');
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Export gifts to CSV
  const handleExport = () => {
    const headers = ['שם', 'טלפון', 'סכום', 'אמצעי תשלום', 'תאריך'];
    const rows = gifts.map((gift) => [
      gift.name,
      gift.phone,
      gift.amount.toString(),
      gift.method === 'bit' ? 'ביט' : gift.method === 'paybox' ? 'פייבוקס' : 'לא צוין',
      new Date(gift.date).toLocaleDateString('he-IL'),
    ]);

    const csvContent =
      '\uFEFF' + // BOM for Hebrew support
      [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `gifts_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return <div className="text-center py-8">טוען...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-sm text-gray-600">סה"כ מתנות</div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(statistics.totalGifts)}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">אורחים שנתנו</div>
            <div className="text-2xl font-bold">
              {statistics.guestsWithGifts}/{statistics.confirmedGuests}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">ממוצע למתנה</div>
            <div className="text-2xl font-bold">
              {formatCurrency(statistics.averageGift)}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600">אחוז נתינה</div>
            <div className="text-2xl font-bold text-gold">
              {statistics.giftRate}%
            </div>
          </Card>
        </div>
      )}

      {/* Payment Links */}
      {(bitPhone || payboxPhone) && (
        <Card className="p-6">
          <h3 className="font-bold mb-4">קישורי תשלום לשיתוף</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bitPhone && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="font-medium mb-2">ביט</div>
                <div className="text-sm text-gray-600 mb-2">מספר: {bitPhone}</div>
                <a
                  href={`https://www.bitpay.co.il/app/users/${bitPhone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  פתח קישור ביט
                </a>
              </div>
            )}
            {payboxPhone && (
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="font-medium mb-2">פייבוקס</div>
                <div className="text-sm text-gray-600 mb-2">מספר: {payboxPhone}</div>
                <a
                  href={`https://payboxapp.page.link/?link=https://payboxapp.com/payment?phone=${payboxPhone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:underline text-sm"
                >
                  פתח קישור פייבוקס
                </a>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <Button onClick={() => setShowAddModal(true)}>+ הוסף מתנה</Button>
        {gifts.length > 0 && (
          <Button variant="outline" onClick={handleExport}>
            ייצא לאקסל
          </Button>
        )}
      </div>

      {/* Gifts List */}
      {gifts.length === 0 ? (
        <Alert variant="info">
          אין מתנות רשומות עדיין. לחץ על "הוסף מתנה" כדי להתחיל לעקוב.
        </Alert>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">
                    אורח
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">
                    טלפון
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">
                    סכום
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">
                    אמצעי
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">
                    תאריך
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {gifts.map((gift) => (
                  <tr key={gift.guestId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{gift.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dir-ltr text-right">
                      {gift.phone}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-green-600">
                      {formatCurrency(gift.amount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          gift.method === 'bit'
                            ? 'bg-blue-100 text-blue-800'
                            : gift.method === 'paybox'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {gift.method === 'bit'
                          ? 'ביט'
                          : gift.method === 'paybox'
                          ? 'פייבוקס'
                          : 'לא צוין'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(gift.date).toLocaleDateString('he-IL')}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td
                    colSpan={2}
                    className="px-4 py-3 text-sm font-bold text-right"
                  >
                    סה"כ
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-green-600">
                    {formatCurrency(statistics?.totalGifts || 0)}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      )}

      {/* Add Gift Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">הוסף מתנה</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">אורח</label>
                <select
                  value={giftForm.guestId}
                  onChange={(e) =>
                    setGiftForm({ ...giftForm, guestId: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">בחר אורח</option>
                  {allGuests
                    .filter((g) => g.rsvpStatus === 'confirmed')
                    .map((guest) => (
                      <option key={guest._id} value={guest._id}>
                        {guest.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">סכום (₪)</label>
                <input
                  type="number"
                  value={giftForm.amount}
                  onChange={(e) =>
                    setGiftForm({ ...giftForm, amount: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  min="0"
                  step="50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">אמצעי תשלום</label>
                <select
                  value={giftForm.method}
                  onChange={(e) =>
                    setGiftForm({
                      ...giftForm,
                      method: e.target.value as 'bit' | 'paybox' | 'none',
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="bit">ביט</option>
                  <option value="paybox">פייבוקס</option>
                  <option value="none">לא צוין</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button onClick={handleAddGift} className="flex-1">
                הוסף
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddModal(false);
                  setGiftForm({ guestId: '', amount: 0, method: 'bit' });
                }}
                className="flex-1"
              >
                ביטול
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
