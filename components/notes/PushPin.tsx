import React from "react";

export type PinColor =
  | "coral"
  | "blue"
  | "amber"
  | "emerald"
  | "purple"
  | "cyan"
  | "violet"
  | "rose"
  | "indigo";

interface PushPinProps {
  color?: PinColor;
  className?: string;
  size?: number;
}

const PIN_PALETTES: Record<
  PinColor,
  {
    main: string;
    light: string;
    dark: string;
    glow: string;
    rim: string;
  }
> = {
  coral: {
    main: "#EA580C",
    light: "#FED7AA",
    dark: "#9A3412",
    glow: "rgba(234, 88, 12, 0.4)",
    rim: "#C2410C",
  },
  blue: {
    main: "#2563EB",
    light: "#BFDBFE",
    dark: "#1E40AF",
    glow: "rgba(37, 99, 235, 0.4)",
    rim: "#1D4ED8",
  },
  amber: {
    main: "#D97706",
    light: "#FDE68A",
    dark: "#92400E",
    glow: "rgba(217, 119, 6, 0.4)",
    rim: "#B45309",
  },
  emerald: {
    main: "#059669",
    light: "#A7F3D0",
    dark: "#065F46",
    glow: "rgba(5, 150, 105, 0.4)",
    rim: "#047857",
  },
  purple: {
    main: "#7C3AED",
    light: "#E9D5FF",
    dark: "#5B21B6",
    glow: "rgba(124, 58, 237, 0.4)",
    rim: "#6D28D9",
  },
  cyan: {
    main: "#0891B2",
    light: "#BAE6FD",
    dark: "#155E75",
    glow: "rgba(8, 145, 178, 0.4)",
    rim: "#0E7490",
  },
  violet: {
    main: "#6D28D9",
    light: "#DDD6FE",
    dark: "#4C1D95",
    glow: "rgba(109, 40, 217, 0.4)",
    rim: "#5B21B6",
  },
  rose: {
    main: "#E11D48",
    light: "#FECDD3",
    dark: "#9F1239",
    glow: "rgba(225, 29, 72, 0.4)",
    rim: "#BE123C",
  },
  indigo: {
    main: "#4F46E5",
    light: "#C7D2FE",
    dark: "#3730A3",
    glow: "rgba(79, 70, 229, 0.4)",
    rim: "#4338CA",
  },
};

export default function PushPin({
  color = "coral",
  className = "",
  size = 36,
}: PushPinProps) {
  const pal = PIN_PALETTES[color] || PIN_PALETTES.coral;
  const filterId = `pin-shadow-${color}`;
  const gradHeadId = `pin-head-${color}`;
  const gradRimId = `pin-rim-${color}`;
  const gradStemId = `pin-stem-${color}`;

  // Pre-compute gradient URL references for JSX compatibility
  const fillHead = `url(#${gradHeadId})`;
  const fillRim = `url(#${gradRimId})`;
  const fillStem = `url(#${gradStemId})`;

  return (
    <div
      className={`inline-block relative select-none pointer-events-none transition-transform duration-300 ${className}`}
      style={{ width: size, height: size * 1.15 }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 60 70"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md overflow-visible"
      >
        <defs>
          {/* Soft directional drop shadow onto the paper */}
          <filter id={filterId} x="-30%" y="-20%" width="170%" height="170%">
            <feDropShadow
              dx="3"
              dy="6"
              stdDeviation="4"
              floodColor="#0F172A"
              floodOpacity="0.22"
            />
          </filter>

          {/* Spherical glossy 3D pin head gradient */}
          <radialGradient
            id={gradHeadId}
            cx="35%"
            cy="35%"
            r="65%"
            fx="30%"
            fy="30%"
          >
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <stop offset="25%" stopColor={pal.light} />
            <stop offset="60%" stopColor={pal.main} />
            <stop offset="100%" stopColor={pal.dark} />
          </radialGradient>

          {/* Lower bevel rim gradient */}
          <linearGradient id={gradRimId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={pal.light} stopOpacity="0.8" />
            <stop offset="50%" stopColor={pal.rim} />
            <stop offset="100%" stopColor={pal.dark} />
          </linearGradient>

          {/* Metallic pin point / entry stem */}
          <linearGradient id={gradStemId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#CBD5E1" />
            <stop offset="50%" stopColor="#F8FAFC" />
            <stop offset="100%" stopColor="#64748B" />
          </linearGradient>
        </defs>

        {/* Soft shadow of pin on the paper surface */}
        <ellipse
          cx="33"
          cy="48"
          rx="14"
          ry="7"
          fill="#0F172A"
          fillOpacity="0.2"
        />

        {/* Metal pin needle tip going into paper */}
        <path
          d="M 28 42 L 30 52 L 32 42 Z"
          fill={fillStem}
          stroke="#475569"
          strokeWidth="0.5"
        />

        {/* Lower circular rim base */}
        <ellipse
          cx="30"
          cy="40"
          rx="12"
          ry="5.5"
          fill={fillRim}
          stroke={pal.dark}
          strokeWidth="0.75"
        />

        {/* Translucent 3D Spherical Head */}
        <circle
          cx="30"
          cy="26"
          r="15"
          fill={fillHead}
          stroke={pal.rim}
          strokeWidth="0.75"
        />

        {/* Primary light specular reflection highlight arc */}
        <ellipse
          cx="24"
          cy="20"
          rx="4.5"
          ry="3"
          transform="rotate(-25 24 20)"
          fill="#FFFFFF"
          fillOpacity="0.75"
        />

        {/* Secondary micro specular dot */}
        <circle cx="33" cy="28" r="1.2" fill="#FFFFFF" fillOpacity="0.45" />
      </svg>
    </div>
  );
}
