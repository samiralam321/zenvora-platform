"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Binary,
  Code2,
  Server,
  Layers,
  Cpu,
  Sparkles,
  Brain,
  Trophy,
  Network,
  FileText,
} from "lucide-react";
import PushPin from "./PushPin";
import { DomainNotes } from "@/lib/notesData";

// Icon mapping
const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Binary,
  Code2,
  Server,
  Layers,
  Cpu,
  Sparkles,
  Brain,
  Trophy,
  Network,
};

interface PinnedDomainCardProps {
  domain: DomainNotes;
  index: number;
}

export default function PinnedDomainCard({ domain, index }: PinnedDomainCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const IconComponent = ICONS[domain.iconName] || FileText;

  // Alternating alignment: Even index (0, 2, 4...) on the left, Odd index (1, 3, 5...) on the right
  const isLeft = index % 2 === 0;

  // Use natural rotation: eases to 0 on hover
  const currentRotation = isHovered ? 0 : domain.rotationDeg;
  const currentTranslateY = isHovered ? -8 : 0;

  return (
    <div
      className={`relative w-full flex ${
        isLeft ? "justify-start md:pl-6 lg:pl-12" : "justify-end md:pr-6 lg:pr-12"
      } my-6 md:my-8 z-10`}
    >
      <Link
        href={`/notes/${domain.slug}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group block relative w-full max-w-[420px] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#1D64EC]/30 rounded-3xl"
        aria-label={`Explore ${domain.name}`}
      >
        {/* ── 3D Pushpin positioned at top center ── */}
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-30 transition-transform duration-300 group-hover:scale-105">
          <PushPin color={domain.pinColor} size={38} />
        </div>

        {/* ── Outer White Paper Sheet ── */}
        <div
          className="relative bg-white rounded-3xl p-4 sm:p-5 transition-all duration-300 ease-out border border-slate-200/80"
          style={{
            transform: `rotate(${currentRotation}deg) translateY(${currentTranslateY}px)`,
            boxShadow: isHovered
              ? "0 20px 35px -10px rgba(15, 23, 42, 0.12), 0 10px 15px -5px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(226, 232, 240, 0.8)"
              : "0 10px 25px -8px rgba(15, 23, 42, 0.08), 0 4px 8px -2px rgba(15, 23, 42, 0.04), 0 0 0 1px rgba(226, 232, 240, 0.6)",
          }}
        >
          {/* Subtle paper grain / soft inner border */}
          <div
            className="rounded-2xl p-5 sm:p-6 transition-colors duration-200 flex flex-col justify-between min-h-[220px]"
            style={{
              backgroundColor: domain.pastelBg,
              border: `1px solid ${domain.pastelBorder}`,
            }}
          >
            {/* Top row: Number badge + Domain icon */}
            <div className="flex items-center justify-between mb-4">
              <span
                className="text-2xl sm:text-3xl font-extrabold tracking-tight"
                style={{ color: domain.accentColor }}
              >
                {domain.number}
              </span>

              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-xs transition-transform duration-300 group-hover:scale-110"
                style={{
                  backgroundColor: domain.badgeBg,
                  color: domain.badgeText,
                }}
              >
                <IconComponent className="w-5 h-5" />
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-1.5 mb-5">
              <h3 className="text-xl sm:text-[22px] font-bold text-slate-900 tracking-tight leading-snug group-hover:text-[#1D64EC] transition-colors">
                {domain.shortName}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                {domain.description}
              </p>
            </div>

            {/* Bottom link: Explore Notes with sliding arrow */}
            <div className="pt-3 border-t border-slate-900/5 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                {domain.resources.length} Curated Notes
              </span>

              <div
                className="inline-flex items-center gap-1.5 text-xs font-bold transition-all"
                style={{ color: domain.accentColor }}
              >
                <span>Explore Notes</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1.5" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
