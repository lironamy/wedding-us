'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { observer } from 'mobx-react-lite';
import toast from 'react-hot-toast';
import XLSX from 'xlsx-js-style';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { useConfirmDialog } from '@/components/ui/ConfirmDialog';
import { rootStore } from '@/lib/stores';
import type { Table, Guest, GuestGroup, SeatingPreference } from '@/lib/stores';
import { EventHallCanvas } from './EventHallCanvas';

interface SeatingDashboardProps {
  weddingId: string;
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

// Tab type
type TabType = 'tables' | 'groups' | 'preferences' | 'settings';

export const SeatingDashboard = observer(function SeatingDashboard({ weddingId }: SeatingDashboardProps) {
  const tablesStore = rootStore.tablesStore;
  const guestsStore = rootStore.guestsStore;
  const seatingStore = rootStore.seatingStore;

  const [activeTab, setActiveTab] = useState<TabType>('tables');
  const [tableViewMode, setTableViewMode] = useState<'grid' | 'hall'>('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showPreferenceModal, setShowPreferenceModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [editingGroup, setEditingGroup] = useState<GuestGroup | null>(null);
  const [autoSeatingProgress, setAutoSeatingProgress] = useState(0);
  const [tableConflict, setTableConflict] = useState<{
    tableId: string;
    tableName: string;
    tableNumber: number;
    guestsCount: number;
  } | null>(null);
  const [isSwapping, setIsSwapping] = useState(false);
  const [deletingTable, setDeletingTable] = useState<Table | null>(null);
  const [moveGuestsToTableId, setMoveGuestsToTableId] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCanvasFullscreen, setIsCanvasFullscreen] = useState(false);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const { showConfirm, ConfirmDialogComponent } = useConfirmDialog();

  // Group priorities state
  const [groupPriorities, setGroupPriorities] = useState<Map<string, number>>(new Map());
  const [loadingPriorities, setLoadingPriorities] = useState(false);

  // Form state for creating/editing table
  const [tableForm, setTableForm] = useState({
    tableName: '',
    tableNumber: 1,
    capacity: 10,
    tableType: 'mixed' as 'adults' | 'kids' | 'mixed',
  });

  // Form state for groups
  const [groupForm, setGroupForm] = useState({
    name: '',
    priority: 0,
  });

  // Form state for preferences
  const [preferenceForm, setPreferenceForm] = useState({
    guestAId: '',
    guestBId: '',
    type: 'together' as 'together' | 'apart',
    scope: 'sameTable' as 'sameTable' | 'adjacentTables',
  });

  // Initialize store with weddingId
  useEffect(() => {
    rootStore.setWeddingId(weddingId);
  }, [weddingId]);

  // Load group priorities
  useEffect(() => {
    loadGroupPriorities();
  }, [weddingId]);

  const loadGroupPriorities = async () => {
    try {
      setLoadingPriorities(true);
      const response = await fetch(`/api/seating/group-priorities?weddingId=${weddingId}`);
      if (response.ok) {
        const data = await response.json();
        const priorityMap = new Map<string, number>();
        data.priorities.forEach((p: { groupName: string; priority: number }) => {
          priorityMap.set(p.groupName, p.priority);
        });
        setGroupPriorities(priorityMap);
      }
    } catch (error) {
      console.error('Failed to load group priorities:', error);
    } finally {
      setLoadingPriorities(false);
    }
  };

  const handleSetGroupPriority = async (groupName: string, priority: number) => {
    try {
      const response = await fetch('/api/seating/group-priorities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weddingId, groupName, priority }),
      });

      if (response.ok) {
        const data = await response.json();
        const priorityMap = new Map<string, number>();
        data.priorities.forEach((p: { groupName: string; priority: number }) => {
          priorityMap.set(p.groupName, p.priority);
        });
        setGroupPriorities(priorityMap);
        toast.success(priority > 0 ? `${groupName} הוגדרה כעדיפות ${priority}` : 'העדיפות הוסרה');
      } else {
        throw new Error('Failed to set priority');
      }
    } catch (error) {
      toast.error('שגיאה בהגדרת עדיפות');
    }
  };

  // Calculate guest groups from familyGroup field
  const guestGroups = useMemo(() => {
    const groupMap = new Map<string, { name: string; guests: typeof guestsStore.guests; confirmedCount: number; totalPeople: number }>();

    guestsStore.guests.forEach(guest => {
      if (guest.familyGroup) {
        const existing = groupMap.get(guest.familyGroup);
        if (existing) {
          existing.guests.push(guest);
          if (guest.rsvpStatus === 'confirmed') {
            existing.confirmedCount++;
            existing.totalPeople += (guest.adultsAttending || 1) + (guest.childrenAttending || 0);
          }
        } else {
          groupMap.set(guest.familyGroup, {
            name: guest.familyGroup,
            guests: [guest],
            confirmedCount: guest.rsvpStatus === 'confirmed' ? 1 : 0,
            totalPeople: guest.rsvpStatus === 'confirmed' ? (guest.adultsAttending || 1) + (guest.childrenAttending || 0) : 0,
          });
        }
      }
    });

    return Array.from(groupMap.values()).sort((a, b) => b.guests.length - a.guests.length);
  }, [guestsStore.guests]);

  // Create table
  const handleCreateTable = async () => {
    const result = await tablesStore.createTable(tableForm);

    if (result.success) {
      setShowCreateModal(false);
      setTableForm({ tableName: '', tableNumber: tablesStore.tables.length + 1, capacity: 10, tableType: 'mixed' });
      toast.success('השולחן נוצר בהצלחה');
    } else {
      toast.error(result.error || 'שגיאה ביצירת שולחן');
    }
  };

  // Update table
  const handleUpdateTable = async () => {
    if (!editingTable) return;

    const result = await tablesStore.updateTable(editingTable._id, tableForm);

    if (result.success) {
      setEditingTable(null);
      setTableConflict(null);
      setTableForm({ tableName: '', tableNumber: 1, capacity: 10, tableType: 'mixed' });
      toast.success('השולחן עודכן בהצלחה');
    } else if (result.conflict) {
      // Show conflict in modal
      setTableConflict(result.conflict);
    } else {
      toast.error(result.error || 'שגיאה בעדכון שולחן');
    }
  };

  // Handle swap tables
  const handleSwapTables = async () => {
    if (!editingTable || !tableConflict) return;

    setIsSwapping(true);
    const swapResult = await tablesStore.swapTables(editingTable._id, tableConflict.tableId);
    setIsSwapping(false);

    if (swapResult.success) {
      setEditingTable(null);
      setTableConflict(null);
      setTableForm({ tableName: '', tableNumber: 1, capacity: 10, tableType: 'mixed' });
      toast.success('השולחנות הוחלפו בהצלחה');
    } else {
      toast.error(swapResult.error || 'שגיאה בהחלפת שולחנות');
    }
  };

  // Delete table - check if has guests first
  const handleDeleteTable = async (tableId: string) => {
    const table = allTables.find(t => t._id === tableId);
    if (!table) return;

    const guestsInTable = getFilteredGuests(table);
    const peopleCount = getPeopleAtTableFiltered(table);

    // If table has guests, show modal to choose destination
    if (guestsInTable.length > 0) {
      setDeletingTable(table);
      setMoveGuestsToTableId('');
      return;
    }

    // No guests - confirm and delete
    const confirmed = await showConfirm({
      title: 'מחיקת שולחן',
      message: 'האם למחוק את השולחן?',
      confirmText: 'מחק',
      variant: 'danger',
    });

    if (!confirmed) return;

    const result = await tablesStore.deleteTable(tableId);

    if (result.success) {
      toast.success('השולחן נמחק בהצלחה');
    } else {
      toast.error(result.error || 'שגיאה במחיקת שולחן');
    }
  };

  // Get available tables for moving guests (with enough capacity)
  const getAvailableTablesForMove = (excludeTableId: string, requiredSeats: number) => {
    return allTables.filter(table => {
      if (table._id === excludeTableId) return false;
      const currentPeople = getPeopleAtTableFiltered(table);
      const availableSeats = table.capacity - currentPeople;
      return availableSeats >= requiredSeats;
    });
  };

  // Handle delete with move guests
  const handleDeleteWithMoveGuests = async () => {
    if (!deletingTable || !moveGuestsToTableId) return;

    setIsDeleting(true);

    try {
      // Move all guests to the selected table
      const guestsToMove = deletingTable.assignedGuests;

      for (const guest of guestsToMove) {
        // First remove from current table
        await tablesStore.removeGuest(guest._id, deletingTable._id);
        // Then add to new table
        await tablesStore.assignGuest(guest._id, moveGuestsToTableId);
      }

      // Now delete the empty table
      const result = await tablesStore.deleteTable(deletingTable._id);

      if (result.success) {
        toast.success(`השולחן נמחק והאורחים הועברו בהצלחה`);
      } else {
        toast.error(result.error || 'שגיאה במחיקת שולחן');
      }
    } catch (error) {
      toast.error('שגיאה בהעברת האורחים');
    } finally {
      setIsDeleting(false);
      setDeletingTable(null);
      setMoveGuestsToTableId('');
    }
  };

  // Assign guest to table
  const handleAssignGuest = async (guestId: string, tableId: string) => {
    const result = await tablesStore.assignGuest(guestId, tableId);

    if (result.success) {
      if (result.isOverCapacity) {
        toast(result.message, { icon: '⚠️' });
      } else {
        toast.success('האורח שובץ בהצלחה');
      }
    } else {
      toast.error(result.error || 'שגיאה בשיבוץ אורח');
    }
  };

  // Remove guest from table
  const handleRemoveGuest = async (guestId: string, tableId: string) => {
    const result = await tablesStore.removeGuest(guestId, tableId);

    if (result.success) {
      toast.success('האורח הוסר מהשולחן');
    } else {
      toast.error(result.error || 'שגיאה בהסרת אורח');
    }
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

  // Create group
  const handleCreateGroup = async () => {
    const result = await seatingStore.createGroup(groupForm.name, groupForm.priority);

    if (result.success) {
      setShowGroupModal(false);
      setGroupForm({ name: '', priority: 0 });
      toast.success('הקבוצה נוצרה בהצלחה');
    } else {
      toast.error(result.error || 'שגיאה ביצירת קבוצה');
    }
  };

  // Update group
  const handleUpdateGroup = async () => {
    if (!editingGroup) return;

    const result = await seatingStore.updateGroup(editingGroup._id, groupForm);

    if (result.success) {
      setEditingGroup(null);
      setGroupForm({ name: '', priority: 0 });
      toast.success('הקבוצה עודכנה בהצלחה');
    } else {
      toast.error(result.error || 'שגיאה בעדכון קבוצה');
    }
  };

  // Delete group
  const handleDeleteGroup = async (groupId: string) => {
    const confirmed = await showConfirm({
      title: 'מחיקת קבוצה',
      message: 'האם למחוק את הקבוצה? האורחים ישארו אך יוסר מהם שיוך לקבוצה.',
      confirmText: 'מחק',
      variant: 'danger',
    });

    if (!confirmed) return;

    const result = await seatingStore.deleteGroup(groupId);

    if (result.success) {
      toast.success('הקבוצה נמחקה בהצלחה');
    } else {
      toast.error(result.error || 'שגיאה במחיקת קבוצה');
    }
  };

  // Create preference
  const handleCreatePreference = async () => {
    if (!preferenceForm.guestAId || !preferenceForm.guestBId) {
      toast.error('יש לבחור שני אורחים');
      return;
    }

    const result = await seatingStore.createPreference(
      preferenceForm.guestAId,
      preferenceForm.guestBId,
      preferenceForm.type,
      preferenceForm.scope
    );

    if (result.success) {
      setShowPreferenceModal(false);
      setPreferenceForm({ guestAId: '', guestBId: '', type: 'together', scope: 'sameTable' });
      toast.success('ההעדפה נוצרה בהצלחה');
    } else {
      toast.error(result.error || 'שגיאה ביצירת העדפה');
    }
  };

  // Delete preference
  const handleDeletePreference = async (preferenceId: string) => {
    const result = await seatingStore.deletePreference(preferenceId);

    if (result.success) {
      toast.success('ההעדפה נמחקה בהצלחה');
    } else {
      toast.error(result.error || 'שגיאה במחיקת העדפה');
    }
  };

  // Run auto seating with progress animation
  const handleRunAutoSeating = async () => {
    const type = seatingStore.viewMode;
    setAutoSeatingProgress(0);

    // Animate progress while API is running
    const progressInterval = setInterval(() => {
      setAutoSeatingProgress(prev => {
        // Slow down as we approach 90% (leave room for completion)
        if (prev < 30) return prev + 3;
        if (prev < 60) return prev + 2;
        if (prev < 85) return prev + 1;
        if (prev < 95) return prev + 0.5;
        return prev;
      });
    }, 100);

    const result = await seatingStore.runAutoSeating(type);

    // Complete the progress
    clearInterval(progressInterval);
    setAutoSeatingProgress(100);

    // Reset after animation
    setTimeout(() => setAutoSeatingProgress(0), 500);

    if (result.success) {
      toast.success(`שיבוץ אוטומטי בוצע! נוצרו ${result.assignmentsCreated} שיבוצים ו-${result.tablesCreated} שולחנות חדשים.`);

      if (result.conflicts.length > 0) {
        // Show detailed conflicts dialog
        await showConfirm({
          title: `⚠️ ${result.conflicts.length} קונפליקטים בסידור`,
          message: (
            <div className="text-right space-y-3 max-h-64 overflow-y-auto">
              <p className="text-sm text-gray-600">הקונפליקטים הבאים דורשים טיפול ידני:</p>
              <ul className="space-y-2">
                {result.conflicts.map((conflict, i) => (
                  <li key={i} className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
                    <div className="font-medium text-amber-800">{conflict.message}</div>
                    <div className="text-amber-600 text-xs mt-1">💡 {conflict.suggestedAction}</div>
                  </li>
                ))}
              </ul>
            </div>
          ),
          confirmText: 'הבנתי',
          cancelText: 'סגור',
          variant: 'warning',
        });
      }
    } else {
      toast.error(result.error || 'שגיאה בשיבוץ אוטומטי');
    }
  };

  // Update settings
  const handleUpdateSettings = async (key: string, value: any) => {
    const previousMode = seatingStore.settings.mode;
    const result = await seatingStore.updateSettings({ [key]: value });

    if (result.success) {
      // If mode changed from auto to manual, reload tables (auto tables were deleted)
      if (key === 'mode' && previousMode === 'auto' && value === 'manual') {
        await tablesStore.loadTables(true);
        toast.success('המצב שונה לידני והשיבוצים האוטומטיים נמחקו');
      } else {
        toast.success('ההגדרות עודכנו בהצלחה');
      }
    } else {
      toast.error(result.error || 'שגיאה בעדכון הגדרות');
    }
  };

  // Handle mode change with confirmation
  const handleModeChange = async (newMode: 'auto' | 'manual') => {
    const currentMode = seatingStore.settings.mode;

    // If no change, do nothing
    if (currentMode === newMode) return;

    // Show confirmation dialog
    const confirmed = await showConfirm({
      title: newMode === 'auto' ? 'מעבר למצב אוטומטי' : 'מעבר למצב ידני',
      message: newMode === 'auto'
        ? 'שים לב! המעבר למצב אוטומטי ימחק את כל השיבוצים הידניים שביצעת ויחליף אותם בשיבוץ אוטומטי חדש. האם להמשיך?'
        : 'שים לב! המעבר למצב ידני ימחק את כל השולחנות והשיבוצים האוטומטיים. תצטרך ליצור שולחנות ולשבץ אורחים מחדש. האם להמשיך?',
      confirmText: 'המשך',
      variant: 'danger',
    });

    if (confirmed) {
      await handleUpdateSettings('mode', newMode);
    }
  };

  // Toggle table lock
  const handleToggleTableLock = async (tableId: string, currentLocked: boolean) => {
    // If trying to lock (not unlock), show warning first
    if (!currentLocked) {
      const confirmed = await showConfirm({
        title: '⚠️ אזהרה - נעילת שולחן',
        message: (
          <div className="text-right space-y-3">
            <p>נעילת שולחן יכולה לגרום לבעיות בסידור האוטומטי:</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 mr-2">
              <li>האורחים בשולחן הזה לא יועברו גם אם יש מקום טוב יותר</li>
              <li>אם יש יותר מדי אורחים נעולים, האלגוריתם עלול להיכשל</li>
              <li>שינויים ב-RSVP של אורחים נעולים לא ישפיעו על השיבוץ</li>
              <li>ילדים של אורחים נעולים לא יועברו לשולחן ילדים</li>
            </ul>
            <p className="text-sm font-medium text-amber-600">מומלץ לנעול שולחנות רק אחרי שהסידור הסופי מוכן.</p>
          </div>
        ),
        confirmText: 'נעל בכל זאת',
        cancelText: 'ביטול',
        variant: 'warning',
      });

      if (!confirmed) return;
    }

    try {
      const response = await fetch(`/api/tables/${tableId}/lock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locked: !currentLocked }),
      });

      if (response.ok) {
        await tablesStore.loadTables(true);
        toast.success(currentLocked ? 'השולחן שוחרר מנעילה' : 'השולחן ננעל');
      } else {
        throw new Error('Failed to toggle lock');
      }
    } catch (error) {
      toast.error('שגיאה בשינוי נעילת השולחן');
    }
  };

  // Toggle guest seat lock
  const handleToggleGuestLock = async (guestId: string, currentLocked: boolean, tableId?: string) => {
    try {
      const response = await fetch(`/api/guests/${guestId}/lock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lockedSeat: !currentLocked,
          lockedTableId: !currentLocked ? tableId : undefined,
        }),
      });

      if (response.ok) {
        await guestsStore.loadGuests(true);
        await tablesStore.loadTables(true);
        toast.success(currentLocked ? 'האורח שוחרר מנעילה' : 'האורח ננעל לשולחן');
      } else {
        throw new Error('Failed to toggle lock');
      }
    } catch (error) {
      toast.error('שגיאה בשינוי נעילת האורח');
    }
  };

  // Export seating chart to Excel with styling
  const handleExportSeating = () => {
    const headerStyle = {
      fill: { fgColor: { rgb: 'FF9800' } },
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      alignment: { horizontal: 'center', vertical: 'center' },
    };

    const tableRowStyle = {
      fill: { fgColor: { rgb: 'FFEB3B' } },
      font: { bold: true },
      alignment: { horizontal: 'center', vertical: 'center' },
    };

    const guestRowStyle = {
      alignment: { horizontal: 'center', vertical: 'center' },
    };

    const wsData: any[][] = [];
    const rowStyles: number[] = [];

    wsData.push(['מספר שולחן', 'שם שולחן', 'שם מוזמן', 'כמות', 'מקומות פנויים בשולחן']);
    rowStyles.push(0);

    tablesStore.tables.forEach((table) => {
      const peopleAtTable = tablesStore.getPeopleAtTable(table);
      const availableSeats = table.capacity - peopleAtTable;

      wsData.push([
        table.tableNumber,
        table.tableName,
        '',
        '',
        availableSeats,
      ]);
      rowStyles.push(1);

      table.assignedGuests.forEach((guest) => {
        const guestCount = (guest.adultsAttending || 1) + (guest.childrenAttending || 0);
        wsData.push([
          '',
          '',
          guest.name,
          guestCount,
          '',
        ]);
        rowStyles.push(2);
      });
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let R = range.s.r; R <= range.e.r; R++) {
      for (let C = range.s.c; C <= range.e.c; C++) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cellAddress]) ws[cellAddress] = { v: '' };

        if (rowStyles[R] === 0) {
          ws[cellAddress].s = headerStyle;
        } else if (rowStyles[R] === 1) {
          ws[cellAddress].s = tableRowStyle;
        } else {
          ws[cellAddress].s = guestRowStyle;
        }
      }
    }

    ws['!cols'] = [
      { wch: 12 },
      { wch: 15 },
      { wch: 20 },
      { wch: 8 },
      { wch: 20 },
    ];

    const workbook = XLSX.utils.book_new();

    if (!workbook.Workbook) workbook.Workbook = {};
    if (!workbook.Workbook.Views) workbook.Workbook.Views = [{}];
    workbook.Workbook.Views[0].RTL = true;

    XLSX.utils.book_append_sheet(workbook, ws, 'סידורי ישיבה');

    if (tablesStore.unassignedGuests.length > 0) {
      const unassignedWsData: any[][] = [
        ['שם מוזמן', 'כמות', 'טלפון'],
      ];

      tablesStore.unassignedGuests.forEach((guest) => {
        const guestCount = (guest.adultsAttending || 1) + (guest.childrenAttending || 0);
        unassignedWsData.push([guest.name, guestCount, guest.phone]);
      });

      const unassignedWs = XLSX.utils.aoa_to_sheet(unassignedWsData);

      for (let C = 0; C < 3; C++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
        if (unassignedWs[cellAddress]) {
          unassignedWs[cellAddress].s = headerStyle;
        }
      }

      unassignedWs['!cols'] = [
        { wch: 20 },
        { wch: 8 },
        { wch: 15 },
      ];

      XLSX.utils.book_append_sheet(workbook, unassignedWs, 'לא משובצים');
    }

    XLSX.writeFile(workbook, `seating_chart_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Generate seat positions around circle
  const getSeatPositions = (capacity: number, filled: number) => {
    const positions = [];
    for (let i = 0; i < capacity; i++) {
      const angle = (i * 360) / capacity - 90;
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

  if (tablesStore.loading || guestsStore.loading) {
    return <div className="text-center py-8">טוען...</div>;
  }

  const { tables: allTables, statistics, unassignedGuests } = tablesStore;
  const { groups, preferences, isAutoMode, viewMode, runningAutoSeating, conflicts } = seatingStore;
  // Access settings directly to ensure MobX reactivity works properly
  const settings = seatingStore.settings;

  // Filter tables based on view mode
  // In 'real' mode: show only tables with at least one confirmed guest
  // In 'simulation' mode: show all tables
  const tables = viewMode === 'real'
    ? allTables.filter(table => {
        // Show table only if it has at least one confirmed guest
        return table.assignedGuests.some(guest => guest.rsvpStatus === 'confirmed');
      })
    : allTables;

  // Helper to get filtered guests for a table based on view mode
  const getFilteredGuests = (table: Table) => {
    if (viewMode === 'real') {
      return table.assignedGuests.filter(guest => guest.rsvpStatus === 'confirmed');
    }
    return table.assignedGuests;
  };

  // Helper to get people count based on view mode
  // Server sends seatsInTable and simulationSeatsInTable - frontend just displays
  const getPeopleAtTableFiltered = (table: Table) => {
    const guests = getFilteredGuests(table);
    return guests.reduce((sum, guest: any) => {
      const seats = viewMode === 'simulation' ? guest.simulationSeatsInTable : guest.seatsInTable;
      return sum + (seats || 0);
    }, 0);
  };

  return (
    <div className="space-y-6 relative">
      {ConfirmDialogComponent}

      {/* Auto Seating Progress Overlay */}
      {runningAutoSeating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-purple-600 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">מחשב שיבוץ אוטומטי</h3>
              <p className="text-gray-500 text-sm">האלגוריתם מחשב את השיבוץ האופטימלי...</p>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>התקדמות</span>
                <span className="font-bold text-purple-600">{Math.round(autoSeatingProgress)}%</span>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-100"
                  style={{ width: `${autoSeatingProgress}%` }}
                />
              </div>
            </div>

            <p className="text-xs text-gray-400">נא להמתין, הפעולה עשויה לקחת מספר שניות</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-gray-100 rounded-xl p-1.5 flex gap-1">
        <button
          onClick={() => setActiveTab('tables')}
          className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
            activeTab === 'tables'
              ? 'bg-white text-gray-900 shadow-md ring-1 ring-gray-200'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          שולחנות
        </button>
        <button
          onClick={() => setActiveTab('groups')}
          className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
            activeTab === 'groups'
              ? 'bg-white text-gray-900 shadow-md ring-1 ring-gray-200'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          קבוצות ({guestGroups.length})
        </button>
        <button
          onClick={() => setActiveTab('preferences')}
          className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
            activeTab === 'preferences'
              ? 'bg-white text-gray-900 shadow-md ring-1 ring-gray-200'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          העדפות ({preferences.length})
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
            activeTab === 'settings'
              ? 'bg-white text-gray-900 shadow-md ring-1 ring-gray-200'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          הגדרות
        </button>
      </div>

      {/* Tables Tab */}
      {activeTab === 'tables' && (
        <>
          {/* Statistics Cards */}
          {statistics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
                <div className="text-3xl font-bold text-teal-600">{statistics.unassignedGuestsCount}</div>
                <div className="text-sm text-gray-500">לא משובצים</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {statistics.totalAssignedPeople}/{statistics.totalConfirmedPeople}
                </div>
                <div className="text-sm text-gray-500">משובצים / מאושרים</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
                <div className="text-3xl font-bold text-purple-600">{statistics.totalTables}</div>
                <div className="text-sm text-gray-500">שולחנות</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
                <div className="text-3xl font-bold text-emerald-600">{statistics.tablesOverCapacity}</div>
                <div className="text-sm text-gray-500">שולחנות מלאים</div>
              </div>
            </div>
          )}

          {/* View Mode Toggle */}
          {settings.simulationEnabled && (
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-gray-100">
              <span className="text-sm font-medium text-gray-600">מצב תצוגה:</span>
              <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => seatingStore.setViewMode('real')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    viewMode === 'real'
                      ? 'bg-white text-gold shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  מצב אמיתי
                </button>
                <button
                  onClick={() => seatingStore.setViewMode('simulation')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    viewMode === 'simulation'
                      ? 'bg-white text-purple-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  הדמיה
                </button>
              </div>
              <span className="text-xs text-gray-400">
                {viewMode === 'real' ? 'מציג רק מאושרים' : 'מציג את כל המוזמנים'}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 flex-wrap items-center bg-white rounded-xl shadow-sm border border-gray-100 p-3">
            <Button onClick={() => setShowCreateModal(true)}>
              + הוסף שולחן
            </Button>
            {isAutoMode && (
              runningAutoSeating ? (
                <div className="flex items-center gap-3 px-4 py-2 bg-purple-50 border border-purple-200 rounded-lg min-w-[200px]">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm text-purple-700 mb-1">
                      <span>מחשב שיבוץ...</span>
                      <span className="font-medium">{Math.round(autoSeatingProgress)}%</span>
                    </div>
                    <div className="h-2 bg-purple-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-600 rounded-full transition-all duration-100"
                        style={{ width: `${autoSeatingProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={handleRunAutoSeating}
                  variant="primary"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  שיבוץ אוטומטי
                </Button>
              )
            )}
            {tables.length > 0 && (
              <Button variant="outline" onClick={handleExportSeating}>
                ייצוא לאקסל
              </Button>
            )}

            {/* View Mode Toggle - Desktop Only */}
            <div className="hidden lg:flex items-center gap-1 mr-auto bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setTableViewMode('grid')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                  tableViewMode === 'grid'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                רשת
              </button>
              <button
                onClick={() => setTableViewMode('hall')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                  tableViewMode === 'hall'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                אולם אירועים
              </button>
            </div>
          </div>

          {/* Conflicts Alert */}
          {conflicts.length > 0 && (
            <Alert variant="warning">
              <div className="font-medium mb-2">יש {conflicts.length} קונפליקטים:</div>
              <ul className="list-disc list-inside text-sm">
                {conflicts.map((conflict, i) => (
                  <li key={i}>{conflict.message}</li>
                ))}
              </ul>
            </Alert>
          )}

          {/* Tables View */}
          {tables.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">אין שולחנות עדיין</h3>
              <p className="text-gray-500 mb-4">לחץ על "הוסף שולחן" כדי להתחיל לבנות את סידור הישיבה</p>
              <Button onClick={() => setShowCreateModal(true)}>
                + הוסף שולחן ראשון
              </Button>
            </div>
          ) : tableViewMode === 'hall' ? (
            /* Event Hall Canvas View - Desktop Only */
            <div ref={canvasContainerRef} className="hidden lg:block h-[600px] rounded-xl overflow-hidden shadow-sm border border-gray-100">
              <EventHallCanvas
                onTableClick={openTableAssignModal}
                onTableEdit={openEditModal}
                groups={groups}
                viewMode={viewMode}
                simulationEnabled={settings.simulationEnabled}
                weddingId={weddingId}
                onFullscreenChange={setIsCanvasFullscreen}
              />
            </div>
          ) : (
            /* Grid View */
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {tables.map((table) => {
                  const filteredGuests = getFilteredGuests(table);
                  const peopleAtTable = getPeopleAtTableFiltered(table);
                  const seatPositions = getSeatPositions(table.capacity, peopleAtTable);
                  const tableGroup = table.groupId ? groups.find(g => g._id === table.groupId) : null;
                  const isFullOrOver = peopleAtTable >= table.capacity;
                  const isEmpty = peopleAtTable === 0;

                  return (
                    <div key={table._id} className="relative group">
                      {/* Table Number Badge */}
                      <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold z-10 shadow-sm ${
                        isFullOrOver ? 'bg-emerald-500 text-white' : isEmpty ? 'bg-gray-300 text-gray-700' : 'bg-gold text-gray-900'
                      }`}>
                        {table.tableNumber}
                      </div>

                      {/* Group Name Badge - show on multiple lines if name has multiple words */}
                      {tableGroup && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-500 text-white text-xs px-2 py-1 rounded-lg z-10 max-w-[140px] text-center shadow-sm leading-tight" title={tableGroup.name}>
                          {tableGroup.name.split(' ').length > 1 ? (
                            <span className="block">{tableGroup.name}</span>
                          ) : (
                            tableGroup.name
                          )}
                        </div>
                      )}

                      {/* Mode Badge */}
                      {table.mode === 'auto' && (
                        <div className="absolute -top-2 -left-2 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs z-10 shadow-sm" title="שיבוץ אוטומטי">
                          A
                        </div>
                      )}

                      {/* Lock Badge */}
                      {table.locked && (
                        <div className="absolute top-6 -left-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs z-10 shadow-sm" title="נעול">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}

                      {/* Visual Table */}
                      <div
                        className="relative w-52 h-52 mx-auto cursor-pointer transition-transform hover:scale-105"
                        onClick={() => openTableAssignModal(table)}
                      >
                        {/* Seats around table */}
                        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
                          {/* Table circle - render first so seats appear on top */}
                          <circle
                            cx="50"
                            cy="50"
                            r="28"
                            fill={isFullOrOver ? '#ecfdf5' : isEmpty ? '#f9fafb' : '#fef9e7'}
                            stroke={isFullOrOver ? '#a7f3d0' : isEmpty ? '#e5e7eb' : '#d4a855'}
                            strokeWidth="2"
                          />
                          {seatPositions.map((pos, i) => (
                            <circle
                              key={i}
                              cx={pos.x}
                              cy={pos.y}
                              r="6"
                              fill={pos.filled ? '#d4a855' : '#f3f4f6'}
                              stroke={pos.filled ? '#b8943e' : '#d1d5db'}
                              strokeWidth="1"
                            />
                          ))}
                        </svg>

                        {/* Table Info (centered) */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className="text-xl font-bold text-gray-900">
                            {peopleAtTable}/{table.capacity}
                          </div>
                          <div className="text-xs text-gray-700 text-center px-2 max-w-[90px] leading-tight">
                            {table.tableName}
                          </div>
                        </div>
                      </div>

                      {/* Guest Badges */}
                      <div className="flex flex-wrap gap-1 justify-center mt-3 px-1">
                        {filteredGuests.slice(0, 4).map((guest: any, i) => {
                          // Server provides seatsInTable and simulationSeatsInTable - just display
                          const seatsCount = viewMode === 'simulation'
                            ? guest.simulationSeatsInTable
                            : guest.seatsInTable;
                          return (
                            <span
                              key={guest._id}
                              className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full truncate max-w-[80px]"
                              title={`${guest.name} (${seatsCount} מושבים)`}
                            >
                              {guest.name.split(' ')[0]} ({seatsCount})
                            </span>
                          );
                        })}
                        {filteredGuests.length > 4 && (
                          <span className="bg-gray-200 text-gray-500 text-xs px-2 py-0.5 rounded-full">
                            +{filteredGuests.length - 4}
                          </span>
                        )}
                      </div>

                      {/* Actions - always visible on mobile, hover on desktop */}
                      <div className="flex gap-2 justify-center mt-3 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleTableLock(table._id, table.locked);
                          }}
                          className={`text-xs px-3 py-1 rounded-full transition ${
                            table.locked
                              ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          title={table.locked ? 'שחרר נעילה' : 'נעל שולחן'}
                        >
                          {table.locked ? '🔓' : '🔒'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(table);
                          }}
                          className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition"
                        >
                          ערוך
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTable(table._id);
                          }}
                          className="text-xs px-3 py-1 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition"
                        >
                          מחק
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Groups Tab */}
      {activeTab === 'groups' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">קבוצות אורחים</h3>
              <p className="text-sm text-gray-500">הקבוצות נוצרות אוטומטית מניהול האורחים. הגדר עדיפות לקבוע איזו קבוצה תהיה שולחן 1, 2, וכו'</p>
            </div>
          </div>

          {/* Priority Groups Display */}
          {(() => {
            const prioritizedGroups = guestGroups
              .filter(g => (groupPriorities.get(g.name) || 0) > 0)
              .sort((a, b) => (groupPriorities.get(a.name) || 0) - (groupPriorities.get(b.name) || 0));

            if (prioritizedGroups.length > 0) {
              return (
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200 p-4 mb-4">
                  <h4 className="font-medium text-amber-800 mb-3 flex items-center gap-2">
                    <span>⭐</span> סדר עדיפות שולחנות
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {prioritizedGroups.map((group) => (
                      <div
                        key={group.name}
                        className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-sm border border-amber-200"
                      >
                        <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-sm font-bold flex items-center justify-center">
                          {groupPriorities.get(group.name)}
                        </span>
                        <span className="font-medium text-gray-800">{group.name}</span>
                        <button
                          onClick={() => handleSetGroupPriority(group.name, 0)}
                          className="text-gray-400 hover:text-red-500 transition"
                          title="הסר עדיפות"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }
            return null;
          })()}

          {guestGroups.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">אין קבוצות עדיין</h3>
              <p className="text-gray-500 mb-4">
                הוסף אורחים עם שדה "קבוצה" בניהול האורחים והם יופיעו כאן
              </p>
              <Button variant="outline" onClick={() => window.location.href = '/dashboard/guests'}>
                לניהול אורחים
              </Button>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {guestGroups.map((group) => {
                  const currentPriority = groupPriorities.get(group.name) || 0;
                  const maxPriority = Math.max(...Array.from(groupPriorities.values()), 0);
                  const nextAvailablePriority = maxPriority + 1;

                  return (
                    <div
                      key={group.name}
                      className={`p-4 rounded-xl border ${
                        currentPriority > 0
                          ? 'bg-amber-50 border-amber-200'
                          : 'bg-gray-50 border-gray-100'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-start gap-2">
                          {currentPriority > 0 && (
                            <span className="w-7 h-7 rounded-full bg-amber-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                              {currentPriority}
                            </span>
                          )}
                          <div>
                            <h4 className="font-semibold text-gray-900">{group.name}</h4>
                            <p className="text-sm text-gray-500">
                              {group.guests.length} אורחים • {group.confirmedCount} אישרו
                            </p>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-gold">
                          {group.totalPeople}
                        </div>
                      </div>

                      {/* Priority Selection */}
                      <div className="mb-3">
                        <label className="text-xs text-gray-500 mb-1 block">עדיפות שולחן:</label>
                        <div className="flex gap-1 flex-wrap">
                          {[1, 2, 3, 4, 5].map((num) => {
                            const isSelected = currentPriority === num;
                            const isTakenByOther = !isSelected && Array.from(groupPriorities.entries()).some(
                              ([name, priority]) => priority === num && name !== group.name
                            );

                            return (
                              <button
                                key={num}
                                onClick={() => handleSetGroupPriority(group.name, isSelected ? 0 : num)}
                                disabled={isTakenByOther}
                                className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                                  isSelected
                                    ? 'bg-amber-500 text-white'
                                    : isTakenByOther
                                      ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                      : 'bg-white border border-gray-200 text-gray-600 hover:border-amber-300 hover:bg-amber-50'
                                }`}
                                title={isTakenByOther ? 'כבר תפוס על ידי קבוצה אחרת' : isSelected ? 'לחץ להסרת עדיפות' : `הגדר כעדיפות ${num}`}
                              >
                                {num}
                              </button>
                            );
                          })}
                          {currentPriority > 0 && (
                            <button
                              onClick={() => handleSetGroupPriority(group.name, 0)}
                              className="px-2 h-8 rounded-lg text-xs bg-red-50 text-red-500 hover:bg-red-100 transition"
                              title="הסר עדיפות"
                            >
                              הסר
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Guest list preview */}
                      <div className="flex flex-wrap gap-1">
                        {group.guests.slice(0, 4).map((guest) => (
                          <span
                            key={guest._id}
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              guest.rsvpStatus === 'confirmed'
                                ? 'bg-emerald-100 text-emerald-700'
                                : guest.rsvpStatus === 'declined'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-gray-200 text-gray-600'
                            }`}
                          >
                            {guest.name.split(' ')[0]}
                          </span>
                        ))}
                        {group.guests.length > 4 && (
                          <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-500 rounded-full">
                            +{group.guests.length - 4}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">העדפות ישיבה</h3>
            <Button onClick={() => setShowPreferenceModal(true)}>+ הוסף העדפה</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Together preferences */}
            <Card className="p-4">
              <h4 className="font-medium text-green-600 mb-3">כן ליד</h4>
              {preferences.filter(p => p.type === 'together').length === 0 ? (
                <p className="text-sm text-gray-500">אין העדפות "כן ליד"</p>
              ) : (
                <div className="space-y-2">
                  {preferences.filter(p => p.type === 'together').map((pref) => (
                    <div key={pref._id} className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <div className="text-sm">
                        <span className="font-medium">{pref.guestAName}</span>
                        <span className="mx-2">↔</span>
                        <span className="font-medium">{pref.guestBName}</span>
                        {pref.scope === 'adjacentTables' && (
                          <span className="text-xs text-gray-500 mr-2">(או שולחן צמוד)</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeletePreference(pref._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Apart preferences */}
            <Card className="p-4">
              <h4 className="font-medium text-red-600 mb-3">לא ליד</h4>
              {preferences.filter(p => p.type === 'apart').length === 0 ? (
                <p className="text-sm text-gray-500">אין העדפות "לא ליד"</p>
              ) : (
                <div className="space-y-2">
                  {preferences.filter(p => p.type === 'apart').map((pref) => (
                    <div key={pref._id} className="flex items-center justify-between p-2 bg-red-50 rounded">
                      <div className="text-sm">
                        <span className="font-medium">{pref.guestAName}</span>
                        <span className="mx-2">⊘</span>
                        <span className="font-medium">{pref.guestBName}</span>
                        {pref.scope === 'adjacentTables' && (
                          <span className="text-xs text-gray-500 mr-2">(גם לא שולחן צמוד)</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeletePreference(pref._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">הגדרות סידור שולחנות</h3>

            <div className="space-y-4">
              {/* Mode */}
              <div>
                <label className="block text-sm font-medium mb-2">מצב סידור</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={settings.mode === 'manual'}
                      onChange={() => handleModeChange('manual')}
                      className="text-gold"
                    />
                    <span>ידני</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={settings.mode === 'auto'}
                      onChange={() => handleModeChange('auto')}
                      className="text-gold"
                    />
                    <span>אוטומטי</span>
                  </label>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {settings.mode === 'auto'
                    ? 'המערכת תשבץ אורחים אוטומטית לפי קבוצות והעדפות'
                    : 'תשבץ אורחים ידנית לכל שולחן'}
                </p>
              </div>

              {/* Seats per table */}
              <div>
                <label className="block text-sm font-medium mb-2">מקומות לשולחן</label>
                <input
                  type="number"
                  value={settings.seatsPerTable}
                  onChange={(e) => handleUpdateSettings('seatsPerTable', parseInt(e.target.value))}
                  min="1"
                  max="20"
                  className="w-24 px-3 py-2 border rounded-lg"
                />
              </div>

              {/* Auto recalc policy */}
              {settings.mode === 'auto' && (
                <div>
                  <label className="block text-sm font-medium mb-2">מדיניות חישוב מחדש</label>
                  <select
                    value={settings.autoRecalcPolicy}
                    onChange={(e) => handleUpdateSettings('autoRecalcPolicy', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="onRsvpChangeGroupOnly">רק הקבוצה שהשתנתה</option>
                    <option value="onRsvpChangeAll">כל השולחנות</option>
                    <option value="manualOnly">ידני בלבד (לחיצה על כפתור)</option>
                  </select>
                </div>
              )}

              {/* Adjacency policy */}
              {settings.mode === 'auto' && (
                <div>
                  <label className="block text-sm font-medium mb-2">מדיניות "לא ליד"</label>
                  <select
                    value={settings.adjacencyPolicy}
                    onChange={(e) => handleUpdateSettings('adjacencyPolicy', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="forbidSameTableOnly">לא באותו שולחן</option>
                    <option value="forbidSameAndAdjacent">לא באותו שולחן ולא בשולחן צמוד</option>
                  </select>
                </div>
              )}

              {/* Simulation enabled */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.simulationEnabled}
                    onChange={(e) => handleUpdateSettings('simulationEnabled', e.target.checked)}
                    className="text-gold"
                  />
                  <span>הפעל מצב הדמיה</span>
                </label>
                <p className="text-sm text-gray-500 mt-1">
                  מאפשר לראות איך היה נראה הסידור אם כל המוזמנים היו מאשרים
                </p>
              </div>
            </div>
          </Card>

          {/* Advanced Seating Settings */}
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">הגדרות שיבוץ מתקדמות</h3>

            <div className="space-y-4">
              {/* Kids Table */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <label className="flex items-center gap-2 cursor-pointer mb-3">
                  <input
                    type="checkbox"
                    checked={settings.enableKidsTable === true}
                    onChange={(e) => handleUpdateSettings('enableKidsTable', e.target.checked)}
                    className="text-blue-600 w-5 h-5"
                  />
                  <span className="font-medium text-blue-900">שולחן ילדים נפרד</span>
                </label>
                <p className="text-sm text-blue-700 mb-3">
                  ילדים ישובצו אוטומטית לשולחן ילדים נפרד (אם יש מספיק ילדים)
                </p>

                {settings.enableKidsTable && (
                  <div className="space-y-3 pr-6">
                    <div>
                      <label className="block text-sm font-medium text-blue-800 mb-1">מינימום ילדים לפתיחת שולחן</label>
                      <input
                        type="number"
                        value={settings.kidsTableMinCount || 6}
                        onChange={(e) => handleUpdateSettings('kidsTableMinCount', parseInt(e.target.value))}
                        min="2"
                        max="20"
                        className="w-20 px-3 py-1.5 border border-blue-200 rounded-lg text-sm"
                      />
                      <span className="text-sm text-blue-600 mr-2">ילדים</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Singles placement */}
              <div className="p-4 bg-pink-50 rounded-lg border border-pink-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.avoidSinglesAlone ?? true}
                    onChange={(e) => handleUpdateSettings('avoidSinglesAlone', e.target.checked)}
                    className="text-pink-600"
                  />
                  <span className="font-medium text-pink-900">מנע סינגלים בודדים בשולחן זוגות</span>
                </label>
                <p className="text-sm text-pink-700 mt-2">
                  המערכת תמנע מצב שבו סינגל יושב לבד בשולחן עם הרבה זוגות
                </p>
              </div>

              {/* Zone placement */}
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                <label className="flex items-center gap-2 cursor-pointer mb-3">
                  <input
                    type="checkbox"
                    checked={settings.enableZonePlacement || false}
                    onChange={(e) => handleUpdateSettings('enableZonePlacement', e.target.checked)}
                    className="text-purple-600"
                  />
                  <span className="font-medium text-purple-900">שיבוץ לפי אזורים באולם</span>
                </label>
                <p className="text-sm text-purple-700 mb-3">
                  אורחים ישובצו לשולחנות באזור המועדף שלהם (במה, רחבת ריקודים, אזור שקט)
                </p>

                {settings.enableZonePlacement && (
                  <div className="grid grid-cols-2 gap-2 pr-6">
                    <div className="flex items-center gap-2 text-sm text-purple-800">
                      <span className="w-3 h-3 bg-amber-400 rounded-full"></span>
                      <span>במה / חופה</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-purple-800">
                      <span className="w-3 h-3 bg-pink-400 rounded-full"></span>
                      <span>רחבת ריקודים</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-purple-800">
                      <span className="w-3 h-3 bg-teal-400 rounded-full"></span>
                      <span>אזור שקט</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-purple-800">
                      <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
                      <span>כללי</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Create/Edit Table Modal */}
      {(showCreateModal || editingTable) && (() => {
        const modalContent = (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-md w-full p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingTable ? 'ערוך שולחן' : 'צור שולחן חדש'}
              </h2>

              {/* Conflict Alert */}
              {tableConflict && (
                <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="text-amber-500 text-xl">⚠️</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-amber-800 mb-1">שולחן קיים</h3>
                      <p className="text-sm text-amber-700 mb-3">
                        שולחן מספר {tableConflict.tableNumber} כבר קיים ושמור לקבוצה <strong>"{tableConflict.tableName}"</strong>
                        {tableConflict.guestsCount > 0 && (
                          <span> ({tableConflict.guestsCount} אורחים משובצים)</span>
                        )}
                      </p>
                      <p className="text-sm text-amber-700 mb-3">האם ברצונך להחליף ביניהם?</p>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSwapTables}
                          disabled={isSwapping}
                          className="bg-amber-600 hover:bg-amber-700 text-white text-sm px-3 py-1.5"
                        >
                          {isSwapping ? 'מחליף...' : '🔄 החלף שולחנות'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setTableConflict(null)}
                          className="text-sm px-3 py-1.5"
                        >
                          ביטול
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">שם השולחן</label>
                  <input
                    type="text"
                    value={tableForm.tableName}
                    onChange={(e) => {
                      setTableForm({ ...tableForm, tableName: e.target.value });
                      setTableConflict(null);
                    }}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="לדוגמה: משפחה, צבא, חברים"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">מספר שולחן</label>
                  <input
                    type="number"
                    value={tableForm.tableNumber}
                    onChange={(e) => {
                      setTableForm({ ...tableForm, tableNumber: Number(e.target.value) });
                      setTableConflict(null);
                    }}
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
                  disabled={!!tableConflict}
                >
                  {editingTable ? 'עדכן' : 'צור'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingTable(null);
                    setTableConflict(null);
                    setTableForm({ tableName: '', tableNumber: tables.length + 1, capacity: 10, tableType: 'mixed' });
                  }}
                  className="flex-1"
                >
                  ביטול
                </Button>
              </div>
            </Card>
          </div>
        );

        // When in fullscreen, portal the modal to the fullscreen element
        if (isCanvasFullscreen && document.fullscreenElement) {
          return createPortal(modalContent, document.fullscreenElement);
        }
        return modalContent;
      })()}

      {/* Assign Modal for specific table */}
      {showAssignModal && selectedTable && (() => {
        const assignModalContent = (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold">
                  שולחן {selectedTable.tableNumber} - {selectedTable.tableName}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {getPeopleAtTableFiltered(selectedTable)}/{selectedTable.capacity} מקומות תפוסים
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {/* Current guests */}
                {getFilteredGuests(selectedTable).length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-medium mb-3">אורחים בשולחן:</h3>
                    <div className="space-y-2">
                      {getFilteredGuests(selectedTable).map((guest, i) => (
                        <div
                          key={guest._id}
                          className={`flex justify-between items-center p-2 rounded ${
                            guest.lockedSeat ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-3 h-3 rounded-full ${guestColors[i % guestColors.length]}`}></span>
                            <span>{guest.name}</span>
                            <span className="text-xs text-gray-500">
                              ({(guest.adultsAttending || 1) + (guest.childrenAttending || 0)})
                            </span>
                            {guest.lockedSeat && (
                              <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                                🔒 נעול
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleGuestLock(guest._id, !!guest.lockedSeat, selectedTable._id)}
                              className={`text-xs px-2 py-1 rounded ${
                                guest.lockedSeat
                                  ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                              title={guest.lockedSeat ? 'שחרר נעילה' : 'נעל לשולחן זה'}
                            >
                              {guest.lockedSeat ? '🔓' : '🔒'}
                            </button>
                            <button
                              onClick={() => handleRemoveGuest(guest._id, selectedTable._id)}
                              className="text-red-500 text-sm hover:underline"
                              disabled={guest.lockedSeat}
                              title={guest.lockedSeat ? 'שחרר נעילה כדי להסיר' : 'הסר מהשולחן'}
                            >
                              הסר
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add unassigned guests */}
                {unassignedGuests.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-medium mb-3 text-emerald-700">אורחים לא משובצים:</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {unassignedGuests.map((guest) => (
                        <div
                          key={guest._id}
                          className="flex justify-between items-center p-2 border border-emerald-200 bg-emerald-50 rounded hover:bg-emerald-100"
                        >
                          <div>
                            <span>{guest.name}</span>
                            <span className="text-xs text-gray-500 mr-2">
                              ({(guest.adultsAttending || 1) + (guest.childrenAttending || 0)} אנשים)
                            </span>
                          </div>
                          <button
                            onClick={() => handleAssignGuest(guest._id, selectedTable._id)}
                            className="px-3 py-1 bg-emerald-500 text-white text-sm rounded hover:bg-emerald-600"
                          >
                            הוסף
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Move guests from other tables */}
                {(() => {
                  // Get guests from other tables
                  const guestsInOtherTables = allTables
                    .filter(t => t._id !== selectedTable._id)
                    .flatMap(t => getFilteredGuests(t).map(guest => ({
                      ...guest,
                      currentTableId: t._id,
                      currentTableNumber: t.tableNumber,
                      currentTableName: t.tableName,
                    })));

                  if (guestsInOtherTables.length === 0) return null;

                  return (
                    <div>
                      <h3 className="font-medium mb-3 text-blue-700">העבר משולחן אחר:</h3>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {guestsInOtherTables.map((guest) => (
                          <div
                            key={guest._id}
                            className="flex justify-between items-center p-2 border border-blue-200 bg-blue-50 rounded hover:bg-blue-100"
                          >
                            <div>
                              <span>{guest.name}</span>
                              <span className="text-xs text-gray-500 mr-2">
                                ({(guest.adultsAttending || 1) + (guest.childrenAttending || 0)} אנשים)
                              </span>
                              <span className="text-xs bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded mr-1">
                                שולחן {guest.currentTableNumber}
                              </span>
                            </div>
                            <button
                              onClick={async () => {
                                // Remove from current table, then add to selected table
                                await tablesStore.removeGuest(guest._id, guest.currentTableId);
                                await handleAssignGuest(guest._id, selectedTable._id);
                              }}
                              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                            >
                              העבר לכאן
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {unassignedGuests.length === 0 && getFilteredGuests(selectedTable).length === 0 && allTables.filter(t => t._id !== selectedTable._id).every(t => getFilteredGuests(t).length === 0) && (
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
        );

        // When in fullscreen, portal the modal to the fullscreen element
        if (isCanvasFullscreen && document.fullscreenElement) {
          return createPortal(assignModalContent, document.fullscreenElement);
        }
        return assignModalContent;
      })()}

      {/* Group Modal */}
      {(showGroupModal || editingGroup) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">
              {editingGroup ? 'ערוך קבוצה' : 'צור קבוצה חדשה'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">שם הקבוצה</label>
                <input
                  type="text"
                  value={groupForm.name}
                  onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="לדוגמה: משפחת כהן, חברים מהעבודה"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">עדיפות (אופציונלי)</label>
                <input
                  type="number"
                  value={groupForm.priority}
                  onChange={(e) => setGroupForm({ ...groupForm, priority: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">קבוצות עם עדיפות גבוהה יותר ישובצו קודם</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={editingGroup ? handleUpdateGroup : handleCreateGroup}
                className="flex-1"
              >
                {editingGroup ? 'עדכן' : 'צור'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowGroupModal(false);
                  setEditingGroup(null);
                  setGroupForm({ name: '', priority: 0 });
                }}
                className="flex-1"
              >
                ביטול
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Preference Modal */}
      {showPreferenceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">צור העדפת ישיבה</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">אורח ראשון</label>
                <select
                  value={preferenceForm.guestAId}
                  onChange={(e) => setPreferenceForm({ ...preferenceForm, guestAId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">בחר אורח...</option>
                  {guestsStore.guests.map((guest) => (
                    <option key={guest._id} value={guest._id}>
                      {guest.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">סוג העדפה</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={preferenceForm.type === 'together'}
                      onChange={() => setPreferenceForm({ ...preferenceForm, type: 'together' })}
                    />
                    <span className="text-green-600">כן ליד</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={preferenceForm.type === 'apart'}
                      onChange={() => setPreferenceForm({ ...preferenceForm, type: 'apart' })}
                    />
                    <span className="text-red-600">לא ליד</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">אורח שני</label>
                <select
                  value={preferenceForm.guestBId}
                  onChange={(e) => setPreferenceForm({ ...preferenceForm, guestBId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">בחר אורח...</option>
                  {guestsStore.guests
                    .filter((g) => g._id !== preferenceForm.guestAId)
                    .map((guest) => (
                      <option key={guest._id} value={guest._id}>
                        {guest.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">היקף</label>
                <select
                  value={preferenceForm.scope}
                  onChange={(e) => setPreferenceForm({ ...preferenceForm, scope: e.target.value as 'sameTable' | 'adjacentTables' })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="sameTable">באותו שולחן בלבד</option>
                  <option value="adjacentTables">גם שולחנות צמודים</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button onClick={handleCreatePreference} className="flex-1">
                צור
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowPreferenceModal(false);
                  setPreferenceForm({ guestAId: '', guestBId: '', type: 'together', scope: 'sameTable' });
                }}
                className="flex-1"
              >
                ביטול
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Delete Table with Move Guests Modal */}
      {deletingTable && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-lg w-full p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">מחיקת שולחן {deletingTable.tableNumber}</h2>
                <p className="text-gray-600 mt-1">
                  בשולחן זה יש {getFilteredGuests(deletingTable).length} אורחים ({getPeopleAtTableFiltered(deletingTable)} אנשים).
                  <br />
                  לאיזה שולחן להעביר אותם?
                </p>
              </div>
            </div>

            {/* Current guests in table */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-2">אורחים בשולחן:</div>
              <div className="flex flex-wrap gap-1">
                {getFilteredGuests(deletingTable).map((guest) => (
                  <span
                    key={guest._id}
                    className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                  >
                    {guest.name} ({(guest.adultsAttending || 1) + (guest.childrenAttending || 0)})
                  </span>
                ))}
              </div>
            </div>

            {/* Select destination table */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">בחר שולחן יעד:</label>
              {(() => {
                const availableTables = getAvailableTablesForMove(
                  deletingTable._id,
                  getPeopleAtTableFiltered(deletingTable)
                );

                if (availableTables.length === 0) {
                  return (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
                      <div className="font-medium mb-1">אין שולחנות זמינים</div>
                      <p>אין שולחן עם מספיק מקומות פנויים להכיל את כל האורחים ({getPeopleAtTableFiltered(deletingTable)} אנשים).</p>
                      <p className="mt-2">אפשרויות:</p>
                      <ul className="list-disc list-inside mt-1">
                        <li>הסר חלק מהאורחים ידנית לפני המחיקה</li>
                        <li>הגדל את הקיבולת של שולחן אחר</li>
                        <li>צור שולחן חדש</li>
                      </ul>
                    </div>
                  );
                }

                return (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {availableTables.map((table) => {
                      const currentPeople = getPeopleAtTableFiltered(table);
                      const availableSeats = table.capacity - currentPeople;

                      return (
                        <label
                          key={table._id}
                          className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition ${
                            moveGuestsToTableId === table._id
                              ? 'border-gold bg-gold/5'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="destinationTable"
                            value={table._id}
                            checked={moveGuestsToTableId === table._id}
                            onChange={(e) => setMoveGuestsToTableId(e.target.value)}
                            className="text-gold"
                          />
                          <div className="flex-1">
                            <div className="font-medium">
                              שולחן {table.tableNumber} - {table.tableName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {currentPeople}/{table.capacity} תפוסים • {availableSeats} מקומות פנויים
                            </div>
                          </div>
                          <div className="text-sm font-medium text-emerald-600">
                            +{availableSeats}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleDeleteWithMoveGuests}
                disabled={!moveGuestsToTableId || isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? 'מעביר ומוחק...' : 'העבר אורחים ומחק שולחן'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setDeletingTable(null);
                  setMoveGuestsToTableId('');
                }}
                disabled={isDeleting}
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
});
