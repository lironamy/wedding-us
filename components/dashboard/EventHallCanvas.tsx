'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';
import { rootStore } from '@/lib/stores/RootStore';
import type { Table, GuestGroup } from '@/lib/stores/types';

interface Position {
  x: number;
  y: number;
}

interface SpecialElement {
  id: string;
  type: 'danceFloor' | 'bar' | 'stage' | 'entrance' | 'chuppah' | 'dj' | 'restrooms' | 'photo' | 'gifts' | 'custom';
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  icon?: string;
  inSidebar?: boolean; // If true, element is in sidebar and not on canvas
}

interface EventHallCanvasProps {
  onTableClick: (table: Table) => void;
  onTableEdit: (table: Table) => void;
  groups: GuestGroup[];
  viewMode?: 'real' | 'simulation';
  simulationEnabled?: boolean;
  weddingId: string;
  onFullscreenChange?: (isFullscreen: boolean) => void;
}


const DEFAULT_SPECIAL_ELEMENTS: SpecialElement[] = [
  { id: 'dance-floor', type: 'danceFloor', name: 'רחבת ריקודים', x: 500, y: 50, width: 200, height: 150, icon: '💃' },
  { id: 'bar', type: 'bar', name: 'בר', x: 750, y: 50, width: 120, height: 80, icon: '🍸' },
  { id: 'stage', type: 'stage', name: 'במה', x: 500, y: 220, width: 180, height: 100, icon: '🎤' },
  { id: 'chuppah', type: 'chuppah', name: 'חופה', x: 0, y: 0, width: 120, height: 120, icon: '💒', inSidebar: true },
  { id: 'dj', type: 'dj', name: 'עמדת DJ', x: 0, y: 0, width: 100, height: 80, icon: '🎧', inSidebar: true },
  { id: 'restrooms', type: 'restrooms', name: 'שירותים', x: 0, y: 0, width: 100, height: 80, icon: '🚻', inSidebar: true },
  { id: 'photo', type: 'photo', name: 'עמדת צילום', x: 0, y: 0, width: 100, height: 80, icon: '📸', inSidebar: true },
  { id: 'gifts', type: 'gifts', name: 'שולחן מתנות', x: 0, y: 0, width: 120, height: 60, icon: '🎁', inSidebar: true },
  { id: 'entrance', type: 'entrance', name: 'כניסה', x: 0, y: 0, width: 80, height: 60, icon: '🚪', inSidebar: true },
];

// Available elements that can be added to the canvas
const AVAILABLE_ELEMENTS = [
  { type: 'chuppah', name: 'חופה', icon: '💒', width: 120, height: 120 },
  { type: 'dj', name: 'עמדת DJ', icon: '🎧', width: 100, height: 80 },
  { type: 'restrooms', name: 'שירותים', icon: '🚻', width: 100, height: 80 },
  { type: 'photo', name: 'עמדת צילום', icon: '📸', width: 100, height: 80 },
  { type: 'gifts', name: 'שולחן מתנות', icon: '🎁', width: 120, height: 60 },
  { type: 'entrance', name: 'כניסה', icon: '🚪', width: 80, height: 60 },
  { type: 'bar', name: 'בר נוסף', icon: '🍸', width: 120, height: 80 },
] as const;

