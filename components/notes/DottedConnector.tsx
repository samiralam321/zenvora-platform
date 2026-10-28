"use client";

import React from "react";

export default function DottedConnector({ count = 9 }: { count?: number }) {
  // Generate a fluid S-curve path that weaves between alternating left/right positions
  // Left cards are centered around x=28%, Right cards around x=72%
  // Each card row is roughly 340px apart in vertical distance
  const rowHeight = 360;
  const totalHeight = count * rowHeight;

  let pathData = "M 320 180";
  for (let i = 0; i < count - 1; i++) {
    const isCurrentLeft = i % 2 === 0;
    const currentX = isCurrentLeft ? 320 : 780;
    const nextX = isCurrentLeft ? 780 : 320;
    const currentY = i * rowHeight + 180;
    const nextY = (i + 1) * rowHeight + 180;

    // Control points creating smooth curved bends between left and right cards
    const cp1X = isCurrentLeft ? 600 : 500;
    const cp1Y = currentY + 70;
    const cp2X = isCurrentLeft ? 500 : 600;
    const cp2Y = nextY - 70;

    pathData += ` C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${nextX} ${nextY}`;
  }

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0 hidden md:block"
      aria-hidden="true"
    >
      <svg
        viewBox={`0 0 1100 ${totalHeight}`}
        preserveAspectRatio="xMidYMin slice"
        className="w-full h-full opacity-40"
      >
        <defs>
          <linearGradient id="connector-line-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#94A3B8" stopOpacity="0.3" />
            <stop offset="15%" stopColor="#64748B" stopOpacity="0.65" />
            <stop offset="85%" stopColor="#64748B" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        <path
          d={pathData}
          fill="none"
          stroke="url(#connector-line-grad)"
          strokeWidth="2.5"
          strokeDasharray="7 9"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
