'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface PackagePrice {
  _id?: string;
  guests: number;
  price: number;
  label: string;
  isActive: boolean;
}

export default function AdminPricingPage() {
  const [pricing, setPricing] = useState<PackagePrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editedPrices, setEditedPrices] = useState<Record<number, number>>({});

  // New package form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGuests, setNewGuests] = useState('');
  const [newPrice, setNewPrice] = useState('');

  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    try {
      const response = await fetch('/api/admin/pricing');
      const data = await response.json();
      if (data.pricing) {
        setPricing(data.pricing);
        // Initialize edited prices
        const prices: Record<number, number> = {};
        data.pricing.forEach((p: PackagePrice) => {
          prices[p.guests] = p.price;
        });
        setEditedPrices(prices);
      }
    } catch (err) {
      setError('שגיאה בטעינת המחירים');
    } finally {
      setLoading(false);
    }
  };

  const handlePriceChange = (guests: number, price: string) => {
    setEditedPrices({
      ...editedPrices,
      [guests]: parseInt(price) || 0,
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const updatedPricing = pricing.map((p) => ({
        guests: p.guests,
        price: editedPrices[p.guests] ?? p.price,
        isActive: true,
      }));

      const response = await fetch('/api/admin/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pricing: updatedPricing }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('המחירים עודכנו בהצלחה');
        setPricing(data.pricing);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'שגיאה בעדכון המחירים');
      }
    } catch (err) {
      setError('שגיאה בעדכון המחירים');
    } finally {
      setSaving(false);
    }
  };

  const handleAddPackage = async () => {
    if (!newGuests || !newPrice) {
      setError('יש למלא את כל השדות');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const response = await fetch('/api/admin/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guests: parseInt(newGuests),
          price: parseInt(newPrice),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('החבילה נוספה בהצלחה');
        setShowAddForm(false);
        setNewGuests('');
        setNewPrice('');
        fetchPricing();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'שגיאה בהוספת החבילה');
      }
    } catch (err) {
      setError('שגיאה בהוספת החבילה');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePackage = async (guests: number) => {
    if (!confirm(`האם למחוק את החבילה של ${guests} מוזמנים?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/pricing?guests=${guests}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('החבילה נמחקה בהצלחה');
        fetchPricing();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'שגיאה במחיקת החבילה');
      }
    } catch (err) {
      setError('שגיאה במחיקת החבילה');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ניהול מחירי חבילות</h1>
          <p className="text-gray-600 mt-1">עדכן את מחירי החבילות השונות</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'ביטול' : 'הוסף חבילה חדשה'}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'שומר...' : 'שמור שינויים'}
          </Button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4">
          {success}
        </div>
      )}

      {/* Add new package form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-6"
        >
          <h3 className="font-semibold text-blue-800 mb-4">הוסף חבילה חדשה</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                label="מספר מוזמנים"
                type="number"
                value={newGuests}
                onChange={(e) => setNewGuests(e.target.value)}
                placeholder="לדוגמה: 1200"
              />
            </div>
            <div className="flex-1">
              <Input
                label="מחיר (₪)"
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="לדוגמה: 549"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleAddPackage} disabled={saving}>
                הוסף
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Pricing table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                מספר מוזמנים
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                מחיר נוכחי
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                מחיר חדש
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                פעולות
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {pricing.map((pkg, index) => (
              <motion.tr
                key={pkg.guests}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{pkg.guests}</span>
                    <span className="text-gray-500">מוזמנים</span>
                    {pkg.price === 0 && (
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                        חינם
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-gray-600">
                    {pkg.price === 0 ? 'חינם' : `₪${pkg.price}`}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <input
                    type="number"
                    value={editedPrices[pkg.guests] ?? pkg.price}
                    onChange={(e) => handlePriceChange(pkg.guests, e.target.value)}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    min="0"
                    disabled={pkg.guests === 200} // Can't change free tier price
                  />
                </td>
                <td className="px-6 py-4">
                  {pkg.guests !== 200 && (
                    <button
                      onClick={() => handleDeletePackage(pkg.guests)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      מחק
                    </button>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Info box */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="font-semibold text-amber-800">שים לב</h4>
            <ul className="text-sm text-amber-700 mt-1 list-disc list-inside space-y-1">
              <li>חבילה חינמית (200 מוזמנים) לא ניתנת למחיקה או לשינוי מחיר</li>
              <li>שינויים במחירים יחולו על לקוחות חדשים בלבד</li>
              <li>לקוחות שכבר שילמו לא יושפעו מהשינויים</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
