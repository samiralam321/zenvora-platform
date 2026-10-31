"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { STUDY_TRACKS, Track, MUSIC_CATEGORIES } from "@/lib/musicData";

interface MusicContextType {
  tracks: Track[];
  currentTrackIndex: number;
  currentTrack: Track;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  activeCategory: string;
  isPopoverOpen: boolean;
  filteredTracks: Track[];
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  playTrackByIndex: (index: number) => void;
  playTrackById: (id: string) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  setActiveCategory: (cat: string) => void;
  setPopoverOpen: (open: boolean) => void;
  togglePopover: () => void;
}

const MusicContext = createContext<MusicContextType | null>(null);

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolumeState] = useState<number>(65);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [isPopoverOpen, setPopoverOpen] = useState<boolean>(false);

  // Restore saved volume on client
  useEffect(() => {
    try {
      const savedVol = localStorage.getItem("zenvora_focus_volume");
      if (savedVol !== null) {
        const v = parseInt(savedVol);
        if (!isNaN(v) && v >= 0 && v <= 100) {
          setVolumeState(v);
        }
      }
    } catch (e) {}
  }, []);

  const currentTrack = useMemo(
    () => STUDY_TRACKS[currentTrackIndex] || STUDY_TRACKS[0],
    [currentTrackIndex]
  );

  const filteredTracks = useMemo(() => {
    if (activeCategory === "All") return STUDY_TRACKS;
    return STUDY_TRACKS.filter((t) => t.category === activeCategory);
  }, [activeCategory]);

  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(v)));
    setVolumeState(clamped);
    if (clamped > 0 && isMuted) {
      setIsMuted(false);
    }
    try {
      localStorage.setItem("zenvora_focus_volume", clamped.toString());
    } catch (e) {}
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const play = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const playTrackByIndex = useCallback((index: number) => {
    if (index >= 0 && index < STUDY_TRACKS.length) {
      setCurrentTrackIndex(index);
      setIsPlaying(true);
    }
  }, []);

  const playTrackById = useCallback((id: string) => {
    const idx = STUDY_TRACKS.findIndex((t) => t.id === id);
    if (idx !== -1) {
      setCurrentTrackIndex(idx);
      setIsPlaying(true);
    }
  }, []);

  const nextTrack = useCallback(() => {
    setCurrentTrackIndex((prev) => (prev + 1) % STUDY_TRACKS.length);
    setIsPlaying(true);
  }, []);

  const prevTrack = useCallback(() => {
    setCurrentTrackIndex((prev) => (prev - 1 + STUDY_TRACKS.length) % STUDY_TRACKS.length);
    setIsPlaying(true);
  }, []);

  const togglePopover = useCallback(() => {
    setPopoverOpen((prev) => !prev);
  }, []);

  return (
    <MusicContext.Provider
      value={{
        tracks: STUDY_TRACKS,
        currentTrackIndex,
        currentTrack,
        isPlaying,
        volume,
        isMuted,
        activeCategory,
        isPopoverOpen,
        filteredTracks,
        play,
        pause,
        togglePlay,
        playTrackByIndex,
        playTrackById,
        nextTrack,
        prevTrack,
        setVolume,
        toggleMute,
        setActiveCategory,
        setPopoverOpen,
        togglePopover,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error("useMusic must be used within a MusicProvider");
  }
  return context;
}
