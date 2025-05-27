"use client";

import React, { useRef, useState } from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function DraggableScrollContainer({
  children,
  className = "",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const onMouseDown = (e: React.MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;
    setIsDragging(true);
    setStartX(e.pageX - container.offsetLeft);
    setScrollLeft(container.scrollLeft);
  };

  const onMouseLeave = () => setIsDragging(false);
  const onMouseUp = () => setIsDragging(false);

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const container = containerRef.current;
    if (!container) return;
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX) * 1; // Multiplier adjusts scroll speed
    container.scrollLeft = scrollLeft - walk;
  };

  return (
    <div
      ref={containerRef}
      className={`overflow-x-auto whitespace-nowrap cursor-grab ${className}`}
      onMouseDown={onMouseDown}
      onMouseLeave={onMouseLeave}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
      style={{ userSelect: isDragging ? "none" : "auto" }}
    >
      {children}
    </div>
  );
}
