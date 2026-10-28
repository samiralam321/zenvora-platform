"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Shuffle,
  Repeat,
  Headphones,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { useStudyAudio } from "./StudyAudioContext";

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export default function StudyMusicPlayer({
  isMini = false,
  onExpand,
}: {
  isMini?: boolean;
  onExpand?: () => void;
}) {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    isRepeat,
    selectedCategory,
    togglePlay,
    nextTrack,
    prevTrack,
    seek,
    setVolumeLevel,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    selectCategory,
  } = useStudyAudio();

  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  const categories = [
    "Lo-fi Beats",
    "Deep Focus",
    "Ambient Sounds",
    "Rain Sounds",
    "Piano Focus",
  ];

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // ── Mini Floating Player (used in Fullscreen mode or mobile) ──
  if (isMini) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-md text-white border border-white/10 rounded-2xl p-2.5 shadow-2xl flex items-center gap-3 w-72 transition-all">
        <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-white/20">
          <Image
            src={currentTrack.artworkUrl}
            alt={currentTrack.title}
            fill
            className="object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-white truncate">
            {currentTrack.title}
          </p>
          <p className="text-[10px] text-slate-400 truncate">
            {formatTime(currentTime)} / {formatTime(duration)}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={prevTrack}
            className="p-1 text-slate-300 hover:text-white transition"
            aria-label="Previous track"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={togglePlay}
            className="w-7 h-7 rounded-full bg-[#1D64EC] hover:bg-[#1554C8] text-white flex items-center justify-center shadow-md transition"
            aria-label={isPlaying ? "Pause music" : "Play study music"}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={nextTrack}
            className="p-1 text-slate-300 hover:text-white transition"
            aria-label="Next track"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // ── Standard Study with Music Sidebar Card ──
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#EEF4FF] text-[#1D64EC] flex items-center justify-center">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 leading-tight">
                Study with Music
              </h3>
              <p className="text-[10px] text-slate-500">
                Stay focused while learning
              </p>
            </div>
          </div>

          {/* Active Audio Wave Indicator */}
          {isPlaying && (
            <div className="flex items-center gap-0.5" title="Playing">
              <span className="w-1 h-3 bg-[#1D64EC] rounded-full animate-pulse" />
              <span className="w-1 h-5 bg-[#1D64EC] rounded-full animate-pulse delay-75" />
              <span className="w-1 h-2 bg-[#1D64EC] rounded-full animate-pulse delay-150" />
            </div>
          )}
        </div>

        {/* Category Dropdown */}
        <div className="relative mb-4">
          <button
            type="button"
            onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-800 hover:bg-slate-100/80 transition"
          >
            <span className="truncate">{selectedCategory}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                categoryDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {categoryDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-white rounded-xl border border-slate-200 shadow-lg py-1 max-h-48 overflow-y-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    selectCategory(cat);
                    setCategoryDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between ${
                    selectedCategory === cat
                      ? "bg-[#EEF4FF] text-[#1D64EC] font-bold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>{cat}</span>
                  {selectedCategory === cat && (
                    <Sparkles className="w-3 h-3 text-[#1D64EC]" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Artwork */}
        <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-3.5 shadow-xs border border-slate-100 bg-slate-900 group">
          <Image
            src={currentTrack.artworkUrl}
            alt={currentTrack.title}
            fill
            sizes="300px"
            className="object-cover group-hover:scale-102 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
          <div className="absolute bottom-2 left-2.5 right-2.5">
            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/20 text-white backdrop-blur-md">
              {currentTrack.category}
            </span>
          </div>
        </div>

        {/* Track Title & Tags */}
        <div className="mb-4">
          <h4 className="text-sm font-bold text-slate-900 truncate">
            {currentTrack.title}
          </h4>
          <p className="text-[11px] text-slate-500 truncate mt-0.5">
            {currentTrack.tags}
          </p>
        </div>

        {/* Controls: Shuffle, Prev, Play/Pause, Next, Repeat */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <button
            onClick={toggleShuffle}
            className={`p-1.5 rounded-lg transition ${
              isShuffle
                ? "text-[#1D64EC] bg-blue-50"
                : "text-slate-400 hover:text-slate-700"
            }`}
            title="Shuffle"
            aria-label="Toggle shuffle"
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={prevTrack}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            title="Previous track"
            aria-label="Previous track"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-[#1D64EC] hover:bg-[#1554C8] text-white flex items-center justify-center shadow-md hover:shadow-lg transition-all active:scale-95"
            aria-label={isPlaying ? "Pause music" : "Play study music"}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={nextTrack}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            title="Next track"
            aria-label="Next track"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button
            onClick={toggleRepeat}
            className={`p-1.5 rounded-lg transition ${
              isRepeat
                ? "text-[#1D64EC] bg-blue-50"
                : "text-slate-400 hover:text-slate-700"
            }`}
            title="Repeat"
            aria-label="Toggle repeat"
          >
            <Repeat className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Progress Bar & Time */}
        <div className="space-y-1.5 mb-4">
          <div
            className="relative w-full h-1.5 bg-slate-100 hover:bg-slate-200 rounded-full cursor-pointer overflow-hidden transition-colors"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              seek(pct * duration);
            }}
          >
            <div
              className="absolute left-0 top-0 bottom-0 bg-[#1D64EC] rounded-full transition-all duration-150"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* Volume Slider */}
      <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
        <button
          onClick={toggleMute}
          className="text-slate-400 hover:text-slate-700 transition"
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted || volume === 0 ? (
            <VolumeX className="w-3.5 h-3.5 text-rose-500" />
          ) : (
            <Volume2 className="w-3.5 h-3.5" />
          )}
        </button>

        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={isMuted ? 0 : volume}
          onChange={(e) => setVolumeLevel(parseFloat(e.target.value))}
          className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1D64EC]"
          aria-label="Volume level"
        />
      </div>
    </div>
  );
}
