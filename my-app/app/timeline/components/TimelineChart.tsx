'use client';
import { useRef, useState, useLayoutEffect } from 'react';
import type { WorkSession } from '@/lib/sessions';
import { formatDate, getTimelineRange, getPositionOnTimeline } from './utils';
import SessionPoint from './SessionPoint';
import SessionTooltip from './SessionTooltip';

type Props = {
  sessions: WorkSession[];
};

type TooltipPosition = {
  x: number;
  y: number;
  alignLeft: boolean;
};

export default function TimelineChart({ sessions }: Props) {
  const [hoveredSession, setHoveredSession] = useState<WorkSession | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleSessionHover = (session: WorkSession, event: React.MouseEvent) => {
    setHoveredSession(session);
    // Position will be calculated in useLayoutEffect after tooltip is rendered
    if (timelineRef.current) {
      const rect = timelineRef.current.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      
      setTooltipPosition({
        x: mouseX,
        y: mouseY,
        alignLeft: mouseX > rect.width / 2,
      });
    }
  };

  // Adjust tooltip position to ensure it stays within viewport
  useLayoutEffect(() => {
    if (hoveredSession && tooltipPosition && timelineRef.current && tooltipRef.current) {
      const timelineRect = timelineRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const TOOLTIP_WIDTH = tooltipRect.width || 280; // Fallback to min-width
      const TOOLTIP_HEIGHT = tooltipRect.height || 200; // Approximate height
      const TOOLTIP_OFFSET_Y = 120; // Default offset above cursor
      const EDGE_PADDING = 8; // Padding from viewport edges
      
      let adjustedX = tooltipPosition.x;
      let adjustedY = tooltipPosition.y;
      let alignLeft = tooltipPosition.alignLeft;
      
      // Calculate tooltip's absolute position in viewport
      const tooltipLeftInViewport = timelineRect.left + tooltipPosition.x - (alignLeft ? TOOLTIP_WIDTH : 0);
      const tooltipRightInViewport = timelineRect.left + tooltipPosition.x + (alignLeft ? 0 : TOOLTIP_WIDTH);
      const tooltipTopInViewport = timelineRect.top + tooltipPosition.y - TOOLTIP_OFFSET_Y;
      const tooltipBottomInViewport = timelineRect.top + tooltipPosition.y - TOOLTIP_OFFSET_Y + TOOLTIP_HEIGHT;
      
      // Check if tooltip would go off left edge of viewport
      if (tooltipLeftInViewport < EDGE_PADDING) {
        // Position tooltip to stay within viewport
        adjustedX = Math.max(EDGE_PADDING, TOOLTIP_WIDTH + EDGE_PADDING - timelineRect.left);
        alignLeft = false;
      }
      // Check if tooltip would go off right edge of viewport
      else if (tooltipRightInViewport > viewportWidth - EDGE_PADDING) {
        // Position tooltip to stay within viewport
        const maxRight = viewportWidth - EDGE_PADDING - timelineRect.left;
        adjustedX = Math.max(0, maxRight - TOOLTIP_WIDTH);
        alignLeft = true;
      }
      // Check if tooltip would go off left edge of container
      else if (adjustedX - (alignLeft ? TOOLTIP_WIDTH : 0) < EDGE_PADDING) {
        adjustedX = alignLeft ? TOOLTIP_WIDTH + EDGE_PADDING : EDGE_PADDING;
        alignLeft = false;
      }
      // Check if tooltip would go off right edge of container
      else if (adjustedX + (alignLeft ? 0 : TOOLTIP_WIDTH) > timelineRect.width - EDGE_PADDING) {
        adjustedX = Math.max(0, timelineRect.width - TOOLTIP_WIDTH - EDGE_PADDING);
        alignLeft = true;
      }
      
      // Check if tooltip would go off top edge of viewport
      if (tooltipTopInViewport < EDGE_PADDING) {
        adjustedY = tooltipPosition.y + 20; // Show below cursor instead
      }
      // Check if tooltip would go off bottom edge of viewport
      else if (tooltipBottomInViewport > viewportHeight - EDGE_PADDING) {
        adjustedY = timelineRect.height - TOOLTIP_HEIGHT - EDGE_PADDING;
      }
      
      // Only update if position actually changed to prevent infinite loops
      const needsUpdate = 
        Math.abs(adjustedX - tooltipPosition.x) > 1 ||
        Math.abs(adjustedY - tooltipPosition.y) > 1 ||
        alignLeft !== tooltipPosition.alignLeft;
      
      if (needsUpdate) {
        setTooltipPosition({
          x: adjustedX,
          y: adjustedY,
          alignLeft,
        });
      }
    }
  }, [hoveredSession, tooltipPosition]);

  const handleSessionLeave = () => {
    setHoveredSession(null);
    setTooltipPosition(null);
  };

  const timelineRange = getTimelineRange(sessions);

  return (
    <div className="relative bg-white rounded-lg border border-gray-200 shadow-sm p-8">
      <div
        ref={timelineRef}
        className="relative w-full h-64"
        onMouseLeave={handleSessionLeave}
      >
        {/* Timeline axis */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-300 transform -translate-y-1/2" />
        
        {/* Date labels */}
        <div className="absolute top-0 left-0 right-0 flex justify-between text-xs text-gray-400 mb-2">
          <span>{formatDate(new Date(timelineRange.min).toISOString())}</span>
          <span>{formatDate(new Date(timelineRange.max).toISOString())}</span>
        </div>

        {/* Session points */}
        {sessions.map((session) => {
          const position = getPositionOnTimeline(session.startedAtISO, sessions);
          
          return (
            <SessionPoint
              key={session.id}
              session={session}
              position={position}
              onMouseEnter={handleSessionHover}
              onMouseMove={handleSessionHover}
              onMouseLeave={handleSessionLeave}
            />
          );
        })}

        {/* Hover tooltip */}
        {hoveredSession && tooltipPosition && (
          <SessionTooltip 
            ref={tooltipRef}
            session={hoveredSession} 
            position={tooltipPosition} 
          />
        )}
      </div>
    </div>
  );
}

