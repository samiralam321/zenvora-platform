"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, BookOpen, Sparkles, ArrowRight } from "lucide-react";
import { DomainNotes, NOTES_DOMAINS } from "@/lib/notesData";

// ── CSS Pushpin Component (pure CSS, no SVG gradient issues) ──────────────
function CSSPushPin({ color = "#EA580C" }: { color: string }) {
  const light = blendWithWhite(color, 0.5);
  const dark = darken(color, 0.3);
  return (
    <div
      className="relative select-none pointer-events-none"
      style={{ width: 26, height: 30 }}
      aria-hidden="true"
    >
      {/* Shadow cast on paper */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: 18,
          height: 5,
          borderRadius: "50%",
          background: "rgba(0,0,0,0.15)",
          filter: "blur(2px)",
        }}
      />
      {/* Stem / neck */}
      <div
        style={{
          position: "absolute",
          bottom: 5,
          left: "50%",
          transform: "translateX(-50%)",
          width: 5,
          height: 8,
          borderRadius: "2px 2px 0 0",
          background: `linear-gradient(to right, ${dark}, ${color}, ${dark})`,
        }}
      />
      {/* Rim ring */}
      <div
        style={{
          position: "absolute",
          bottom: 11,
          left: "50%",
          transform: "translateX(-50%)",
          width: 14,
          height: 5,
          borderRadius: "50%",
          background: `linear-gradient(to bottom, ${light}, ${dark})`,
          border: `1px solid ${dark}`,
        }}
      />
      {/* Spherical head */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: `radial-gradient(circle at 35% 30%, #fff 0%, ${light} 25%, ${color} 65%, ${dark} 100%)`,
          border: `1.5px solid ${dark}`,
          boxShadow: `0 3px 8px rgba(0,0,0,0.25), inset 0 1px 2px rgba(255,255,255,0.5)`,
        }}
      >
        {/* Specular highlight */}
        <div
          style={{
            position: "absolute",
            top: 4,
            left: 4,
            width: 6,
            height: 4,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.75)",
            transform: "rotate(-25deg)",
          }}
        />
      </div>
    </div>
  );
}

// ── colour helpers ─────────────────────────────────────────────────────────
function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
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

// ── Icon map ───────────────────────────────────────────────────────────────
const ICON_CHARS: Record<string, string> = {
  Binary: "⌥",
  Code2: "</>",
  Server: "⊟",
  Layers: "≡",
  Cpu: "□",
  Sparkles: "✦",
  Brain: "◎",
  Trophy: "⬡",
  Network: "⬡",
};

// ── Per-card layout config ─────────────────────────────────────────────────
// Row 1: indices 0-4  |  Row 2: indices 5-8
const CARD_CONFIG = [
  { rotate: -2.5, dy: 0 },    // 0 DSA
  { rotate: 1.8, dy: -14 },   // 1 Web Dev
  { rotate: -1.5, dy: 8 },    // 2 Backend
  { rotate: 2.2, dy: -10 },   // 3 Full Stack
  { rotate: -2.0, dy: 5 },    // 4 CS Fundamentals
  { rotate: 1.5, dy: 12 },    // 5 GenAI
  { rotate: -2.8, dy: -8 },   // 6 ML
  { rotate: 2.0, dy: 6 },     // 7 Competitive Prog
  { rotate: -1.2, dy: -14 },  // 8 System Design
];

