"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Search, BookOpen, ArrowRight } from "lucide-react";
import { DomainNotes, NOTES_DOMAINS } from "@/lib/notesData";

// â”€â”€ 3D Pushpin Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function CSSPushPin({ color = "#EA580C" }: { color: string }) {
  const light = blendWithWhite(color, 0.55);
  const dark = darken(color, 0.35);

  return (
    <div
      className="relative select-none pointer-events-none drop-shadow-sm"
      style={{ width: 28, height: 32 }}
      aria-hidden="true"
    >
      {/* Contact shadow on paper */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "50%",
          transform: "translateX(-40%)",
          width: 18,
          height: 6,
          borderRadius: "50%",
          background: "rgba(15, 23, 42, 0.18)",
          filter: "blur(2px)",
        }}
      />
      {/* Metal needle / stem going into paper */}
      <div
        style={{
          position: "absolute",
          bottom: 4,
          left: "50%",
          transform: "translateX(-50%)",
          width: 5,
          height: 9,
          borderRadius: "2px 2px 0 0",
          background: "linear-gradient(to right, #64748B, #F1F5F9, #475569)",
        }}
      />
      {/* Lower rim base */}
      <div
        style={{
          position: "absolute",
          bottom: 11,
          left: "50%",
          transform: "translateX(-50%)",
          width: 15,
          height: 5,
          borderRadius: "50%",
          background: `linear-gradient(to bottom, ${light}, ${dark})`,
          border: `1px solid ${dark}`,
        }}
      />
      {/* Spherical glossy head */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: `radial-gradient(circle at 35% 30%, #ffffff 0%, ${light} 28%, ${color} 65%, ${dark} 100%)`,
          border: `1.5px solid ${dark}`,
          boxShadow: `0 3px 8px rgba(15, 23, 42, 0.25), inset 0 1px 2px rgba(255, 255, 255, 0.6)`,
        }}
      >
        {/* Specular gloss highlight */}
        <div
          style={{
            position: "absolute",
            top: 3.5,
            left: 3.5,
            width: 6,
            height: 4,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.85)",
            transform: "rotate(-25deg)",
          }}
        />
      </div>
    </div>
  );
}

// â”€â”€ Color helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const r = parseInt(full.slice(0, 2), 16) || 0;
  const g = parseInt(full.slice(2, 4), 16) || 0;
  const b = parseInt(full.slice(4, 6), 16) || 0;
  return { r, g, b };
}
function blendWithWhite(hex: string, t: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(${Math.round(r + (255 - r) * t)},${Math.round(g + (255 - g) * t)},${Math.round(b + (255 - b) * t)})`;
}
function darken(hex: string, t: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(${Math.round(r * (1 - t))},${Math.round(g * (1 - t))},${Math.round(b * (1 - t))})`;
}

// â”€â”€ Card Icon Map â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const ICON_CHARS: Record<string, string> = {
  Binary: "âŒ¥",
  Code2: "</>",
  Server: "âŠŸ",
  Layers: "â‰¡",
  Cpu: "â–¡",
  Sparkles: "âœ¦",
  Brain: "â—Ž",
  Trophy: "â¬¡",
  Network: "â¬¡",
};

// â”€â”€ Stagger & Subtle Rotation Config for 10 cards â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const CARD_CONFIG = [
  { rotate: -1.6, dy: 0 },    // 0 DSA (01)
  { rotate: 1.5, dy: -5 },    // 1 Web Dev (02)
  { rotate: -1.2, dy: 3 },    // 2 Backend (03)
  { rotate: 1.6, dy: -5 },    // 3 Full Stack (04)
  { rotate: -1.4, dy: 2 },    // 4 CS Fundamentals (05)
  { rotate: 1.5, dy: 0 },     // 5 GenAI (06)
  { rotate: -1.4, dy: -4 },   // 6 ML (07)
  { rotate: 1.3, dy: 3 },     // 7 Competitive Programming (08)
  { rotate: -1.5, dy: -4 },   // 8 System Design (09)
  { rotate: 1.4, dy: 3 },     // 9 DevOps & Cloud (10)
];

// â”€â”€ Single Sticky Note Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface StickyCardProps {
  domain: DomainNotes;
  index: number;
  visible: boolean;
  onCardRef: (el: HTMLAnchorElement | null) => void;
}

