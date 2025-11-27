'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { rootStore } from '@/lib/stores/RootStore';
import type { Table, GuestGroup } from '@/lib/stores/types';

interface Position {
  x: number;
  y: number;
}

interface SpecialElement {
  id: string;
  type: 'danceFloor' | 'bar' | 'stage' | 'entrance';
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface EventHallCanvasProps {
  onTableClick: (table: Table) => void;
  onTableEdit: (table: Table) => void;
  groups: GuestGroup[];
  viewMode?: 'real' | 'simulation';
  simulationEnabled?: boolean;
}


const DEFAULT_SPECIAL_ELEMENTS: SpecialElement[] = [
  { id: 'dance-floor', type: 'danceFloor', name: 'רחבת ריקודים', x: 300, y: 50, width: 200, height: 150 },
  { id: 'bar', type: 'bar', name: 'בר', x: 550, y: 50, width: 120, height: 80 },
];

export const EventHallCanvas = observer(({ onTableClick, onTableEdit, groups, viewMode = 'simulation', simulationEnabled = false }: EventHallCanvasProps) => {
  const { tablesStore } = rootStore;
  const allTables = tablesStore.tables;

  // Filter tables based on view mode
  const tables = viewMode === 'real' && simulationEnabled
    ? allTables.filter(table => table.assignedGuests.some(guest => guest.rsvpStatus === 'confirmed'))
    : allTables;

  // Helper to get filtered guests for a table
  const getFilteredGuests = (table: Table) => {
    if (viewMode === 'real' && simulationEnabled) {
      return table.assignedGuests.filter(guest => guest.rsvpStatus === 'confirmed');
    }
    return table.assignedGuests;
  };

  // Helper to get people count based on view mode
  const getPeopleAtTableFiltered = (table: Table) => {
    const guests = getFilteredGuests(table);
    return guests.reduce((sum, guest) => {
      return sum + (guest.adultsAttending || 1) + (guest.childrenAttending || 0);
    }, 0);
  };

  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggingTable, setDraggingTable] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [tablePositions, setTablePositions] = useState<Map<string, Position>>(new Map());
  const [specialElements, setSpecialElements] = useState<SpecialElement[]>(DEFAULT_SPECIAL_ELEMENTS);
  const [scale, setScale] = useState(1);
  const [showGrid, setShowGrid] = useState(true);

  // Keep track of last dragged position for saving
  const lastDraggedPosition = useRef<{ tableId: string; pos: Position } | null>(null);

  // Initialize table positions
  useEffect(() => {
    const positions = new Map<string, Position>();
    tables.forEach((table, index) => {
      // Use saved position or calculate default grid position
      if (table.positionX !== undefined && table.positionY !== undefined) {
        positions.set(table._id, { x: table.positionX, y: table.positionY });
      } else {
        // Auto-arrange in grid
        const cols = 5;
        const row = Math.floor(index / cols);
        const col = index % cols;
        positions.set(table._id, {
          x: 50 + col * 160,
          y: 250 + row * 160,
        });
      }
    });
    setTablePositions(positions);
  }, [tables]);

  // Handle mouse down on table
  const handleTableMouseDown = (e: React.MouseEvent, tableId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const pos = tablePositions.get(tableId);
    if (!pos) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    setDraggingTable(tableId);
    setDragOffset({
      x: (e.clientX - rect.left) / scale - pos.x,
      y: (e.clientY - rect.top) / scale - pos.y,
    });
  };

  // Handle mouse move
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggingTable || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const newX = Math.max(0, (e.clientX - rect.left) / scale - dragOffset.x);
    const newY = Math.max(0, (e.clientY - rect.top) / scale - dragOffset.y);

    // Snap to grid
    const gridSize = 20;
    const snappedX = Math.round(newX / gridSize) * gridSize;
    const snappedY = Math.round(newY / gridSize) * gridSize;

    // Update ref for saving on mouse up
    lastDraggedPosition.current = { tableId: draggingTable, pos: { x: snappedX, y: snappedY } };

    setTablePositions(prev => {
      const newPositions = new Map(prev);
      newPositions.set(draggingTable, { x: snappedX, y: snappedY });
      return newPositions;
    });
  }, [draggingTable, dragOffset, scale]);

  // Handle mouse up
  const handleMouseUp = useCallback(async () => {
    if (lastDraggedPosition.current) {
      const { tableId, pos } = lastDraggedPosition.current;
      // Save position to database
      try {
        const response = await fetch(`/api/tables/${tableId}/position`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ positionX: pos.x, positionY: pos.y }),
        });
        if (!response.ok) {
          console.error('Failed to save table position:', await response.text());
        }
      } catch (error) {
        console.error('Failed to save table position:', error);
      }
      lastDraggedPosition.current = null;
    }
    setDraggingTable(null);
  }, []);

  // Get table color based on occupancy
  const getTableColor = (table: Table) => {
    const peopleAtTable = getPeopleAtTableFiltered(table);
    const occupancyRate = peopleAtTable / table.capacity;

    if (peopleAtTable === 0) return 'bg-cyan-400 border-cyan-500'; // Empty - cyan
    if (occupancyRate < 1) return 'bg-teal-500 border-teal-600'; // Partially full - teal
    return 'bg-emerald-500 border-emerald-600'; // Full - emerald
  };

  // Get group name for table
  const getGroupName = (table: Table) => {
    if (table.groupId) {
      const group = groups.find(g => g._id === table.groupId);
      return group?.name;
    }
    return table.tableName;
  };

  // Render a table
  const renderTable = (table: Table) => {
    const pos = tablePositions.get(table._id) || { x: 0, y: 0 };
    const peopleAtTable = getPeopleAtTableFiltered(table);
    const groupName = getGroupName(table);
    const isDragging = draggingTable === table._id;

    return (
      <div
        key={table._id}
        className={`absolute cursor-move select-none transition-shadow ${isDragging ? 'z-50 shadow-2xl' : 'z-10'}`}
        style={{
          left: pos.x,
          top: pos.y,
          transform: isDragging ? 'scale(1.05)' : 'scale(1)',
        }}
        onMouseDown={(e) => handleTableMouseDown(e, table._id)}
        onDoubleClick={() => onTableClick(table)}
      >
        {/* Table shape - scalloped edge effect */}
        <div className={`relative w-24 h-24 ${getTableColor(table)} rounded-full border-4 shadow-lg flex flex-col items-center justify-center`}>
          {/* Scalloped edge using pseudo circles */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
            {/* Decorative dots around the edge */}
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i * 30) * Math.PI / 180;
              const cx = 50 + 45 * Math.cos(angle);
              const cy = 50 + 45 * Math.sin(angle);
              return (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r="6"
                  className={peopleAtTable > i ? 'fill-white/80' : 'fill-white/30'}
                />
              );
            })}
          </svg>

          {/* Table number */}
          <div className="text-white font-bold text-xl z-10">{table.tableNumber}</div>

          {/* Capacity */}
          <div className="text-white/90 text-xs z-10">{peopleAtTable} / {table.capacity}</div>

          {/* Group name */}
          <div className="text-white/80 text-[10px] text-center px-1 truncate max-w-[70px] z-10">
            {groupName}
          </div>
        </div>

        {/* Edit button */}
        <button
          className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full shadow flex items-center justify-center text-gray-600 hover:bg-gray-100 z-20"
          onClick={(e) => {
            e.stopPropagation();
            onTableEdit(table);
          }}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
      </div>
    );
  };

  // Render special element
  const renderSpecialElement = (element: SpecialElement) => {
    const getElementStyle = () => {
      switch (element.type) {
        case 'danceFloor':
          return 'bg-rose-400 border-rose-500';
        case 'bar':
          return 'bg-teal-400 border-teal-500';
        case 'stage':
          return 'bg-purple-400 border-purple-500';
        case 'entrance':
          return 'bg-gray-400 border-gray-500';
        default:
          return 'bg-gray-300 border-gray-400';
      }
    };

    const getIcon = () => {
      switch (element.type) {
        case 'danceFloor':
          return (
            <svg className="w-10 h-10 text-white/80" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
          );
        case 'bar':
          return (
            <svg className="w-8 h-8 text-white/80" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 5V3H3v2l8 9v5H6v2h12v-2h-5v-5l8-9zM7.43 7L5.66 5h12.69l-1.78 2H7.43z"/>
            </svg>
          );
        default:
          return null;
      }
    };

    return (
      <div
        key={element.id}
        className={`absolute ${getElementStyle()} border-4 rounded-lg shadow-lg flex flex-col items-center justify-center`}
        style={{
          left: element.x,
          top: element.y,
          width: element.width,
          height: element.height,
        }}
      >
        {getIcon()}
        <div className="text-white font-medium text-sm mt-1">{element.name}</div>
      </div>
    );
  };

  return (
    <div className="relative w-full h-full bg-gray-100 rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="absolute top-3 left-3 z-30 flex gap-2">
        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${showGrid ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 shadow'}`}
        >
          {showGrid ? '🔲 רשת' : '⬜ רשת'}
        </button>
        <button
          onClick={() => setScale(s => Math.min(1.5, s + 0.1))}
          className="px-3 py-1.5 bg-white shadow rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          +
        </button>
        <button
          onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
          className="px-3 py-1.5 bg-white shadow rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          -
        </button>
        <span className="px-3 py-1.5 bg-white shadow rounded-lg text-sm text-gray-500">
          {Math.round(scale * 100)}%
        </span>
      </div>

      {/* Legend */}
      <div className="absolute top-3 right-3 z-30 bg-white shadow rounded-lg p-3">
        <div className="text-xs font-medium text-gray-600 mb-2">מקרא:</div>
        <div className="flex flex-col gap-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-cyan-400"></div>
            <span>ריק (0 אורחים)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-teal-500"></div>
            <span>מלא חלקית</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
            <span>מלא</span>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="w-full h-full overflow-auto"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          backgroundImage: showGrid
            ? 'radial-gradient(circle, #ccc 1px, transparent 1px)'
            : 'none',
          backgroundSize: `${20 * scale}px ${20 * scale}px`,
          cursor: draggingTable ? 'grabbing' : 'default',
        }}
      >
        <div
          className="relative"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            width: 1200,
            height: 900,
            minWidth: 1200,
            minHeight: 900,
          }}
        >
          {/* Special Elements */}
          {specialElements.map(renderSpecialElement)}

          {/* Tables */}
          {tables.map(renderTable)}
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-3 left-3 z-30 bg-white/90 shadow rounded-lg px-3 py-2 text-xs text-gray-600">
        <span className="font-medium">טיפ:</span> גרור שולחנות למיקום הרצוי | לחץ פעמיים לפתיחת פרטי השולחן
      </div>
    </div>
  );
});