export const EventHallCanvas = observer(({ onTableClick, onTableEdit, groups, viewMode = 'simulation', simulationEnabled = false, weddingId, onFullscreenChange }: EventHallCanvasProps) => {
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
  // Server sends seatsInTable and simulationSeatsInTable - frontend just displays
  const getPeopleAtTableFiltered = (table: Table) => {
    const guests = getFilteredGuests(table);
    return guests.reduce((sum, guest: any) => {
      const seats = viewMode === 'simulation' ? guest.simulationSeatsInTable : guest.seatsInTable;
      return sum + (seats || 0);
    }, 0);
  };

  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingTable, setDraggingTable] = useState<string | null>(null);
  const [draggingElement, setDraggingElement] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [tablePositions, setTablePositions] = useState<Map<string, Position>>(new Map());
  const [specialElements, setSpecialElements] = useState<SpecialElement[]>(DEFAULT_SPECIAL_ELEMENTS);
  const [scale, setScale] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  // Get elements on canvas vs in sidebar
  const canvasElements = specialElements.filter(el => !el.inSidebar);
  const sidebarElements = specialElements.filter(el => el.inSidebar);

  // Add element to canvas
  const addElementToCanvas = (elementType: string) => {
    const template = AVAILABLE_ELEMENTS.find(el => el.type === elementType);
    if (!template) return;

    const newElement: SpecialElement = {
      id: `${elementType}-${Date.now()}`,
      type: template.type as SpecialElement['type'],
      name: template.name,
      x: 100 + Math.random() * 200,
      y: 400 + Math.random() * 200,
      width: template.width,
      height: template.height,
      icon: template.icon,
      inSidebar: false,
    };

    setSpecialElements(prev => [...prev, newElement]);
  };

  // Move element to sidebar (remove from canvas)
  const moveElementToSidebar = (elementId: string) => {
    setSpecialElements(prev =>
      prev.map(el =>
        el.id === elementId ? { ...el, inSidebar: true, x: 0, y: 0 } : el
      )
    );
    setSelectedElement(null);
  };

  // Move element back to canvas from sidebar
  const moveElementToCanvas = (elementId: string) => {
    setSpecialElements(prev =>
      prev.map(el =>
        el.id === elementId
          ? { ...el, inSidebar: false, x: 100 + Math.random() * 200, y: 400 + Math.random() * 200 }
          : el
      )
    );
  };

  // Delete element completely
  const deleteElement = (elementId: string) => {
    setSpecialElements(prev => prev.filter(el => el.id !== elementId));
    setSelectedElement(null);
  };

  // Resize element
  const resizeElement = (elementId: string, delta: number) => {
    setSpecialElements(prev =>
      prev.map(el =>
        el.id === elementId
          ? {
              ...el,
              width: Math.max(60, el.width + delta),
              height: Math.max(40, el.height + delta * (el.height / el.width)),
            }
          : el
      )
    );
  };

  // Handle mouse down on element
  const handleElementMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const element = specialElements.find(el => el.id === elementId);
    if (!element || element.inSidebar) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect || !canvasRef.current) return;

    setDraggingElement(elementId);
    setSelectedElement(elementId);
    setDragOffset({
      x: (e.clientX - rect.left + canvasRef.current.scrollLeft) / scale - element.x,
      y: (e.clientY - rect.top + canvasRef.current.scrollTop) / scale - element.y,
    });
  };

  // Keep track of last dragged position for saving
  const lastDraggedPosition = useRef<{ tableId: string; pos: Position } | null>(null);
  // Keep track of previous table IDs to detect actual changes
  const prevTableIdsRef = useRef<string>('');

  // Initialize table positions - only when tables actually change
  useEffect(() => {
    // Create a stable key for comparison
    const tableKey = tables.map(t => `${t._id}:${t.positionX}:${t.positionY}`).join(',');

    // Skip if tables haven't actually changed
    if (tableKey === prevTableIdsRef.current) {
      return;
    }
    prevTableIdsRef.current = tableKey;

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
    if (!rect || !canvasRef.current) return;

    setDraggingTable(tableId);
    setDragOffset({
      x: (e.clientX - rect.left + canvasRef.current.scrollLeft) / scale - pos.x,
      y: (e.clientY - rect.top + canvasRef.current.scrollTop) / scale - pos.y,
    });
  };

  // Canvas dimensions - match the container size
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 800 });
  const TABLE_SIZE = 96; // Tables are 96px (w-24 = 24*4)
  const SIDEBAR_WIDTH = 280; // Width of the sidebar panel

  // Match canvas size to container
  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setCanvasSize({
          width: Math.floor(rect.width),
          height: Math.floor(rect.height)
        });
      }
    };

    // Small delay to ensure container is rendered
    const timer = setTimeout(updateCanvasSize, 100);

    // Update on resize
    window.addEventListener('resize', updateCanvasSize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [isFullscreen]);

  const CANVAS_WIDTH = canvasSize.width;
  const CANVAS_HEIGHT = canvasSize.height;

  // Handle mouse move (for tables and elements)
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const rawX = (e.clientX - rect.left + canvasRef.current.scrollLeft) / scale - dragOffset.x;
    const rawY = (e.clientY - rect.top + canvasRef.current.scrollTop) / scale - dragOffset.y;

    // Snap to grid first
    const gridSize = 20;
    const snappedX = Math.round(rawX / gridSize) * gridSize;
    const snappedY = Math.round(rawY / gridSize) * gridSize;

    // Handle table dragging
    if (draggingTable) {
      const finalX = Math.max(0, Math.min(CANVAS_WIDTH - TABLE_SIZE, snappedX));
      const finalY = Math.max(0, Math.min(CANVAS_HEIGHT - TABLE_SIZE, snappedY));

      lastDraggedPosition.current = { tableId: draggingTable, pos: { x: finalX, y: finalY } };

      setTablePositions(prev => {
        const newPositions = new Map(prev);
        newPositions.set(draggingTable, { x: finalX, y: finalY });
        return newPositions;
      });
    }

    // Handle element dragging
    if (draggingElement) {
      const element = specialElements.find(el => el.id === draggingElement);
      if (element) {
        const finalX = Math.max(0, Math.min(CANVAS_WIDTH - element.width, snappedX));
        const finalY = Math.max(0, Math.min(CANVAS_HEIGHT - element.height, snappedY));

        setSpecialElements(prev =>
          prev.map(el =>
            el.id === draggingElement ? { ...el, x: finalX, y: finalY } : el
          )
        );
      }
    }
  }, [draggingTable, draggingElement, dragOffset, scale, specialElements]);

  // Handle mouse up
  const handleMouseUp = useCallback(async () => {
    if (lastDraggedPosition.current) {
      const { tableId, pos } = lastDraggedPosition.current;
      // Save position via store (updates both DB and local state)
      await tablesStore.updateTablePosition(tableId, pos.x, pos.y);
      lastDraggedPosition.current = null;
    }
    setDraggingTable(null);
    setDraggingElement(null);
  }, [tablesStore]);

  // Global mouse event listeners for drag outside canvas (tables and elements)
  useEffect(() => {
    if (!draggingTable && !draggingElement) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const rawX = (e.clientX - rect.left + canvasRef.current.scrollLeft) / scale - dragOffset.x;
      const rawY = (e.clientY - rect.top + canvasRef.current.scrollTop) / scale - dragOffset.y;

      // Snap to grid first
      const gridSize = 20;
      const snappedX = Math.round(rawX / gridSize) * gridSize;
      const snappedY = Math.round(rawY / gridSize) * gridSize;

      // Handle table dragging
      if (draggingTable) {
        const finalX = Math.max(0, Math.min(CANVAS_WIDTH - TABLE_SIZE, snappedX));
        const finalY = Math.max(0, Math.min(CANVAS_HEIGHT - TABLE_SIZE, snappedY));

        lastDraggedPosition.current = { tableId: draggingTable, pos: { x: finalX, y: finalY } };

        setTablePositions(prev => {
          const newPositions = new Map(prev);
          newPositions.set(draggingTable, { x: finalX, y: finalY });
          return newPositions;
        });
      }

      // Handle element dragging
      if (draggingElement) {
        const element = specialElements.find(el => el.id === draggingElement);
        if (element) {
          const finalX = Math.max(0, Math.min(CANVAS_WIDTH - element.width, snappedX));
          const finalY = Math.max(0, Math.min(CANVAS_HEIGHT - element.height, snappedY));

          setSpecialElements(prev =>
            prev.map(el =>
              el.id === draggingElement ? { ...el, x: finalX, y: finalY } : el
            )
          );
        }
      }
    };

    const handleGlobalMouseUp = () => {
      handleMouseUp();
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [draggingTable, draggingElement, dragOffset, scale, handleMouseUp, specialElements]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      // Enter fullscreen
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, [isFullscreen]);

  // Reset layout - center tables and move elements to sidebar
  const resetLayout = useCallback(async () => {
    // Reset table positions to center grid
    const cols = 5;
    const startX = Math.max(50, (CANVAS_WIDTH - cols * 160) / 2);
    const startY = 250;

    const newPositions = new Map<string, Position>();
    tables.forEach((table, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      const newX = startX + col * 160;
      const newY = startY + row * 160;
      newPositions.set(table._id, { x: newX, y: newY });
      // Save to database
      tablesStore.updateTablePosition(table._id, newX, newY);
    });
    setTablePositions(newPositions);

    // Move all canvas elements back to sidebar
    setSpecialElements(prev =>
      prev.map(el => ({ ...el, inSidebar: true, x: 0, y: 0 }))
    );

    // Reset default elements (dance floor, bar, stage) to their original positions
    setSpecialElements(DEFAULT_SPECIAL_ELEMENTS);
  }, [tables, tablesStore, CANVAS_WIDTH]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNowFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isNowFullscreen);
      onFullscreenChange?.(isNowFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [onFullscreenChange]);

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

  // Selected table for showing controls
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  // Get table size in pixels
  const getTableSize = (size?: 'small' | 'medium' | 'large') => {
    switch (size) {
      case 'small': return 72;
      case 'large': return 120;
      default: return 96; // medium
    }
  };

  // Handle table size change
  const handleTableSizeChange = async (tableId: string, newSize: 'small' | 'medium' | 'large') => {
    await tablesStore.updateTableVisual(tableId, undefined, newSize);
  };

  // Handle table shape change
  const handleTableShapeChange = async (tableId: string, newShape: 'round' | 'square' | 'rectangle') => {
    await tablesStore.updateTableVisual(tableId, newShape, undefined);
  };

  // Get table dimensions based on shape and size
  const getTableDimensions = (shape: string, size: string) => {
    const baseSize = size === 'small' ? 72 : size === 'large' ? 120 : 96;
    if (shape === 'rectangle') {
      // Rectangle is wider than tall
      return { width: baseSize * 1.8, height: baseSize * 0.7 };
    }
    return { width: baseSize, height: baseSize };
  };

  // Render a table
  const renderTable = (table: Table) => {
    const pos = tablePositions.get(table._id) || { x: 0, y: 0 };
    const peopleAtTable = getPeopleAtTableFiltered(table);
    const groupName = getGroupName(table);
    const isDragging = draggingTable === table._id;
    const isSelected = selectedTableId === table._id;
    const shape = table.shape || 'round';
    const size = table.size || 'medium';
    const { width: tableWidth, height: tableHeight } = getTableDimensions(shape, size);
    const isRectangle = shape === 'rectangle';
    const isSquare = shape === 'square';

    // Get border radius based on shape
    const getBorderRadius = () => {
      if (shape === 'round') return '9999px';
      if (shape === 'rectangle') return '12px';
      return '8px'; // square
    };

    return (
      <div
        key={table._id}
        className={`absolute select-none transition-shadow ${isDragging ? 'z-50 shadow-2xl' : isSelected ? 'z-40' : 'z-10'} cursor-move`}
        style={{
          left: pos.x,
          top: pos.y,
          transform: isDragging ? 'scale(1.05)' : 'scale(1)',
        }}
        onMouseDown={(e) => handleTableMouseDown(e, table._id)}
        onDoubleClick={() => onTableClick(table)}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedTableId(isSelected ? null : table._id);
        }}
      >
        {/* Table shape */}
        <div
          className={`relative ${getTableColor(table)} border-4 shadow-lg flex flex-col items-center justify-center transition-all ${
            isSelected ? 'ring-4 ring-blue-400 ring-offset-2' : ''
          }`}
          style={{
            width: tableWidth,
            height: tableHeight,
            borderRadius: getBorderRadius()
          }}
        >
          {/* Decorative dots around the edge */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {isRectangle ? (
              // For rectangle: dots along top and bottom edges
              <>
                {Array.from({ length: 8 }).map((_, i) => {
                  const xPos = 8 + (i * 12);
                  return (
                    <React.Fragment key={i}>
                      <circle cx={xPos} cy={12} r="4" className={peopleAtTable > i ? 'fill-white/80' : 'fill-white/30'} />
                      <circle cx={xPos} cy={88} r="4" className={peopleAtTable > i + 8 ? 'fill-white/80' : 'fill-white/30'} />
                    </React.Fragment>
                  );
                })}
              </>
            ) : (
              // For round/square: dots around the edge
              Array.from({ length: 12 }).map((_, i) => {
                const angle = (i * 30) * Math.PI / 180;
                const radius = isSquare ? 40 : 45;
                const cx = 50 + radius * Math.cos(angle);
                const cy = 50 + radius * Math.sin(angle);
                return (
                  <circle
                    key={i}
                    cx={cx}
                    cy={cy}
                    r={tableWidth > 90 ? 6 : 5}
                    className={peopleAtTable > i ? 'fill-white/80' : 'fill-white/30'}
                  />
                );
              })
            )}
          </svg>

          {/* Table number */}
          <div className={`text-white font-bold z-10 ${tableWidth > 90 ? 'text-xl' : 'text-lg'}`}>
            {table.tableNumber}
          </div>

          {/* Capacity */}
          <div className={`text-white/90 z-10 ${tableWidth > 90 ? 'text-xs' : 'text-[10px]'}`}>
            {peopleAtTable} / {table.capacity}
          </div>

          {/* Group name - hide on small rectangle */}
          {!(isRectangle && size === 'small') && (
            <div
              className={`text-white/80 text-center px-1 truncate z-10 ${
                isRectangle ? 'text-[9px] max-w-[120px]' : tableWidth > 90 ? 'text-[10px] max-w-[80px]' : 'text-[8px] max-w-[55px]'
              }`}
            >
              {groupName}
            </div>
          )}
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

        {/* Table controls - show when selected */}
        {isSelected && (
          <div
            className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex gap-1 bg-white rounded-lg shadow-lg p-1.5 z-30"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Size controls */}
            <button
              onClick={() => handleTableSizeChange(table._id, 'small')}
              className={`w-6 h-6 rounded text-xs font-bold transition ${
                size === 'small' ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
              title="קטן"
            >
              S
            </button>
            <button
              onClick={() => handleTableSizeChange(table._id, 'medium')}
              className={`w-6 h-6 rounded text-xs font-bold transition ${
                size === 'medium' ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
              title="בינוני"
            >
              M
            </button>
            <button
              onClick={() => handleTableSizeChange(table._id, 'large')}
              className={`w-6 h-6 rounded text-xs font-bold transition ${
                size === 'large' ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
              title="גדול"
            >
              L
            </button>

            <div className="w-px bg-gray-300 mx-1"></div>

            {/* Shape controls */}
            <button
              onClick={() => handleTableShapeChange(table._id, 'round')}
              className={`w-6 h-6 rounded flex items-center justify-center transition ${
                shape === 'round' ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
              title="עגול"
            >
              <div className={`w-4 h-4 rounded-full border-2 ${shape === 'round' ? 'border-white' : 'border-gray-500'}`}></div>
            </button>
            <button
              onClick={() => handleTableShapeChange(table._id, 'square')}
              className={`w-6 h-6 rounded flex items-center justify-center transition ${
                shape === 'square' ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
              title="מרובע"
            >
              <div className={`w-4 h-4 rounded-sm border-2 ${shape === 'square' ? 'border-white' : 'border-gray-500'}`}></div>
            </button>
            <button
              onClick={() => handleTableShapeChange(table._id, 'rectangle')}
              className={`w-6 h-6 rounded flex items-center justify-center transition ${
                shape === 'rectangle' ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
              title="מלבני (ארוך)"
            >
              <div className={`w-5 h-3 rounded-sm border-2 ${shape === 'rectangle' ? 'border-white' : 'border-gray-500'}`}></div>
            </button>
          </div>
        )}
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
    <div
      ref={containerRef}
      className={`relative w-full h-full bg-white rounded-xl overflow-hidden flex ${isFullscreen ? 'fullscreen-canvas' : ''}`}
    >
      {/* Main Canvas Area */}
      <div className="flex-1 h-full relative bg-gray-100">
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
          <button
            onClick={toggleFullscreen}
            className="px-3 py-1.5 bg-white shadow rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            title={isFullscreen ? 'יציאה ממסך מלא' : 'מסך מלא'}
          >
            {isFullscreen ? '⛶' : '⛶'}
          </button>
          <button
            onClick={resetLayout}
            className="px-3 py-1.5 bg-white shadow rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            title="איפוס פריסה"
          >
            🔄 איפוס
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
              <span>ריק</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-teal-500"></div>
              <span>חלקי</span>
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
          onClick={() => { setSelectedElement(null); setSelectedTableId(null); }}
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
              width: CANVAS_WIDTH,
              height: CANVAS_HEIGHT,
              minWidth: CANVAS_WIDTH,
              minHeight: CANVAS_HEIGHT,
            }}
          >
            {/* Special Elements (only those on canvas) */}
            {canvasElements.map(element => (
              <div
                key={element.id}
                className={`absolute rounded-lg shadow-lg flex flex-col items-center justify-center transition-all
                  ${draggingElement === element.id ? 'cursor-grabbing opacity-80' : 'cursor-grab'}
                  ${selectedElement === element.id ? 'ring-4 ring-yellow-400 ring-offset-2' : ''}
                  ${element.type === 'danceFloor' ? 'bg-gradient-to-br from-pink-500 to-purple-600 border-4 border-pink-400' : ''}
                  ${element.type === 'bar' ? 'bg-gradient-to-br from-amber-500 to-orange-600 border-4 border-amber-400' : ''}
                  ${element.type === 'stage' ? 'bg-gradient-to-br from-indigo-500 to-blue-600 border-4 border-indigo-400' : ''}
                  ${element.type === 'chuppah' ? 'bg-gradient-to-br from-rose-400 to-pink-500 border-4 border-rose-300' : ''}
                  ${element.type === 'dj' ? 'bg-gradient-to-br from-violet-500 to-purple-600 border-4 border-violet-400' : ''}
                  ${element.type === 'restrooms' ? 'bg-gradient-to-br from-slate-400 to-gray-500 border-4 border-slate-300' : ''}
                  ${element.type === 'photo' ? 'bg-gradient-to-br from-cyan-400 to-teal-500 border-4 border-cyan-300' : ''}
                  ${element.type === 'gifts' ? 'bg-gradient-to-br from-emerald-400 to-green-500 border-4 border-emerald-300' : ''}
                  ${element.type === 'entrance' ? 'bg-gradient-to-br from-gray-500 to-gray-600 border-4 border-gray-400' : ''}
                `}
                style={{
                  left: element.x,
                  top: element.y,
                  width: element.width,
                  height: element.height,
                  zIndex: draggingElement === element.id ? 100 : selectedElement === element.id ? 20 : 10,
                }}
                onMouseDown={(e) => handleElementMouseDown(e, element.id)}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!draggingElement) {
                    setSelectedElement(element.id);
                  }
                }}
              >
                <span className="text-2xl">{element.icon}</span>
                <div className="text-white font-medium text-xs mt-1 text-center px-1">{element.name}</div>

                {/* Element controls when selected */}
                {selectedElement === element.id && (
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex gap-1 bg-white rounded-lg shadow-lg p-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); resizeElement(element.id, -10); }}
                      className="w-7 h-7 rounded bg-gray-100 hover:bg-gray-200 text-sm font-bold"
                      title="הקטן"
                    >
                      -
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); resizeElement(element.id, 10); }}
                      className="w-7 h-7 rounded bg-gray-100 hover:bg-gray-200 text-sm font-bold"
                      title="הגדל"
                    >
                      +
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); moveElementToSidebar(element.id); }}
                      className="w-7 h-7 rounded bg-orange-100 hover:bg-orange-200 text-sm"
                      title="הסר מהקנבס"
                    >
                      📤
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Tables */}
            {tables.map(renderTable)}
          </div>
        </div>

        {/* Instructions */}
        <div className="absolute bottom-3 left-3 z-30 bg-white/90 shadow rounded-lg px-3 py-2 text-xs text-gray-600">
          <span className="font-medium">טיפ:</span> גרור שולחנות למיקום הרצוי | לחץ על אלמנט לעריכה
        </div>
      </div>

      {/* Sidebar Panel */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-bold text-gray-800">🎨 אלמנטים</h3>
          <p className="text-xs text-gray-500 mt-1">גרור או לחץ להוספה לאולם</p>
        </div>

        {/* Available Elements */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="text-xs font-medium text-gray-500 mb-2">הוסף לאולם:</div>
          <div className="grid grid-cols-2 gap-2">
            {AVAILABLE_ELEMENTS.map((el) => (
              <button
                key={el.type}
                onClick={() => addElementToCanvas(el.type)}
                className="flex flex-col items-center justify-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition group"
              >
                <span className="text-2xl group-hover:scale-110 transition">{el.icon}</span>
                <span className="text-xs text-gray-600 mt-1">{el.name}</span>
              </button>
            ))}
          </div>

          {/* Elements in Sidebar (removed from canvas) */}
          {sidebarElements.length > 0 && (
            <>
              <div className="text-xs font-medium text-gray-500 mt-4 mb-2">מחוץ לאולם:</div>
              <div className="space-y-2">
                {sidebarElements.map((el) => (
                  <div
                    key={el.id}
                    className="flex items-center justify-between p-2 bg-orange-50 rounded-lg border border-orange-200"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{el.icon}</span>
                      <span className="text-sm text-gray-700">{el.name}</span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => moveElementToCanvas(el.id)}
                        className="p-1.5 bg-green-100 hover:bg-green-200 rounded text-xs"
                        title="החזר לאולם"
                      >
                        📥
                      </button>
                      <button
                        onClick={() => deleteElement(el.id)}
                        className="p-1.5 bg-red-100 hover:bg-red-200 rounded text-xs"
                        title="מחק"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-500">
            <div className="flex justify-between">
              <span>שולחנות באולם:</span>
              <span className="font-medium text-gray-700">{tables.length}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span>אלמנטים באולם:</span>
              <span className="font-medium text-gray-700">{canvasElements.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