function StickyCard({ domain, index, visible, onCardRef }: StickyCardProps) {
  const [hovered, setHovered] = useState(false);
  const cfg = CARD_CONFIG[index % CARD_CONFIG.length];
  const iconChar = ICON_CHARS[domain.iconName] || "â—†";

  const rot = hovered ? 0 : cfg.rotate;
  const ty = hovered ? cfg.dy - 8 : cfg.dy;

  const noteCount = (domain as any).notesCount ?? domain.resources?.length ?? 0;

  return (
    <Link
      ref={onCardRef}
      href={`/notes/${domain.slug}`}
      className="group block relative focus:outline-none focus-visible:ring-4 focus-visible:ring-[#1D64EC]/30 rounded-2xl transition-all duration-300 w-full"
      aria-label={`Explore ${domain.name}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0px)" : "translateY(20px)",
        transition: `opacity 0.45s ease ${index * 40}ms, transform 0.45s ease ${index * 40}ms`,
        willChange: "transform, opacity",
      }}
    >
      {/* 3D Pushpin on top center edge */}
      <div
        className="absolute -top-3.5 left-1/2 z-30 transition-transform duration-300 group-hover:scale-110"
        style={{ transform: "translateX(-50%)" }}
      >
        <CSSPushPin color={domain.accentColor} />
      </div>

      {/* Outer White Paper Note */}
      <div
        className="relative bg-white rounded-2xl p-3 border border-slate-200/90 transition-all duration-300 h-full flex flex-col justify-between"
        style={{
          transform: `rotate(${rot}deg) translateY(${ty}px)`,
          boxShadow: hovered
            ? "0 20px 35px -10px rgba(15, 23, 42, 0.15), 0 8px 16px -4px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(29, 100, 236, 0.12)"
            : "0 8px 24px -6px rgba(15, 23, 42, 0.09), 0 3px 8px -2px rgba(15, 23, 42, 0.04), 0 0 0 1px rgba(226, 232, 240, 0.75)",
          transition: "transform 260ms cubic-bezier(0.34, 1.45, 0.64, 1), box-shadow 260ms ease",
        }}
      >
        {/* Inner Pastel Surface */}
        <div
          className="rounded-xl p-3.5 sm:p-4 flex flex-col justify-between h-full"
          style={{
            backgroundColor: domain.pastelBg || "#EEF4FF",
            border: `1px solid ${domain.pastelBorder || "#BFDBFE"}`,
            minHeight: 215,
          }}
        >
          {/* Top row: Number + Domain Icon */}
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-xl sm:text-2xl font-black tracking-tight"
              style={{ color: domain.accentColor }}
            >
              {domain.number}
            </span>
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-xs sm:text-sm font-bold shadow-2xs transition-transform duration-300 group-hover:scale-110"
              style={{
                backgroundColor: domain.badgeBg || "#DBEAFE",
                color: domain.badgeText || "#1E40AF",
              }}
            >
              {iconChar}
            </div>
          </div>

          {/* Title & Description */}
          <div className="flex-1 mb-2.5">
            <h3 className="text-sm sm:text-[15px] font-bold text-slate-900 leading-snug mb-1 group-hover:text-[#1D64EC] transition-colors line-clamp-1">
              {domain.shortName}
            </h3>
            <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
              {domain.description}
            </p>
          </div>

          {/* Card Footer */}
          <div className="pt-2 border-t border-black/[0.06] flex items-center justify-between mt-auto">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              {noteCount > 0 ? `${noteCount} notes` : "coming soon"}
            </span>
            <div
              className="inline-flex items-center gap-1 text-[11px] font-bold transition-all"
              style={{ color: domain.accentColor }}
            >
              <span>Explore</span>
              <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}


// â”€â”€ Main NotesLandingClient Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function NotesLandingClient({
  dbDomains,
}: {
  dbDomains?: Array<{
    id: string;
    name: string;
    slug: string;
    description: string;
    iconName: string | null;
    accentColor: string | null;
    pastelBg: string | null;
    pastelBorder: string | null;
    badgeBg: string | null;
    badgeText: string | null;
    isPublished: boolean;
    _count?: { notes: number };
  }>;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  // Merge database domains with static visual metadata
  const baseDomains: DomainNotes[] = useMemo(() => {
    if (dbDomains && dbDomains.length > 0) {
      return dbDomains
        .filter((d) => d.isPublished)
        .map((d, i) => {
          const staticMatch = NOTES_DOMAINS.find((s) => s.slug === d.slug);
          const realNoteCount =
            d._count?.notes !== undefined && d._count.notes > 0
              ? d._count.notes
              : (staticMatch?.resources?.length ?? 0);

          if (staticMatch) {
            return {
              ...staticMatch,
              name: d.name,
              shortName: d.name.replace(/ Notes$/i, " Notes"),
              description: d.description,
              resources: staticMatch.resources,
              notesCount: realNoteCount,
            } as any;
          }

          const cfg = NOTES_DOMAINS[i % NOTES_DOMAINS.length];
          return {
            ...cfg,
            id: d.id,
            slug: d.slug,
            name: d.name,
            shortName: d.name,
            description: d.description,
            resources: [],
            notesCount: realNoteCount,
          } as any;
        });
    }
    return NOTES_DOMAINS;
  }, [dbDomains]);

  // Filter based on search input
  const filteredDomains = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return baseDomains;
    return baseDomains.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.topics?.some?.((t) => t.toLowerCase().includes(q))
    );
  }, [searchQuery, baseDomains]);

  const isSearchActive = !!searchQuery.trim();

  // Row 1: Cards 01â€“05
  const row1Domains = useMemo(() => {
    if (isSearchActive) return filteredDomains;
    return filteredDomains.slice(0, 5);
  }, [filteredDomains, isSearchActive]);

  // Row 2: Cards 06â€“10
  const row2Domains = useMemo(() => {
    if (isSearchActive) return [];
    return filteredDomains.slice(5, 10);
  }, [filteredDomains, isSearchActive]);

  return (
    <div className="relative min-h-screen bg-[#FDFCFB] overflow-x-hidden">
      {/* Subtle dot background texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.22]"
        style={{
          backgroundImage: "radial-gradient(circle, #CBD5E1 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden="true"
      />

      {/* Ambient gradient glow */}
      <div
        className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at top right, rgba(29, 100, 236, 0.05) 0%, transparent 65%)",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute top-28 left-0 w-[450px] h-[450px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at top left, rgba(239, 201, 255, 0.12) 0%, transparent 60%)",
        }}
        aria-hidden="true"
      />

      {/* â”€â”€ STANDARD CENTERED CONTAINER â”€â”€ */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">

        {/* â”€â”€ Hero Section â”€â”€ */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          {/* Breadcrumb */}
          <nav className="text-xs text-slate-400 mb-4 font-medium flex items-center justify-center gap-1.5">
            <Link href="/" className="hover:text-slate-600 transition">Home</Link>
            <span>â€º</span>
            <span className="text-slate-600 font-semibold">Notes</span>
          </nav>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EEF4FF] border border-blue-200/80 text-[#1D64EC] text-xs font-bold mb-4 shadow-2xs">
            <span className="text-[#1D64EC]">âœ¨</span>
            <span className="uppercase tracking-wider">YOUR LEARNING LIBRARY</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-black text-slate-900 tracking-tight leading-[1.15] mb-4">
            Your Notes. Your{" "}
            <span className="text-[#1D64EC]">Learning Journey.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-600 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl mx-auto mb-8 font-normal">
            Explore carefully organized notes, handwritten PDFs, cheat sheets, and study resources across your favorite tech domains. Read online or download anytime.
          </p>

          {/* Centered Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes, subjects, or topics (e.g. Arrays, React, System Design)..."
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm shadow-2xs focus:outline-none focus:border-[#1D64EC] focus:ring-4 focus:ring-[#1D64EC]/10 transition-all placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 text-xs font-semibold text-slate-400 hover:text-slate-700 p-1"
                >
                  Clear
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="text-xs text-slate-500 mt-2 text-left px-1">
                Found {filteredDomains.length} domain(s) matching &ldquo;{searchQuery}&rdquo;
              </p>
            )}
          </div>
        </div>

        {/* â”€â”€ DOMAIN CARDS â”€â”€ */}
        {filteredDomains.length === 0 ? (
          <div className="text-center py-20 bg-slate-50/70 rounded-2xl border border-slate-200/80 p-8 max-w-md mx-auto">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 mb-1">No matching notes found</h3>
            <p className="text-xs text-slate-500 mb-4">
              We couldn&apos;t find any domains or notes matching &ldquo;{searchQuery}&rdquo;. Try another keyword.
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="btn-primary text-xs font-semibold px-4 py-2"
            >
              Reset Search
            </button>
          </div>
        ) : (
          <div className="space-y-10 sm:space-y-14 pt-4">
            {/* Row 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
              {row1Domains.map((domain, i) => (
                <StickyCard
                  key={domain.id}
                  domain={domain}
                  index={i}
                  visible={visible}
                  onCardRef={() => {}}
                />
              ))}
            </div>

            {/* Row 2 */}
            {row2Domains.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
                {row2Domains.map((domain, i) => (
                  <StickyCard
                    key={domain.id}
                    domain={domain}
                    index={5 + i}
                    visible={visible}
                    onCardRef={() => {}}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
