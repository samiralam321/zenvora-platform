"use client";

import React, { useState } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
  ListMusic,
  Headphones,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useMusic } from "@/context/MusicContext";
import { MUSIC_CATEGORIES } from "@/lib/musicData";

interface FocusAudioPopoverProps {
  onClose?: () => void;
  className?: string;
}

export default function FocusAudioPopover({
  onClose,
  className = "",
}: FocusAudioPopoverProps) {
  const {
    currentTrack,
    currentTrackIndex,
    isPlaying,
    volume,
    isMuted,
    activeCategory,
    filteredTracks,
    togglePlay,
    playTrackById,
    nextTrack,
    prevTrack,
    setVolume,
    toggleMute,
    setActiveCategory,
  } = useMusic();

  const [showTracklist, setShowTracklist] = useState(false);

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`w-[310px] sm:w-[340px] bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl shadow-black/60 rounded-2xl p-4 text-slate-100 flex flex-col gap-3.5 animate-in fade-in zoom-in-95 duration-200 select-none ${className}`}
    >
      {/* ── Top Header ── */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-950/80 border border-blue-800/60 flex items-center justify-center text-[#1D64EC]">
            <Headphones className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
              <span>Focus Audio</span>
              {isPlaying && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              )}
            </h3>
            <p className="text-[10px] text-slate-400">Distraction-free background sound</p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Mood Filter Chips ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scroll text-[11px] font-semibold">
        {MUSIC_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;
          let label: string = cat;
          if (cat === "Ambient & Nature") label = "🌧️ Ambient";
          else if (cat === "Deep Focus") label = "🧠 Focus";
          else if (cat === "Cinematic") label = "🎬 Cinema";
          else if (cat === "Anime & Lofi") label = "🌸 Anime";

          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-all ${
                isActive
                  ? "bg-[#1D64EC] text-white shadow-xs font-bold"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/50"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* ── Current Track Display ── */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-lg shrink-0">
            {currentTrack.icon}
          </div>
          <div className="min-w-0 space-y-0.5">
            <h4 className="text-xs font-bold text-white truncate">
              {currentTrack.title}
            </h4>
            <p className="text-[10px] text-slate-400 truncate">
              {currentTrack.artist}
            </p>
          </div>
        </div>

        {/* Animated Equalizer Waves */}
        <div className="flex items-end gap-0.5 h-4 shrink-0 px-1">
          <span
            className={`w-1 bg-[#1D64EC] rounded-full transition-all ${
              isPlaying ? "animate-pulse h-4" : "h-1 opacity-40"
            }`}
          />
          <span
            className={`w-1 bg-[#3b82f6] rounded-full transition-all ${
              isPlaying ? "animate-bounce h-3" : "h-1 opacity-40"
            }`}
          />
          <span
            className={`w-1 bg-[#60a5fa] rounded-full transition-all ${
              isPlaying ? "animate-pulse h-5" : "h-1 opacity-40"
            }`}
          />
        </div>
      </div>

      {/* ── Playback Controls ── */}
      <div className="flex items-center justify-center gap-4 py-1">
        <button
          onClick={prevTrack}
          className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 transition"
          title="Previous Track"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        <button
          onClick={togglePlay}
          className="p-3.5 rounded-full bg-[#1D64EC] hover:bg-[#1a56d4] text-white shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current translate-x-0.5" />
          )}
        </button>

        <button
          onClick={nextTrack}
          className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 transition"
          title="Next Track"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      {/* ── Volume Bar ── */}
      <div className="flex items-center gap-2.5 px-1">
        <button
          onClick={toggleMute}
          className="p-1 rounded text-slate-400 hover:text-white transition"
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted || volume === 0 ? (
            <VolumeX className="w-4 h-4 text-rose-400" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </button>

        <input
          type="range"
          min={0}
          max={100}
          value={isMuted ? 0 : volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#1D64EC]"
        />

        <span className="text-[10px] font-mono text-slate-400 w-7 text-right">
          {isMuted ? "0%" : `${volume}%`}
        </span>
      </div>

      {/* ── Expandable Tracklist Drawer ── */}
      <div className="border-t border-slate-800/80 pt-2">
        <button
          onClick={() => setShowTracklist((prev) => !prev)}
          className="w-full flex items-center justify-between text-left px-2 py-1.5 rounded-lg text-[11px] font-semibold text-slate-300 hover:bg-slate-800/60 transition"
        >
          <span className="flex items-center gap-1.5">
            <ListMusic className="w-3.5 h-3.5 text-[#1D64EC]" />
            <span>All Study Tracks ({filteredTracks.length})</span>
          </span>
          {showTracklist ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          )}
        </button>

        {showTracklist && (
          <div className="mt-1.5 max-h-48 overflow-y-auto space-y-1 custom-scroll pr-1">
            {filteredTracks.map((t) => {
              const isSelected = t.id === currentTrack.id;
              return (
                <button
                  key={t.id}
                  onClick={() => playTrackById(t.id)}
                  className={`w-full flex items-center justify-between text-left p-2 rounded-lg text-xs transition ${
                    isSelected
                      ? "bg-blue-950/80 text-white font-bold border border-blue-700/50"
                      : "text-slate-300 hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm shrink-0">{t.icon}</span>
                    <div className="min-w-0">
                      <p className="truncate text-[11px]">{t.title}</p>
                      <p className="text-[9px] text-slate-400 truncate">{t.artist}</p>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="text-[10px] text-blue-400 font-mono flex items-center gap-0.5 shrink-0">
                      <Check className="w-3 h-3 text-[#1D64EC]" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
