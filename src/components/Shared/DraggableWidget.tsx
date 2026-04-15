import React, { useState, useEffect, useRef } from 'react';

type DraggableWidgetProps = {
  children: React.ReactNode;
  initialPos?: { x: number; y: number };
  bounds?: 'parent' | 'window';
  id: string;
  safeBottom?: number; // px margin from bottom (e.g. taskbar)
};

export const DraggableWidget = ({ 
  children, 
  initialPos = { x: 20, y: 20 }, 
  bounds = 'window', 
  id,
  safeBottom = 24
}: DraggableWidgetProps) => {
  const [pos, setPos] = useState(() => {
    const saved = localStorage.getItem(`draggable_pos_${id}`);
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        // Validate saved position is still within viewport
        if (parsed.x >= 0 && parsed.y >= 0 && parsed.x < window.innerWidth && parsed.y < window.innerHeight) {
          return parsed;
        }
      } catch (e) {}
    }
    return initialPos;
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const offset = useRef({ x: 0, y: 0 });

  const onPointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.tagName === 'INPUT' || target.closest('button') || target.tagName === 'A' || target.tagName === 'IFRAME') {
      return;
    }
    
    const hasHandles = dragRef.current?.querySelector('.drag-handle');
    if (hasHandles && !target.closest('.drag-handle')) {
        return;
    }

    setIsDragging(true);
    offset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y
    };
    
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    
    let newX = e.clientX - offset.current.x;
    let newY = e.clientY - offset.current.y;

    if (dragRef.current) {
        const rect = dragRef.current.getBoundingClientRect();
        const maxY = window.innerHeight - rect.height - safeBottom;
        const maxX = window.innerWidth - rect.width - 4;
        
        newX = Math.max(4, Math.min(newX, maxX));
        newY = Math.max(4, Math.min(newY, maxY));
    }

    setPos({ x: newX, y: newY });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
    localStorage.setItem(`draggable_pos_${id}`, JSON.stringify(pos));
  };

  return (
    <div
      ref={dragRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        cursor: isDragging ? 'grabbing' : 'default',
        zIndex: isDragging ? 9999 : 1000,
        touchAction: 'none',
        userSelect: 'none'
      }}
    >
      {children}
    </div>
  );
};
