'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { GuestForm } from './GuestForm';
import { generateWhatsAppUrl } from '@/lib/utils/whatsapp';
import { useConfirmDialog } from '@/components/ui/ConfirmDialog';

interface Guest {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  familyGroup?: string;
  invitedCount: number;
  uniqueToken: string;
  rsvpStatus: 'pending' | 'confirmed' | 'declined';
  adultsAttending?: number;
  childrenAttending?: number;
  specialMealRequests?: string;
  notes?: string;
  tableAssignment?: string;
  tableNumber?: number;
}

interface GuestManagementProps {
  weddingId: string;
}

export function GuestManagement({ weddingId }: GuestManagementProps) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [filteredGuests, setFilteredGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const { showConfirm, ConfirmDialogComponent } = useConfirmDialog();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [familyFilter, setFamilyFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Load guests
  const loadGuests = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/guests?weddingId=${weddingId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load guests');
      }

      setGuests(data.guests || []);
      setFilteredGuests(data.guests || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGuests();
  }, [weddingId]);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...guests];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (guest) =>
          guest.name.toLowerCase().includes(term) ||
          guest.phone.includes(searchTerm) ||
          (guest.email && guest.email.toLowerCase().includes(term)) ||
          (guest.familyGroup && guest.familyGroup.toLowerCase().includes(term)) ||
          (guest.notes && guest.notes.toLowerCase().includes(term))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((guest) => guest.rsvpStatus === statusFilter);
    }

    // Family filter
    if (familyFilter !== 'all') {
      filtered = filtered.filter((guest) => guest.familyGroup === familyFilter);
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name, 'he');
          break;
        case 'status':
          const statusOrder = { confirmed: 1, pending: 2, declined: 3 };
          comparison = statusOrder[a.rsvpStatus] - statusOrder[b.rsvpStatus];
          break;
        case 'invitedCount':
          comparison = a.invitedCount - b.invitedCount;
          break;
        case 'attending':
          const aTotal = (a.adultsAttending || 0) + (a.childrenAttending || 0);
          const bTotal = (b.adultsAttending || 0) + (b.childrenAttending || 0);
          comparison = aTotal - bTotal;
          break;
        case 'family':
          comparison = (a.familyGroup || '').localeCompare(b.familyGroup || '', 'he');
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredGuests(filtered);
  }, [searchTerm, statusFilter, familyFilter, sortBy, sortOrder, guests]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setFamilyFilter('all');
    setSortBy('name');
    setSortOrder('asc');
  };

  const hasActiveFilters = searchTerm || statusFilter !== 'all' || familyFilter !== 'all';

  // Get unique family groups
  const familyGroups = Array.from(
    new Set(guests.filter((g) => g.familyGroup).map((g) => g.familyGroup))
  ).sort();

  // Statistics
  const stats = {
    total: guests.length,
    confirmed: guests.filter((g) => g.rsvpStatus === 'confirmed').length,
    declined: guests.filter((g) => g.rsvpStatus === 'declined').length,
    pending: guests.filter((g) => g.rsvpStatus === 'pending').length,
    totalAdults: guests.reduce((sum, g) => sum + (g.adultsAttending || 0), 0),
    totalChildren: guests.reduce((sum, g) => sum + (g.childrenAttending || 0), 0),
  };

  const handleDelete = async (guestId: string) => {
    const confirmed = await showConfirm({
      title: 'מחיקת אורח',
      message: 'האם אתה בטוח שברצונך למחוק אורח זה?',
      confirmText: 'מחק',
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/guests/${guestId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete guest');
      }

      loadGuests();
    } catch (err: any) {
      toast.error('שגיאה במחיקת האורח');
    }
  };

  const copyRsvpLink = (token: string) => {
    const link = `${window.location.origin}/rsvp/${token}`;
    navigator.clipboard.writeText(link);
    toast.success('הקישור הועתק ללוח');
  };

  const sendWhatsApp = (guest: Guest) => {
    const rsvpLink = `${window.location.origin}/rsvp/${guest.uniqueToken}`;
    const message = `היי ${guest.name},\n\nאנחנו מתחתנים! 💍\nמוזמן/ת לחתונה שלנו.\n\nלצפייה בהזמנה ואישור הגעה:\n${rsvpLink}`;

    const whatsappUrl = generateWhatsAppUrl(guest.phone, message);
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      {ConfirmDialogComponent}
      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-600">סה"כ אורחים</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">אישרו הגעה</div>
          <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">סירבו</div>
          <div className="text-2xl font-bold text-red-600">{stats.declined}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">ממתינים</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">מבוגרים</div>
          <div className="text-2xl font-bold">{stats.totalAdults}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">ילדים</div>
          <div className="text-2xl font-bold">{stats.totalChildren}</div>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => setShowAddForm(true)}>
          ➕ הוסף אורח
        </Button>
        <Button variant="outline" asChild>
          <a href="/dashboard/guests/import">📊 ייבוא מאקסל</a>
        </Button>
        <Button variant="outline" asChild>
          <a href="/api/guests/template" download>
            ⬇️ הורד תבנית אקסל
          </a>
        </Button>
        <Button variant="outline" asChild>
          <a href="/api/guests/export" download>
            📥 ייצוא לאקסל
          </a>
        </Button>
      </div>

      {/* Add/Edit Form Modal */}
      {(showAddForm || editingGuest) && (
        <Card className="p-6">
          <GuestForm
            weddingId={weddingId}
            guest={editingGuest}
            onSuccess={() => {
              setShowAddForm(false);
              setEditingGuest(null);
              loadGuests();
            }}
            onCancel={() => {
              setShowAddForm(false);
              setEditingGuest(null);
            }}
          />
        </Card>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">חיפוש</label>
            <Input
              type="text"
              placeholder="שם, טלפון, אימייל, הערות..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">סטטוס</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">הכל</option>
              <option value="pending">ממתין</option>
              <option value="confirmed">אישר</option>
              <option value="declined">סירב</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">קבוצה משפחתית</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={familyFilter}
              onChange={(e) => setFamilyFilter(e.target.value)}
            >
              <option value="all">הכל</option>
              {familyGroups.map((family) => (
                <option key={family} value={family}>
                  {family}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">מיון לפי</label>
            <div className="flex gap-2">
              <select
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name">שם</option>
                <option value="status">סטטוס</option>
                <option value="invitedCount">מוזמנים</option>
                <option value="attending">מגיעים</option>
                <option value="family">קבוצה</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                title={sortOrder === 'asc' ? 'סדר עולה' : 'סדר יורד'}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            מציג {filteredGuests.length} מתוך {guests.length} אורחים
          </span>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              ✕ נקה פילטרים
            </Button>
          )}
        </div>
      </Card>

      {/* Error */}
      {error && <Alert variant="error">{error}</Alert>}

      {/* Guest List */}
      {loading ? (
        <div className="text-center py-8">טוען...</div>
      ) : filteredGuests.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">
          {guests.length === 0
            ? 'עדיין לא הוספת אורחים. התחל על ידי הוספת אורח או ייבוא מאקסל.'
            : 'לא נמצאו אורחים התואמים את החיפוש.'}
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-right">שם</th>
                <th className="px-4 py-3 text-right">טלפון</th>
                <th className="px-4 py-3 text-right">קבוצה</th>
                <th className="px-4 py-3 text-center">מוזמנים</th>
                <th className="px-4 py-3 text-center">סטטוס</th>
                <th className="px-4 py-3 text-center">מגיעים</th>
                <th className="px-4 py-3 text-center">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {filteredGuests.map((guest) => (
                <tr key={guest._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">{guest.name}</td>
                  <td className="px-4 py-3 dir-ltr text-right">{guest.phone}</td>
                  <td className="px-4 py-3">{guest.familyGroup || '-'}</td>
                  <td className="px-4 py-3 text-center">{guest.invitedCount}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        guest.rsvpStatus === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : guest.rsvpStatus === 'declined'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {guest.rsvpStatus === 'confirmed'
                        ? 'אישר'
                        : guest.rsvpStatus === 'declined'
                        ? 'סירב'
                        : 'ממתין'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {guest.rsvpStatus === 'confirmed' ? (
                      <span>
                        {guest.adultsAttending || 0} מבוגרים
                        {guest.childrenAttending ? `, ${guest.childrenAttending} ילדים` : ''}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => setEditingGuest(guest)}
                        className="text-blue-600 hover:underline text-sm"
                        title="ערוך"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => copyRsvpLink(guest.uniqueToken)}
                        className="text-green-600 hover:underline text-sm"
                        title="העתק קישור RSVP"
                      >
                        🔗
                      </button>
                      <button
                        onClick={() => sendWhatsApp(guest)}
                        className="text-green-600 hover:underline text-sm"
                        title="שלח WhatsApp"
                      >
                        💬
                      </button>
                      <button
                        onClick={() => handleDelete(guest._id)}
                        className="text-red-600 hover:underline text-sm"
                        title="מחק"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
