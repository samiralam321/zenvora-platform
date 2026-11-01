"use client";

import React, { useState, useEffect, useRef, useLayoutEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  X,
  ExternalLink,
  Heart,
  MoreHorizontal,
  LayoutGrid,
  Leaf,
  Target,
  Clapperboard,
  Moon,
  ListMusic,
  Clock,
  Check,
  Share2,
  Copy,
  Headphones,
} from "lucide-react";
import { useMusic } from "@/context/MusicContext";
import { Track } from "@/lib/musicData";

interface FocusAudioPopoverProps {
  onClose?: () => void;
  className?: string;
}

// 5 Pill Categories matching Reference Screenshot 2
const CATEGORY_ITEMS = [
  { id: "All", label: "All", Icon: LayoutGrid },
  { id: "Ambient", label: "Ambient", Icon: Leaf },
  { id: "Focus", label: "Focus", Icon: Target },
  { id: "Cinema", label: "Cinema", Icon: Clapperboard },
  { id: "Sleep", label: "Sleep", Icon: Moon },
] as const;

type PlaylistTab = "all" | "favorites" | "recents";

export default function FocusAudioPopover({
  onClose,
  className = "",
}: FocusAudioPopoverProps) {
  const {
    tracks,
    currentTrack,
    currentTrackIndex,
    isPlaying,
    activeCategory,
    filteredTracks,
    isShuffle,
    isRepeat,
    favorites,
    recentlyPlayed,
    togglePlay,
    playTrackById,
    nextTrack,
    prevTrack,
    toggleShuffle,
    toggleRepeat,
    toggleFavorite,
    isFavorite,
    setActiveCategory,
  } = useMusic();

  const [activeTab, setActiveTab] = useState<PlaylistTab>("all");
  const [showOptionsTrackId, setShowOptionsTrackId] = useState<string | null>(null);
  const [copiedTrackId, setCopiedTrackId] = useState<string | null>(null);

  // Category pill animation refs & functional scroll indicator
  const catContainerRef = useRef<HTMLDivElement>(null);
  const catBtnRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const scrollTrackRef = useRef<HTMLDivElement>(null);
  const [catPillStyle, setCatPillStyle] = useState({ left: 0, width: 0 });
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [scrollMetrics, setScrollMetrics] = useState({
    hasOverflow: false,
    progress: 0,
    thumbRatio: 1,
  });

  const checkScrollLimits = useCallback(() => {
    const el = catContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = scrollWidth - clientWidth;
    const hasOverflow = maxScroll > 2;
    const progress = maxScroll > 0 ? Math.min(1, Math.max(0, scrollLeft / maxScroll)) : 0;
    const thumbRatio = scrollWidth > 0 ? Math.min(1, Math.max(0.18, clientWidth / scrollWidth)) : 1;

    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(hasOverflow && scrollLeft < maxScroll - 6);
    setScrollMetrics({
      hasOverflow,
      progress,
      thumbRatio,
    });
  }, []);

  const updateCatPill = useCallback(() => {
    const activeBtn = catBtnRefs.current.get(activeCategory);
    const container = catContainerRef.current;
    if (!activeBtn || !container) return;
    const containerRect = container.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();
    setCatPillStyle({
      left: btnRect.left - containerRect.left + container.scrollLeft,
      width: btnRect.width,
    });
  }, [activeCategory]);

  const handleCategoryScroll = useCallback(() => {
    updateCatPill();
    checkScrollLimits();
  }, [updateCatPill, checkScrollLimits]);

  useLayoutEffect(() => {
    updateCatPill();
    checkScrollLimits();
  }, [updateCatPill, checkScrollLimits]);

  useLayoutEffect(() => {
    const container = catContainerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() => {
      updateCatPill();
      checkScrollLimits();
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [updateCatPill, checkScrollLimits]);

  // 1. Always reset category row to initial position (All fully visible) when opened
  useEffect(() => {
    if (catContainerRef.current) {
      catContainerRef.current.scrollLeft = 0;
      updateCatPill();
      checkScrollLimits();
    }
  }, [updateCatPill, checkScrollLimits]);

  // 2. Interactive scrollbar track dragging & clicking
  const handleTrackPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const track = scrollTrackRef.current;
      const container = catContainerRef.current;
      if (!track || !container) return;

      const trackRect = track.getBoundingClientRect();
      const maxScroll = container.scrollWidth - container.clientWidth;
      if (maxScroll <= 0) return;

      const scrollToClientX = (clientX: number) => {
        const clickX = Math.max(0, Math.min(trackRect.width, clientX - trackRect.left));
        const percentage = clickX / trackRect.width;
        container.scrollLeft = percentage * maxScroll;
        updateCatPill();
        checkScrollLimits();
      };

      scrollToClientX(e.clientX);

      const onPointerMove = (moveEvt: PointerEvent) => {
        scrollToClientX(moveEvt.clientX);
      };

      const onPointerUp = () => {
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
      };

      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
    },
    [updateCatPill, checkScrollLimits]
  );

  // 3. User selects category: activate & automatically scroll fully into view
  const handleSelectCategory = useCallback(
    (catId: string) => {
      setActiveCategory(catId);
      if (activeTab !== "all") setActiveTab("all");

      const container = catContainerRef.current;
      if (!container) return;

      if (catId === "All") {
        container.scrollTo({ left: 0, behavior: "smooth" });
        setTimeout(checkScrollLimits, 300);
        return;
      }

      const btn = catBtnRefs.current.get(catId);
      if (!btn) return;

      const cRect = container.getBoundingClientRect();
      const bRect = btn.getBoundingClientRect();

      if (bRect.left < cRect.left + 8) {
        const delta = cRect.left - bRect.left + 16;
        container.scrollTo({
          left: Math.max(0, container.scrollLeft - delta),
          behavior: "smooth",
        });
      } else if (bRect.right > cRect.right - 8) {
        const delta = bRect.right - cRect.right + 16;
        container.scrollTo({
          left: container.scrollLeft + delta,
          behavior: "smooth",
        });
      }
      setTimeout(checkScrollLimits, 300);
    },
    [activeTab, setActiveCategory, checkScrollLimits]
  );

  // Tab tracks calculation
  const displayedTracks = useMemo(() => {
    if (activeTab === "favorites") {
      return tracks.filter((t) => favorites.includes(t.id));
    }
    if (activeTab === "recents") {
      const recentsMap = new Map(tracks.map((t) => [t.id, t]));
      return recentlyPlayed
        .map((id) => recentsMap.get(id))
        .filter((t): t is Track => Boolean(t));
    }
    return filteredTracks;
  }, [activeTab, tracks, favorites, recentlyPlayed, filteredTracks]);

  // Copy track link
  const handleCopyLink = (track: Track, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const url = `https://music.youtube.com/watch?v=${track.youtubeId}`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedTrackId(track.id);
      setTimeout(() => setCopiedTrackId(null), 2000);
    }
    setShowOptionsTrackId(null);
  };

  // Open YouTube link in new tab
  const handleOpenExternal = (track: Track, e?: React.MouseEvent) => {
    e?.stopPropagation();
    window.open(`https://music.youtube.com/watch?v=${track.youtubeId}`, "_blank", "noopener,noreferrer");
    setShowOptionsTrackId(null);
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        setShowOptionsTrackId(null);
      }}
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      data-lenis-prevent="true"
      data-lenis-prevent-touch="true"
      className={`relative w-[370px] sm:w-[410px] max-w-[95vw] rounded-[30px] p-[1.5px] bg-gradient-to-b from-blue-500/40 via-purple-500/25 to-indigo-600/40 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.85)] animate-in fade-in zoom-in-95 duration-200 select-none ${className}`}
    >
      {/* ── Ambient Neon Corner Lighting (Matching Screenshot 2) ── */}
      <div className="absolute -top-3 -left-3 w-28 h-28 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-3 -right-3 w-28 h-28 bg-purple-600/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-4 -left-3 w-32 h-32 bg-cyan-500/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-4 -right-3 w-32 h-32 bg-fuchsia-600/30 rounded-full blur-3xl pointer-events-none" />

      {/* ── Inner Main Container ── */}
      <div className="relative w-full rounded-[28.5px] bg-[#0A0D18]/95 backdrop-blur-2xl p-4 sm:p-5 text-slate-100 flex flex-col gap-4 overflow-hidden border border-white/5">
        
        {/* Subtle Background Radial Aurora */}
        <div className="absolute -top-24 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-0 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* ── 1. Header Section ── */}
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            {/* Glowing Headphone Icon Square */}
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-600 p-[1.5px] shadow-[0_0_20px_rgba(139,92,246,0.45)] shrink-0">
              <div className="w-full h-full rounded-[14px] bg-[#0F142A] flex items-center justify-center text-white">
                <Headphones className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Focus Audio</span>
                {isPlaying && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-400 font-normal">
                Distraction-free background sound
              </p>
            </div>
          </div>

          {/* Right Action Icons (Close only) */}
          <div className="flex items-center gap-2">
            {onClose && (
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-slate-800/60 border border-slate-700/60 hover:bg-slate-700/70 hover:border-slate-600 text-slate-300 hover:text-white flex items-center justify-center transition active:scale-95 shadow-sm"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* ── 2. Category Filter Pills (All, Ambient, Focus, Cinema, Sleep) ── */}
        <div className="relative w-full z-10 flex flex-col gap-1">
          <div className="relative w-full overflow-hidden">
            {/* Subtle Left-Edge Fade Indicator */}
            <div
              className={`absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[#0A0D18] to-transparent pointer-events-none z-20 transition-opacity duration-300 ${
                canScrollLeft ? "opacity-100" : "opacity-0"
              }`}
            />

            {/* Subtle Right-Edge Fade Indicator */}
            <div
              className={`absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0A0D18] via-[#0A0D18]/85 to-transparent pointer-events-none z-20 transition-opacity duration-300 ${
                canScrollRight ? "opacity-100" : "opacity-0"
              }`}
            />

            <div
              ref={catContainerRef}
              onScroll={handleCategoryScroll}
              data-lenis-prevent="true"
              data-lenis-prevent-touch="true"
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              style={{
                WebkitOverflowScrolling: "touch",
                touchAction: "pan-x",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
              className="relative flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-1 px-1 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-full overscroll-contain"
            >
              {/* Animated sliding pill */}
              <motion.div
                className="absolute top-1 h-[32px] rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-[0_0_15px_rgba(99,102,241,0.55)] pointer-events-none"
                animate={{ left: catPillStyle.left, width: catPillStyle.width }}
                transition={{ type: "spring", stiffness: 450, damping: 35, mass: 0.6 }}
              />

              {CATEGORY_ITEMS.map((item) => {
                const isActive = activeCategory === item.id;
                const Icon = item.Icon;

                return (
                  <button
                    key={item.id}
                    ref={(el) => {
                      if (el) catBtnRefs.current.set(item.id, el);
                      else catBtnRefs.current.delete(item.id);
                    }}
                    onClick={() => handleSelectCategory(item.id)}
                    className={`relative z-10 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors duration-200 shrink-0 select-none ${
                      isActive
                        ? "text-white font-bold"
                        : "bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800/70 border border-slate-800/80"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Thin Custom Horizontal Scroll Indicator (2.5px) ── */}
          {scrollMetrics.hasOverflow && (
            <div
              ref={scrollTrackRef}
              onPointerDown={handleTrackPointerDown}
              className="w-full pt-0.5 pb-0.5 px-1 cursor-pointer select-none"
              title="Drag or click to scroll categories"
            >
              <div className="w-full h-[2.5px] rounded-full bg-slate-800/80 relative overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 absolute top-0 transition-[left,width] duration-75"
                  style={{
                    width: `${scrollMetrics.thumbRatio * 100}%`,
                    left: `${scrollMetrics.progress * (1 - scrollMetrics.thumbRatio) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── 3. Featured Now Playing Card (Matching Screenshot 2 Exactly) ── */}
        <div className="relative rounded-2xl bg-gradient-to-b from-[#13172C]/90 to-[#0A0D1A]/95 border border-slate-800/90 p-3.5 sm:p-4 shadow-xl overflow-hidden z-10">
          
          {/* Decorative Glowing Purple Wave at bottom-right */}
          <div className="absolute -bottom-1 -right-2 w-48 h-14 pointer-events-none opacity-85 overflow-hidden">
            <svg viewBox="0 0 200 50" preserveAspectRatio="none" className="w-full h-full">
              <defs>
                <linearGradient id="nowPlayingWaveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0" />
                  <stop offset="35%" stopColor="#a855f7" stopOpacity="0.35" />
                  <stop offset="70%" stopColor="#6366f1" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.75" />
                </linearGradient>
                <filter id="waveGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <path
                d="M0,45 Q35,15 70,32 T135,22 T175,35 T200,18 L200,50 L0,50 Z"
                fill="url(#nowPlayingWaveGrad)"
              />
              <path
                d="M0,45 Q35,15 70,32 T135,22 T175,35 T200,18"
                fill="none"
                stroke="#a855f7"
                strokeWidth="2.5"
                filter="url(#waveGlow)"
              />
            </svg>
          </div>

          <div className="relative flex items-center gap-3.5 min-w-0 z-10">
            {/* Left: Large Album Artwork */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 shadow-lg border border-white/10 relative bg-slate-900">
              <img
                src={currentTrack.coverUrl || `https://img.youtube.com/vi/${currentTrack.youtubeId}/mqdefault.jpg`}
                alt={currentTrack.title}
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = "none";
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = "flex";
                }}
                className="w-full h-full object-cover"
                loading="eager"
              />
              <div
                style={{ display: "none" }}
                className="w-full h-full bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 flex items-center justify-center text-3xl"
              >
                <span>{currentTrack.icon}</span>
              </div>
            </div>

            {/* Right: Metadata + Buttons */}
            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
              {/* Header row: NOW PLAYING + Action icons */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-purple-400">
                  {/* Mini purple audio indicator */}
                  <div className="flex items-end gap-[2px] h-3">
                    <span className={`w-[2.5px] bg-purple-400 rounded-full ${isPlaying ? "animate-pulse h-3" : "h-1.5"}`} />
                    <span className={`w-[2.5px] bg-purple-300 rounded-full ${isPlaying ? "animate-bounce h-2" : "h-1"}`} />
                    <span className={`w-[2.5px] bg-purple-400 rounded-full ${isPlaying ? "animate-pulse h-2.5" : "h-2"}`} />
                  </div>
                  <span className="text-[10px] font-bold tracking-widest uppercase">
                    NOW PLAYING
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Favourite heart button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(currentTrack.id);
                    }}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-800/60 border border-slate-700/60 flex items-center justify-center transition active:scale-95 ${
                      isFavorite(currentTrack.id)
                        ? "text-pink-400 bg-pink-950/40 border-pink-700/60 shadow-[0_0_10px_rgba(244,114,182,0.3)]"
                        : "text-slate-400 hover:text-white hover:bg-slate-700/60"
                    }`}
                    title={isFavorite(currentTrack.id) ? "Favorited" : "Add to favorites"}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        isFavorite(currentTrack.id) ? "fill-current" : ""
                      }`}
                    />
                  </button>

                  {/* More options button */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowOptionsTrackId(
                          showOptionsTrackId === currentTrack.id ? null : currentTrack.id
                        );
                      }}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-800/60 border border-slate-700/60 text-slate-400 hover:text-white hover:bg-slate-700/60 flex items-center justify-center transition active:scale-95"
                      title="More options"
                    >
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>

                    {/* Popover Menu */}
                    {showOptionsTrackId === currentTrack.id && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 top-9 w-44 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-1 z-30 flex flex-col gap-0.5 text-xs text-slate-200 animate-in fade-in zoom-in-95"
                      >
                        <button
                          onClick={(e) => handleCopyLink(currentTrack, e)}
                          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-left transition"
                        >
                          {copiedTrackId === currentTrack.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-400" />
                              <span>Copy Link</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={(e) => handleOpenExternal(currentTrack, e)}
                          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-left transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                          <span>Open in YouTube</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Title & Artist */}
              <div className="min-w-0 mt-1">
                <h4 className="text-sm sm:text-base font-bold text-white truncate leading-snug">
                  {currentTrack.title}
                </h4>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {currentTrack.artist}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── 4. Center Playback Controls (Shuffle, Prev, Play/Pause, Next, Repeat) ── */}
        <div className="flex items-center justify-center gap-4 sm:gap-5 py-0.5 z-10">
          {/* Shuffle Button */}
          <button
            onClick={toggleShuffle}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all active:scale-95 ${
              isShuffle
                ? "bg-purple-950/60 border border-purple-500/60 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.35)]"
                : "bg-slate-850 bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700/60"
            }`}
            title={isShuffle ? "Shuffle On" : "Shuffle Off"}
          >
            <Shuffle className="w-4 h-4" />
          </button>

          {/* Previous Track */}
          <button
            onClick={prevTrack}
            className="w-9 h-9 flex items-center justify-center text-white hover:text-blue-400 transition active:scale-95"
            title="Previous Track"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          {/* Play/Pause Center Button (Large Glowing Gradient) */}
          <button
            onClick={togglePlay}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 shadow-[0_0_25px_rgba(99,102,241,0.55)] flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current translate-x-0.5" />
            )}
          </button>

          {/* Next Track */}
          <button
            onClick={nextTrack}
            className="w-9 h-9 flex items-center justify-center text-white hover:text-blue-400 transition active:scale-95"
            title="Next Track"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          {/* Repeat Button */}
          <button
            onClick={toggleRepeat}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all active:scale-95 ${
              isRepeat
                ? "bg-purple-950/60 border border-purple-500/60 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.35)]"
                : "bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700/60"
            }`}
            title={isRepeat ? "Repeat Track On" : "Repeat Track Off"}
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>

        {/* ── 5. Playlist Navigation Tabs (All Study Tracks, Favourites, Recently Played) ── */}
        <div
          data-lenis-prevent="true"
          data-lenis-prevent-touch="true"
          style={{
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
          className="bg-[#0E1224]/90 border border-slate-800/80 rounded-2xl p-1 flex items-center gap-1 overflow-x-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-full z-10"
        >
          <button
            onClick={() => setActiveTab("all")}
            className={`flex items-center justify-center gap-1.5 h-8 sm:h-8.5 px-3 rounded-xl text-[11px] sm:text-xs font-semibold whitespace-nowrap shrink-0 sm:flex-1 transition-all duration-200 ${
              activeTab === "all"
                ? "bg-gradient-to-r from-blue-600/90 via-indigo-600/90 to-purple-600/90 text-white shadow-[0_2px_10px_rgba(79,70,229,0.3)] border border-white/10"
                : "text-slate-400 hover:text-white hover:bg-slate-800/40 border border-transparent"
            }`}
          >
            <ListMusic className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">All Study Tracks ({filteredTracks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("favorites")}
            className={`flex items-center justify-center gap-1.5 h-8 sm:h-8.5 px-3 rounded-xl text-[11px] sm:text-xs font-semibold whitespace-nowrap shrink-0 sm:flex-1 transition-all duration-200 ${
              activeTab === "favorites"
                ? "bg-gradient-to-r from-blue-600/90 via-indigo-600/90 to-purple-600/90 text-white shadow-[0_2px_10px_rgba(79,70,229,0.3)] border border-white/10"
                : "text-slate-400 hover:text-white hover:bg-slate-800/40 border border-transparent"
            }`}
          >
            <Heart className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">Favourites</span>
          </button>

          <button
            onClick={() => setActiveTab("recents")}
            className={`flex items-center justify-center gap-1.5 h-8 sm:h-8.5 px-3 rounded-xl text-[11px] sm:text-xs font-semibold whitespace-nowrap shrink-0 sm:flex-1 transition-all duration-200 ${
              activeTab === "recents"
                ? "bg-gradient-to-r from-blue-600/90 via-indigo-600/90 to-purple-600/90 text-white shadow-[0_2px_10px_rgba(79,70,229,0.3)] border border-white/10"
                : "text-slate-400 hover:text-white hover:bg-slate-800/40 border border-transparent"
            }`}
          >
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">Recently Played</span>
          </button>
        </div>

        {/* ── 6. Playlist Track Cards ── */}
        <div
          data-lenis-prevent="true"
          data-lenis-prevent-touch="true"
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          className="max-h-[220px] overflow-y-auto space-y-1.5 scrollbar-hide pr-1 overscroll-contain z-10"
          style={{
            WebkitOverflowScrolling: "touch",
            touchAction: "pan-y",
          }}
        >
          {displayedTracks.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
              {activeTab === "favorites" ? (
                <>
                  <Heart className="w-6 h-6 text-slate-600 stroke-1" />
                  <p>No favourites yet. Click the heart on any track to add it here!</p>
                </>
              ) : activeTab === "recents" ? (
                <>
                  <Clock className="w-6 h-6 text-slate-600 stroke-1" />
                  <p>No recently played tracks yet. Start listening to build your history!</p>
                </>
              ) : (
                <p>No tracks found in this category.</p>
              )}
            </div>
          ) : (
            displayedTracks.map((t) => {
              const isSelected = t.id === currentTrack.id;

              return (
                <div
                  key={t.id}
                  onClick={() => playTrackById(t.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-2xl transition cursor-pointer select-none relative group ${
                    isSelected
                      ? "bg-gradient-to-r from-purple-950/50 via-indigo-950/40 to-slate-900/60 border border-purple-500/60 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                      : "hover:bg-slate-800/40 border border-transparent"
                  }`}
                >
                  {/* Left: Thumbnail + Title & Artist */}
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-slate-900 border border-white/5 relative">
                      <img
                        src={t.coverUrl || `https://img.youtube.com/vi/${t.youtubeId}/mqdefault.jpg`}
                        alt={t.title}
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = "none";
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = "flex";
                        }}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div
                        style={{ display: "none" }}
                        className="w-full h-full bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 flex items-center justify-center text-lg"
                      >
                        <span>{t.icon}</span>
                      </div>
                    </div>

                    <div className="min-w-0">
                      <h5
                        className={`text-xs truncate font-semibold ${
                          isSelected ? "text-white font-bold" : "text-slate-200 group-hover:text-white"
                        }`}
                      >
                        {t.title}
                      </h5>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        {t.artist}
                      </p>
                    </div>
                  </div>

                  {/* Right side: Active Visualizer OR Inactive Action Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isSelected ? (
                      /* Animated Equalizer Waveform in Purple */
                      <div className="flex items-end gap-1 h-5 px-2 text-purple-400">
                        <span
                          className={`w-[3px] bg-purple-400 rounded-full transition-all ${
                            isPlaying ? "animate-pulse h-5" : "h-2"
                          }`}
                        />
                        <span
                          className={`w-[3px] bg-purple-300 rounded-full transition-all ${
                            isPlaying ? "animate-bounce h-3.5" : "h-1.5"
                          }`}
                        />
                        <span
                          className={`w-[3px] bg-purple-400 rounded-full transition-all ${
                            isPlaying ? "animate-pulse h-4" : "h-2.5"
                          }`}
                        />
                        <span
                          className={`w-[3px] bg-purple-500 rounded-full transition-all ${
                            isPlaying ? "animate-bounce h-2.5" : "h-1"
                          }`}
                        />
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(t.id);
                          }}
                          className={`p-1.5 rounded-lg transition ${
                            isFavorite(t.id)
                              ? "text-pink-400"
                              : "text-slate-500 hover:text-white"
                          }`}
                          title="Favorite"
                        >
                          <Heart
                            className={`w-3.5 h-3.5 ${
                              isFavorite(t.id) ? "fill-current" : ""
                            }`}
                          />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowOptionsTrackId(
                              showOptionsTrackId === t.id ? null : t.id
                            );
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-white transition"
                          title="Options"
                        >
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}

                    {/* Popover Menu for row */}
                    {showOptionsTrackId === t.id && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-2 top-11 w-40 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-1 z-30 flex flex-col gap-0.5 text-xs text-slate-200 animate-in fade-in zoom-in-95"
                      >
                        <button
                          onClick={(e) => handleCopyLink(t, e)}
                          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-left transition"
                        >
                          {copiedTrackId === t.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-400" />
                              <span>Copy Link</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={(e) => handleOpenExternal(t, e)}
                          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-left transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                          <span>Open in YouTube</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
