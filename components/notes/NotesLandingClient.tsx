"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Search, BookOpen, ArrowRight, Folder } from "lucide-react";
import { DomainNotes, NOTES_DOMAINS } from "@/lib/notesData";

// ── 3D Pushpin Component ───────────────────────────────────────────────────
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

// ── Color helpers ──────────────────────────────────────────────────────────
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

// ── Card Icon Map ──────────────────────────────────────────────────────────
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

// ── Per-card Stagger & Rotation Config ─────────────────────────────────────
const CARD_CONFIG = [
  { rotate: -2.0, dy: 0 },    // 0 DSA
  { rotate: 1.8, dy: -10 },   // 1 Web Dev
  { rotate: -1.4, dy: 6 },    // 2 Backend
  { rotate: 2.0, dy: -8 },    // 3 Full Stack
  { rotate: -1.8, dy: 4 },    // 4 CS Fundamentals
  { rotate: 1.6, dy: 6 },     // 5 GenAI
  { rotate: -2.2, dy: -6 },   // 6 ML
  { rotate: 1.8, dy: 4 },     // 7 Competitive Programming
  { rotate: -1.2, dy: -8 },   // 8 System Design
];

// ── Single Sticky Note Card ───────────────────────────────────────────────
interface StickyCardProps {
  domain: DomainNotes;
  index: number;
  visible: boolean;
  onCardRef: (el: HTMLAnchorElement | null) => void;
}