// ── Single horizontal sticky card ─────────────────────────────────────────
function StickyCard({
  domain,
  index,
  visible,
}: {
  domain: DomainNotes;
  index: number;
  visible: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const cfg = CARD_CONFIG[index % CARD_CONFIG.length];
  const iconChar = ICON_CHARS[domain.iconName] || "◆";

  const rot = hovered ? 0 : cfg.rotate;
  const ty = hovered ? cfg.dy - 8 : cfg.dy;

  return (
    <Link
      href={`/notes/${domain.slug}`}
      className="group block relative focus:outline-none focus-visible:ring-4 focus-visible:ring-[#1D64EC]/30 rounded-3xl"
      aria-label={`Explore ${domain.name}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        /* entrance animation */
        opacity: visible ? 1 : 0,
        transform: visible
          ? `translateY(0px)`
          : `translateY(24px)`,
        transition: `opacity 0.5s ease ${index * 60}ms, transform 0.5s ease ${index * 60}ms`,
        /* keep each card's own stagger & rotation separate from entrance */
        willChange: "transform, opacity",
        flexShrink: 0,
        width: "clamp(200px, 22%, 260px)",
      }}
    >
      {/* Pushpin */}
      <div
        className="absolute -top-3 left-1/2 z-30 transition-transform duration-300 group-hover:scale-105"
        style={{ transform: `translateX(-50%)` }}
      >
        <CSSPushPin color={domain.accentColor} />
      </div>

      {/* Outer white paper */}
      <div
        className="relative bg-white rounded-2xl p-3 border border-slate-200/80 transition-all duration-300"
        style={{
          transform: `rotate(${rot}deg) translateY(${ty}px)`,
          boxShadow: hovered
            ? "0 22px 40px -10px rgba(15,23,42,0.15), 0 8px 16px -4px rgba(15,23,42,0.08)"
            : "0 8px 24px -6px rgba(15,23,42,0.1), 0 3px 8px -2px rgba(15,23,42,0.05)",
          transition: "transform 280ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 280ms ease",
        }}
      >
        {/* Inner pastel panel */}
        <div
          className="rounded-xl p-4 flex flex-col gap-3"
          style={{
            backgroundColor: domain.pastelBg,
            border: `1px solid ${domain.pastelBorder}`,
            minHeight: 200,
          }}
        >
          {/* Top row: number + icon */}
          <div className="flex items-center justify-between">
            <span
              className="text-xl font-extrabold tracking-tight"
              style={{ color: domain.accentColor }}
            >
              {domain.number}
            </span>
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-transform duration-300 group-hover:scale-110"
              style={{
                backgroundColor: domain.badgeBg,
                color: domain.badgeText,
              }}
            >
              {iconChar}
            </div>
          </div>

          {/* Title + description */}
          <div className="flex-1">
            <h3 className="text-base font-bold text-slate-900 leading-snug mb-1.5 group-hover:text-[#1D64EC] transition-colors">
              {domain.shortName}
            </h3>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              {domain.description}
            </p>
          </div>

          {/* Footer */}
          <div className="pt-2.5 border-t border-black/[0.06] flex items-center justify-between mt-auto">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              {((domain as any).notesCount ?? domain.resources?.length ?? 0) > 0
                ? `${(domain as any).notesCount ?? domain.resources.length} curated notes`
                : "coming soon"}
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

// ── SVG Horizontal Connector ───────────────────────────────────────────────
function HorizontalConnector() {
  return (
    <svg
      viewBox="0 0 1200 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 w-full h-full pointer-events-none"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {/* Row 1 → Row 2 curve */}
      <path
        d="M 120 80 C 300 80, 200 240, 480 240"
        stroke="#93C5FD"
        strokeWidth="1.8"
        strokeDasharray="6 5"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M 600 60 C 750 60, 650 260, 900 260"
        stroke="#A5B4FC"
        strokeWidth="1.8"
        strokeDasharray="6 5"
        strokeLinecap="round"
        opacity="0.45"
      />
      <path
        d="M 1050 80 C 1150 80, 1100 200, 1050 260"
        stroke="#6EE7B7"
        strokeWidth="1.6"
        strokeDasharray="5 6"
        strokeLinecap="round"
        opacity="0.35"
      />
    </svg>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
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
    isPublished: boolean;
    _count?: { notes: number };
  }>;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Use DB domains if available, otherwise fall back to static data
  const baseDomains: DomainNotes[] = useMemo(() => {
    if (dbDomains && dbDomains.length > 0) {
      return dbDomains
        .filter((d) => d.isPublished)
        .map((d, i) => {
          // Try to match against static data for visual config
          const staticMatch = NOTES_DOMAINS.find((s) => s.slug === d.slug);
          const realNoteCount = d._count?.notes !== undefined && d._count.notes > 0
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
          // Fallback for custom domains
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

  // Split into two rows
  const rowSize = Math.ceil(filteredDomains.length / 2);
  const row1 = filteredDomains.slice(0, rowSize);
  const row2 = filteredDomains.slice(rowSize);

  return (
    <div className="relative min-h-screen bg-[#F8FAFD] overflow-x-hidden">
      {/* Faint dot-grid background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.4]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #CBD5E1 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden="true"
      />
      {/* Ambient gradient blobs */}
      <div
        className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at top right, rgba(239,201,255,0.22) 0%, transparent 65%)",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute top-20 left-0 w-[400px] h-[400px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at top left, rgba(186,230,253,0.2) 0%, transparent 60%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 pt-24 pb-20">

        {/* ── Hero ── */}
        <div className="text-left max-w-2xl mb-8">
          <nav className="text-xs text-slate-400 mb-4 font-medium">
            <span>Home</span>
            <span className="mx-1.5">›</span>
            <span className="text-slate-600">Notes</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-3">
            Student{" "}
            <span className="text-[#1D64EC]">Notes</span>
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6 max-w-xl">
            Access high-quality notes, PDFs, and study material for all
            domains. Read online or download. Learn at your own pace.
          </p>

          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes, subjects, or topics..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm shadow-sm focus:outline-none focus:border-[#1D64EC] focus:ring-4 focus:ring-[#1D64EC]/10 transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="text-xs text-slate-500 mt-2 px-1">
              {filteredDomains.length} domain(s) matching &ldquo;{searchQuery}&rdquo;
            </p>
          )}
        </div>

        {/* ── Sticky Board ── */}
        {filteredDomains.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm max-w-md mx-auto">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 mb-1">
              No notes found
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Try a different search term.
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs font-semibold px-4 py-2 rounded-xl bg-[#1D64EC] text-white hover:bg-[#1a56d4] transition"
            >
              Reset Search
            </button>
          </div>
        ) : (
          <div className="relative">
            {/* SVG curved connectors behind cards */}
            <div
              className="absolute inset-0 z-0 hidden lg:block"
              style={{ minHeight: 360 }}
            >
              <HorizontalConnector />
            </div>

            {/* Row 1 */}
            <div
              className="relative z-10 flex flex-wrap gap-x-5 gap-y-14 justify-start mb-16 pt-6"
            >
              {row1.map((domain, i) => (
                <StickyCard
                  key={domain.id}
                  domain={domain}
                  index={i}
                  visible={visible}
                />
              ))}
            </div>

            {/* Row 2 */}
            {row2.length > 0 && (
              <div
                className="relative z-10 flex flex-wrap gap-x-5 gap-y-14 justify-start pt-2"
              >
                {row2.map((domain, i) => (
                  <StickyCard
                    key={domain.id}
                    domain={domain}
                    index={rowSize + i}
                    visible={visible}
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
