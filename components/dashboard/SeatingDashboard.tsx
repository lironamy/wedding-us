'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';

interface SeatingDashboardProps {
  weddingId: string;
}

interface Table {
  _id: string;
  tableName: string;
  tableNumber: number;
  capacity: number;
  tableType: 'adults' | 'kids' | 'mixed';
  assignedGuests: Guest[];
}

interface Guest {
  _id: string;
  name: string;
  phone: string;
  rsvpStatus: string;
  adultsAttending: number;
  childrenAttending: number;
  familyGroup?: string;
}

interface Statistics {
  totalTables: number;
  totalCapacity: number;
  totalAssignedPeople: number;
  totalConfirmedPeople: number;
  unassignedGuestsCount: number;
  unassignedPeople: number;
  seatingProgress: number;
  capacityUsage: number;
  tablesByType: {
    adults: number;
    kids: number;
    mixed: number;
  };
  tablesOverCapacity: number;
}

// Colors for guest badges
const guestColors = [
  'bg-teal-500',
  'bg-orange-500',
  'bg-blue-500',
  'bg-pink-500',
  'bg-purple-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-red-500',
];

export function SeatingDashboard({ weddingId }: SeatingDashboardProps) {
  const [tables, setTables] = useState<Table[]>([]);
  const [unassignedGuests, setUnassignedGuests] = useState<Guest[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [editingTable, setEditingTable] = useState<Table | null>(null);

  // Form state for creating/editing table
  const [tableForm, setTableForm] = useState({
    tableName: '',
    tableNumber: 1,
    capacity: 10,
    tableType: 'mixed' as 'adults' | 'kids' | 'mixed',
  });

  // Load data
  const loadData = async () => {
    try {
      setLoading(true);
      const [tablesRes, statsRes, guestsRes] = await Promise.all([
        fetch(`/api/tables?weddingId=${weddingId}`),
        fetch(`/api/tables/statistics?weddingId=${weddingId}`),
        fetch(`/api/guests?weddingId=${weddingId}&status=confirmed`),
      ]);

      const tablesData = await tablesRes.json();
      const statsData = await statsRes.json();
      const guestsData = await guestsRes.json();

      if (tablesRes.ok) {
        setTables(tablesData.tables || []);
      }

      if (statsRes.ok) {
        setStatistics(statsData.statistics);
      }

      if (guestsRes.ok) {
        const assignedIds = new Set(
          tablesData.tables?.flatMap((t: Table) =>
            t.assignedGuests.map((g: Guest) => g._id)
          ) || []
        );
        const unassigned = (guestsData.guests || []).filter(
          (g: Guest) => !assignedIds.has(g._id)
        );
        setUnassignedGuests(unassigned);
      }
    } catch (error) {
      console.error('Error loading seating data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [weddingId]);

  // Create table
  const handleCreateTable = async () => {
    try {
      const response = await fetch('/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weddingId,
          ...tableForm,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create table');
      }

      setShowCreateModal(false);
      setTableForm({ tableName: '', tableNumber: tables.length + 1, capacity: 10, tableType: 'mixed' });
      loadData();
    } catch (error: any) {
      alert(error.message || 'שגיאה ביצירת שולחן');
    }
  };

  // Update table
  const handleUpdateTable = async () => {
    if (!editingTable) return;

    try {
      const response = await fetch(`/api/tables/${editingTable._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tableForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update table');
      }

      setEditingTable(null);
      setTableForm({ tableName: '', tableNumber: 1, capacity: 10, tableType: 'mixed' });
      loadData();
    } catch (error: any) {
      alert(error.message || 'שגיאה בעדכון שולחן');
    }
  };

  // Delete table
  const handleDeleteTable = async (tableId: string) => {
    if (!confirm('האם למחוק את השולחן? האורחים המשובצים יוסרו.')) return;

    try {
      const response = await fetch(`/api/tables/${tableId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete table');
      }

      loadData();
    } catch (error) {
      alert('שגיאה במחיקת שולחן');
    }
  };

  // Assign guest to table
  const handleAssignGuest = async (guestId: string, tableId: string) => {
    try {
      const response = await fetch(`/api/tables/${tableId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestIds: [guestId],
          action: 'add',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to assign guest');
      }

      if (data.isOverCapacity) {
        alert(data.message);
      }

      loadData();
    } catch (error: any) {
      alert(error.message || 'שגיאה בשיבוץ אורח');
    }
  };

  // Remove guest from table
  const handleRemoveGuest = async (guestId: string, tableId: string) => {
    try {
      const response = await fetch(`/api/tables/${tableId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestIds: [guestId],
          action: 'remove',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove guest');
      }

      loadData();
    } catch (error) {
      alert('שגיאה בהסרת אורח');
    }
  };

  // Calculate people at table
  const getPeopleAtTable = (table: Table) => {
    return table.assignedGuests.reduce((sum, guest) => {
      return sum + (guest.adultsAttending || 1) + (guest.childrenAttending || 0);
    }, 0);
  };

  // Open edit modal
  const openEditModal = (table: Table) => {
    setEditingTable(table);
    setTableForm({
      tableName: table.tableName,
      tableNumber: table.tableNumber,
      capacity: table.capacity,
      tableType: table.tableType,
    });
  };

  // Open assign modal for specific table
  const openTableAssignModal = (table: Table) => {
    setSelectedTable(table);
    setShowAssignModal(true);
  };

  // Generate seat positions around circle
  const getSeatPositions = (capacity: number, filled: number) => {
    const positions = [];
    for (let i = 0; i < capacity; i++) {
      const angle = (i * 360) / capacity - 90; // Start from top
      const radian = (angle * Math.PI) / 180;
      const x = 50 + 42 * Math.cos(radian);
      const y = 50 + 42 * Math.sin(radian);
      positions.push({
        x,
        y,
        filled: i < filled,
      });
    }
    return positions;
  };

  if (loading) {
    return <div className="text-center py-8">טוען...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-teal-500 text-white rounded-lg p-4 text-center">
            <div className="text-3xl font-bold">{statistics.unassignedGuestsCount}</div>
            <div className="text-sm">מקומות פנויים</div>
          </div>
          <div className="bg-teal-600 text-white rounded-lg p-4 text-center">
            <div className="text-3xl font-bold">
              {statistics.totalAssignedPeople}/{statistics.totalConfirmedPeople}
            </div>
            <div className="text-sm">אנשים מוצבים / אנשים יושבים</div>
          </div>
          <div className="bg-rose-500 text-white rounded-lg p-4 text-center">
            <div className="text-3xl font-bold">{statistics.totalTables}</div>
            <div className="text-sm">סה"כ שולחנות</div>
          </div>
          <div className="bg-emerald-500 text-white rounded-lg p-4 text-center">
            <div className="text-3xl font-bold">{statistics.tablesOverCapacity}</div>
            <div className="text-sm">שולחנות מלאים</div>
          </div>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" size="sm">מיין שולחנות</Button>
        <Button variant="outline" size="sm">סטאטוס אורחים</Button>
      </div>

      {/* Tables Visual Grid */}
      {tables.length === 0 ? (
        <Alert variant="info">
          אין שולחנות עדיין. לחץ על "הוסף שולחן" כדי להתחיל.
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {tables.map((table) => {
            const peopleAtTable = getPeopleAtTable(table);
            const seatPositions = getSeatPositions(table.capacity, peopleAtTable);

            return (
              <div key={table._id} className="relative">
                {/* Table Number Badge */}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-700 text-white rounded-full flex items-center justify-center text-sm font-bold z-10">
                  {table.tableNumber}
                </div>

                {/* Visual Table */}
                <div
                  className="relative w-48 h-48 mx-auto cursor-pointer"
                  onClick={() => openTableAssignModal(table)}
                >
                  {/* Seats around table */}
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    {seatPositions.map((pos, i) => (
                      <circle
                        key={i}
                        cx={pos.x}
                        cy={pos.y}
                        r="6"
                        className={`${
                          pos.filled
                            ? 'fill-blue-400'
                            : 'fill-gray-200 stroke-gray-300'
                        }`}
                        strokeWidth="1"
                      />
                    ))}
                    {/* Table circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="30"
                      className="fill-gray-100 stroke-gray-300"
                      strokeWidth="2"
                    />
                  </svg>

                  {/* Table Info (centered) */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-lg font-bold">
                      {peopleAtTable}/{table.capacity}
                    </div>
                    <div className="text-xs text-gray-600 text-center px-2 truncate max-w-[80px]">
                      {table.tableName}
                    </div>
                  </div>
                </div>

                {/* Guest Badges */}
                <div className="flex flex-wrap gap-1 justify-center mt-2 px-2">
                  {table.assignedGuests.slice(0, 5).map((guest, i) => (
                    <span
                      key={guest._id}
                      className={`${guestColors[i % guestColors.length]} text-white text-xs px-2 py-0.5 rounded-full truncate max-w-[80px]`}
                      title={guest.name}
                    >
                      {guest.name.split(' ')[0]}
                    </span>
                  ))}
                  {table.assignedGuests.length > 5 && (
                    <span className="bg-gray-400 text-white text-xs px-2 py-0.5 rounded-full">
                      +{table.assignedGuests.length - 5}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-1 justify-center mt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(table);
                    }}
                    className="text-xs text-gray-500 hover:text-gold"
                  >
                    ערוך
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTable(table._id);
                    }}
                    className="text-xs text-gray-500 hover:text-red-500"
                  >
                    מחק
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Table Button */}
      <div className="fixed bottom-6 left-6">
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gold transition flex items-center gap-2 shadow-lg"
        >
          <span className="text-2xl">+</span>
          <span className="text-sm">הוסף שולחן</span>
        </button>
      </div>

      {/* Create/Edit Table Modal */}
      {(showCreateModal || editingTable) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">
              {editingTable ? 'ערוך שולחן' : 'צור שולחן חדש'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">שם השולחן</label>
                <input
                  type="text"
                  value={tableForm.tableName}
                  onChange={(e) =>
                    setTableForm({ ...tableForm, tableName: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="לדוגמה: משפחה, צבא, חברים"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">מספר שולחן</label>
                <input
                  type="number"
                  value={tableForm.tableNumber}
                  onChange={(e) =>
                    setTableForm({ ...tableForm, tableNumber: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">קיבולת (מספר מקומות)</label>
                <input
                  type="number"
                  value={tableForm.capacity}
                  onChange={(e) =>
                    setTableForm({ ...tableForm, capacity: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">סוג שולחן</label>
                <select
                  value={tableForm.tableType}
                  onChange={(e) =>
                    setTableForm({
                      ...tableForm,
                      tableType: e.target.value as 'adults' | 'kids' | 'mixed',
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="mixed">משולב</option>
                  <option value="adults">מבוגרים</option>
                  <option value="kids">ילדים</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={editingTable ? handleUpdateTable : handleCreateTable}
                className="flex-1"
              >
                {editingTable ? 'עדכן' : 'צור'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingTable(null);
                  setTableForm({ tableName: '', tableNumber: tables.length + 1, capacity: 10, tableType: 'mixed' });
                }}
                className="flex-1"
              >
                ביטול
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Assign Modal for specific table */}
      {showAssignModal && selectedTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">
                שולחן {selectedTable.tableNumber} - {selectedTable.tableName}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {getPeopleAtTable(selectedTable)}/{selectedTable.capacity} מקומות תפוסים
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {/* Current guests */}
              {selectedTable.assignedGuests.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium mb-3">אורחים בשולחן:</h3>
                  <div className="space-y-2">
                    {selectedTable.assignedGuests.map((guest, i) => (
                      <div
                        key={guest._id}
                        className="flex justify-between items-center p-2 bg-gray-50 rounded"
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full ${guestColors[i % guestColors.length]}`}></span>
                          <span>{guest.name}</span>
                          <span className="text-xs text-gray-500">
                            ({(guest.adultsAttending || 1) + (guest.childrenAttending || 0)})
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveGuest(guest._id, selectedTable._id)}
                          className="text-red-500 text-sm hover:underline"
                        >
                          הסר
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add guests */}
              {unassignedGuests.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3">הוסף אורחים:</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {unassignedGuests.map((guest) => (
                      <div
                        key={guest._id}
                        className="flex justify-between items-center p-2 border rounded hover:bg-gray-50"
                      >
                        <div>
                          <span>{guest.name}</span>
                          <span className="text-xs text-gray-500 mr-2">
                            ({(guest.adultsAttending || 1) + (guest.childrenAttending || 0)} אנשים)
                          </span>
                        </div>
                        <button
                          onClick={() => handleAssignGuest(guest._id, selectedTable._id)}
                          className="px-3 py-1 bg-teal-500 text-white text-sm rounded hover:bg-teal-600"
                        >
                          הוסף
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {unassignedGuests.length === 0 && selectedTable.assignedGuests.length === 0 && (
                <p className="text-center text-gray-500">אין אורחים זמינים לשיבוץ</p>
              )}
            </div>

            <div className="p-6 border-t">
              <Button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedTable(null);
                }}
                variant="outline"
                className="w-full"
              >
                סגור
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