function StickyCard({ domain, index, visible, onCardRef }: StickyCardProps) {
  const [hovered, setHovered] = useState(false);
  const cfg = CARD_CONFIG[index % CARD_CONFIG.length];
  const iconChar = ICON_CHARS[domain.iconName] || "◆";

  const rot = hovered ? 0 : cfg.rotate;
  const ty = hovered ? cfg.dy - 8 : cfg.dy;

  const noteCount = (domain as any).notesCount ?? domain.resources?.length ?? 0;

  return (
    <Link
      ref={onCardRef}
      href={`/notes/${domain.slug}`}
      className="group block relative focus:outline-none focus-visible:ring-4 focus-visible:ring-[#1D64EC]/30 rounded-2xl transition-all duration-300"
      aria-label={`Explore ${domain.name}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0px)" : "translateY(20px)",
        transition: `opacity 0.45s ease ${index * 45}ms, transform 0.45s ease ${index * 45}ms`,
        willChange: "transform, opacity",
      }}
    >
      {/* 3D Pushpin on upper center edge */}
      <div
        className="absolute -top-3.5 left-1/2 z-30 transition-transform duration-300 group-hover:scale-110"
        style={{ transform: "translateX(-50%)" }}
      >
        <CSSPushPin color={domain.accentColor} />
      </div>

      {/* Outer White Paper Note */}
      <div
        className="relative bg-white rounded-2xl p-3 border border-slate-200/90 transition-all duration-300"
        style={{
          transform: `rotate(${rot}deg) translateY(${ty}px)`,
          boxShadow: hovered
            ? "0 20px 35px -10px rgba(15, 23, 42, 0.15), 0 8px 16px -4px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(29, 100, 236, 0.1)"
            : "0 8px 24px -6px rgba(15, 23, 42, 0.09), 0 3px 8px -2px rgba(15, 23, 42, 0.04), 0 0 0 1px rgba(226, 232, 240, 0.7)",
          transition: "transform 260ms cubic-bezier(0.34, 1.45, 0.64, 1), box-shadow 260ms ease",
        }}
      >
        {/* Inner Pastel Surface */}
        <div
          className="rounded-xl p-4 flex flex-col justify-between"
          style={{
            backgroundColor: domain.pastelBg || "#EEF4FF",
            border: `1px solid ${domain.pastelBorder || "#BFDBFE"}`,
            minHeight: 205,
          }}
        >
          {/* Top row: Number + Domain Icon */}
          <div className="flex items-center justify-between mb-2.5">
            <span
              className="text-xl sm:text-2xl font-black tracking-tight"
              style={{ color: domain.accentColor }}
            >
              {domain.number}
            </span>
            <div
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-xs sm:text-sm font-bold shadow-2xs transition-transform duration-300 group-hover:scale-110"
              style={{
                backgroundColor: domain.badgeBg || "#DBEAFE",
                color: domain.badgeText || "#1E40AF",
              }}
            >
              {iconChar}
            </div>
          </div>

          {/* Title & Description */}
          <div className="flex-1 mb-3">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug mb-1 group-hover:text-[#1D64EC] transition-colors line-clamp-1">
              {domain.shortName}
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed line-clamp-2">
              {domain.description}
            </p>
          </div>

          {/* Card Footer */}
          <div className="pt-2.5 border-t border-black/[0.06] flex items-center justify-between mt-auto">
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

// ── Dynamic Measured Roadmap Connectors ────────────────────────────────────
interface PathData {
  id: string;
  d: string;
}

function RoadmapConnectors({
  paths,
  svgSize,
}: {
  paths: PathData[];
  svgSize: { width: number; height: number };
}) {
  if (paths.length === 0 || svgSize.width === 0) return null;

  return (
    <svg
      width={svgSize.width}
      height={svgSize.height}
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 hidden md:block"
      style={{ overflow: "visible" }}
      aria-hidden="true"
    >
      <defs>
        <marker
          id="roadmap-arrow"
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto-start-reverse"
        >
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#93C5FD" opacity="0.8" />
        </marker>
      </defs>

      {paths.map((p) => (
        <path
          key={p.id}
          d={p.d}
          stroke="#93C5FD"
          strokeWidth="1.8"
          strokeDasharray="6 5"
          strokeLinecap="round"
          fill="none"
          opacity="0.65"
        />
      ))}
    </svg>
  );
}

// ── Main NotesLandingClient Component ─────────────────────────────────────
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

  const boardRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const [connectorPaths, setConnectorPaths] = useState<PathData[]>([]);
  const [boardSize, setBoardSize] = useState({ width: 0, height: 0 });

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

  // Two thematic rows:
  // Row 1: Core foundations (first 5 cards)
  // Row 2: Advanced tracks (remaining cards)
  const isSearchActive = !!searchQuery.trim();
  const row1 = useMemo(() => {
    if (isSearchActive) return filteredDomains;
    return filteredDomains.slice(0, 5);
  }, [filteredDomains, isSearchActive]);

  const row2 = useMemo(() => {
    if (isSearchActive) return [];
    return filteredDomains.slice(5);
  }, [filteredDomains, isSearchActive]);

  // ── Measure card positions and compute connector lines ───────────────────
  const updateConnectorLines = useCallback(() => {
    const board = boardRef.current;
    if (!board) return;

    const bRect = board.getBoundingClientRect();
    setBoardSize({ width: bRect.width, height: bRect.height });

    // Only compute connectors if not searching and desktop/tablet
    if (isSearchActive || window.innerWidth < 768) {
      setConnectorPaths([]);
      return;
    }

    const anchors: {
      x: number;
      y: number;
      top: number;
      bottom: number;
      left: number;
      right: number;
      width: number;
      height: number;
    }[] = [];

    cardRefs.current.forEach((el) => {
      if (!el) {
        anchors.push(null as any);
        return;
      }
      const eRect = el.getBoundingClientRect();
      anchors.push({
        x: eRect.left - bRect.left + eRect.width / 2,
        y: eRect.top - bRect.top + 20, // near pushpin
        top: eRect.top - bRect.top,
        bottom: eRect.top - bRect.top + eRect.height,
        left: eRect.left - bRect.left,
        right: eRect.left - bRect.left + eRect.width,
        width: eRect.width,
        height: eRect.height,
      });
    });

    const newPaths: PathData[] = [];

    // Helper: Connect two horizontally adjacent cards
    const connectHorizontal = (fromIdx: number, toIdx: number, curveDir: "up" | "down" = "up") => {
      const a = anchors[fromIdx];
      const b = anchors[toIdx];
      if (!a || !b) return;

      // Ensure 'a' is to the left of 'b'
      if (a.left >= b.left) return;

      const startX = a.right - 4;
      const startY = a.top + a.height * 0.38;
      const endX = b.left + 4;
      const endY = b.top + b.height * 0.38;
      const dx = endX - startX;
      const sag = curveDir === "up" ? -14 : 14;

      const d = `M ${startX} ${startY} C ${startX + dx * 0.4} ${startY + sag}, ${endX - dx * 0.4} ${endY + sag}, ${endX} ${endY}`;
      newPaths.push({ id: `h-${fromIdx}-${toIdx}`, d });
    };

    // Helper: Connect two vertically related cards (e.g. Row 1 to Row 2)
    const connectVertical = (fromIdx: number, toIdx: number) => {
      const a = anchors[fromIdx];
      const b = anchors[toIdx];
      if (!a || !b) return;

      const startX = a.x;
      const startY = a.bottom - 4;
      const endX = b.x;
      const endY = b.top + 16;
      const dy = endY - startY;

      if (dy <= 0) return; // not stacked vertically

      const d = `M ${startX} ${startY} C ${startX} ${startY + dy * 0.5}, ${endX} ${endY - dy * 0.5}, ${endX} ${endY}`;
      newPaths.push({ id: `v-${fromIdx}-${toIdx}`, d });
    };

    // 1. Row 1 Horizontal Chain: 0 -> 1 -> 2 -> 3 -> 4
    connectHorizontal(0, 1, "down");
    connectHorizontal(1, 2, "up");
    connectHorizontal(2, 3, "down");
    connectHorizontal(3, 4, "up");

    // 2. Inter-Row Bridges (Roadmap transitions):
    // CS Fundamentals (4) -> GenAI (5)
    connectVertical(4, 5);
    // DSA (0) -> Competitive Programming (7)
    connectVertical(0, 7);
    // Backend (2) / Full Stack (3) -> System Design (8)
    connectVertical(2, 8);

    // 3. Row 2 Horizontal Chain: 5 -> 6 -> 7 -> 8
    connectHorizontal(5, 6, "up");
    connectHorizontal(6, 7, "down");
    connectHorizontal(7, 8, "up");

    setConnectorPaths(newPaths);
  }, [isSearchActive]);

  // Recalculate connector lines after layout render and on resize
  useEffect(() => {
    const handleResize = () => {
      updateConnectorLines();
    };

    const timer = setTimeout(updateConnectorLines, 200);
    window.addEventListener("resize", handleResize);

    let ro: ResizeObserver | null = null;
    if (boardRef.current && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => {
        updateConnectorLines();
      });
      ro.observe(boardRef.current);
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
      if (ro) ro.disconnect();
    };
  }, [updateConnectorLines, filteredDomains]);

  return (
    <div className="relative min-h-screen bg-[#FDFCFB] overflow-x-hidden">
      {/* Subtle notebook ruled background texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.25]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #CBD5E1 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden="true"
      />

      {/* Ambient gradient glow */}
      <div
        className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at top right, rgba(29, 100, 236, 0.05) 0%, transparent 65%)",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute top-28 left-0 w-[450px] h-[450px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at top left, rgba(239, 201, 255, 0.12) 0%, transparent 60%)",
        }}
        aria-hidden="true"
      />

      {/* ── STANDARD CENTERED CONTAINER (Matches Lectures, Tools, & Header EXACTLY) ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">

        {/* ── Page Header (Identical left alignment and styling as other pages) ── */}
        <div className="mb-10 text-left">
          {/* Breadcrumb */}
          <nav className="text-xs text-slate-400 mb-2 font-medium flex items-center gap-1.5">
            <Link href="/" className="hover:text-slate-600 transition">
              Home
            </Link>
            <span>›</span>
            <span className="text-slate-600 font-semibold">Notes</span>
          </nav>

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEF4FF] text-[#1D64EC] text-xs font-bold mb-2.5 uppercase tracking-wider">
            <Folder className="w-3.5 h-3.5" />
            <span>STUDENT RESOURCE LIBRARY</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 mt-0.5 mb-2">
            Student <span className="text-[#1D64EC]">Notes</span>
          </h1>

          {/* Description */}
          <p className="text-slate-500 text-sm sm:text-base max-w-2xl leading-relaxed mb-6">
            Access high-quality notes, handwritten PDFs, cheat sheets, and study material across all domains. Read online or download anytime.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search notes, subjects, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#1D64EC] focus:ring-4 focus:ring-[#1D64EC]/10 transition-colors bg-white shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {searchQuery && (
            <p className="text-xs text-slate-500 mt-2">
              Found {filteredDomains.length} domain(s) matching &ldquo;{searchQuery}&rdquo;
            </p>
          )}
        </div>

        {/* ── STICKY-NOTE BOARD ── */}
        {filteredDomains.length === 0 ? (
          <div className="text-center py-20 bg-slate-50/70 rounded-2xl border border-slate-200/80 p-8 max-w-md mx-auto">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 mb-1">
              No matching notes found
            </h3>
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
          <div ref={boardRef} className="relative w-full">
            {/* Dynamic SVG Roadmap Connectors (Zero floating or disconnected lines) */}
            <RoadmapConnectors paths={connectorPaths} svgSize={boardSize} />

            {/* If user is actively searching, render a clean responsive grid */}
            {isSearchActive ? (
              <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4">
                {filteredDomains.map((domain, i) => (
                  <StickyCard
                    key={domain.id}
                    domain={domain}
                    index={i}
                    visible={visible}
                    onCardRef={(el) => {
                      cardRefs.current[i] = el;
                    }}
                  />
                ))}
              </div>
            ) : (
              /* Two-Row Staggered Roadmap Composition */
              <div className="relative z-10 space-y-12 sm:space-y-16 pt-4">
                {/* ── ROW 1: Core Foundations (5 cards on xl, wrap gracefully on smaller) ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-5 sm:gap-6">
                  {row1.map((domain, i) => (
                    <StickyCard
                      key={domain.id}
                      domain={domain}
                      index={i}
                      visible={visible}
                      onCardRef={(el) => {
                        cardRefs.current[i] = el;
                      }}
                    />
                  ))}
                </div>

                {/* ── ROW 2: Advanced Tracks (4 cards centered on xl under Row 1) ── */}
                {row2.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-5 sm:gap-6 xl:gap-8">
                    {row2.map((domain, i) => (
                      <div
                        key={domain.id}
                        className="w-full sm:w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] xl:w-[calc(22%-12px)] xl:min-w-[230px]"
                      >
                        <StickyCard
                          domain={domain}
                          index={5 + i}
                          visible={visible}
                          onCardRef={(el) => {
                            cardRefs.current[5 + i] = el;
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
