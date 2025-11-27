'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface ImagePositionEditorProps {
  imageUrl: string;
  position: { x: number; y: number };
  onPositionChange: (position: { x: number; y: number }) => void;
}

export default function ImagePositionEditor({
  imageUrl,
  position,
  onPositionChange,
}: ImagePositionEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState(position);

  // Handle mouse/touch start
  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    setIsDragging(true);
    setDragStart({ x: clientX, y: clientY });
    setStartPosition(position);
  }, [position]);

  // Handle mouse/touch move
  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging || !containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();

    // Calculate movement as percentage of container
    const deltaX = ((clientX - dragStart.x) / rect.width) * 100;
    const deltaY = ((clientY - dragStart.y) / rect.height) * 100;

    // Invert the delta since we're moving the view, not the image
    // Moving down reveals the top of the image (lower y value)
    const newX = Math.max(0, Math.min(100, startPosition.x - deltaX));
    const newY = Math.max(0, Math.min(100, startPosition.y - deltaY));

    onPositionChange({ x: newX, y: newY });
  }, [isDragging, dragStart, startPosition, onPositionChange]);

  // Handle mouse/touch end
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX, e.clientY);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    handleDragMove(e.clientX, e.clientY);
  }, [handleDragMove]);

  const handleMouseUp = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      handleDragStart(touch.clientX, touch.clientY);
    }
  };

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      handleDragMove(touch.clientX, touch.clientY);
    }
  }, [handleDragMove]);

  const handleTouchEnd = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);

  // Add/remove global event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // Prevent scrolling when touching the editor
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const preventScroll = (e: TouchEvent) => {
      if (isDragging) {
        e.preventDefault();
      }
    };

    container.addEventListener('touchmove', preventScroll, { passive: false });
    return () => {
      container.removeEventListener('touchmove', preventScroll);
    };
  }, [isDragging]);

  const resetPosition = () => {
    onPositionChange({ x: 50, y: 50 });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          התאמת מיקום התמונה
        </label>
        <button
          type="button"
          onClick={resetPosition}
          className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
        >
          איפוס למרכז
        </button>
      </div>

      <p className="text-xs text-gray-500">
        גררו את התמונה כדי לבחור איזה חלק יוצג בהזמנה
      </p>

      {/* Preview container with fixed aspect ratio (like the invitation) */}
      <div
        ref={containerRef}
        className={`relative w-full aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden border-2 transition-colors ${
          isDragging ? 'border-blue-500 cursor-grabbing' : 'border-gray-300 cursor-grab'
        }`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <img
          src={imageUrl}
          alt="תצוגה מקדימה"
          className="absolute w-full h-full object-cover select-none pointer-events-none"
          style={{
            objectPosition: `${position.x}% ${position.y}%`,
          }}
          draggable={false}
        />

        {/* Overlay with instructions */}
        <div className={`absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity ${
          isDragging ? 'opacity-0' : 'opacity-100 hover:opacity-0'
        }`}>
          <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
            <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              גררו להזזת התמונה
            </span>
          </div>
        </div>

        {/* Corner indicators */}
        <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-white/70 rounded-tl pointer-events-none" />
        <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-white/70 rounded-tr pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-white/70 rounded-bl pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-white/70 rounded-br pointer-events-none" />
      </div>

      {/* Position indicator */}
      <div className="flex justify-center">
        <span className="text-xs text-gray-400">
          מיקום: {Math.round(position.x)}% רוחב, {Math.round(position.y)}% גובה
        </span>
      </div>
    </div>
  );
}
