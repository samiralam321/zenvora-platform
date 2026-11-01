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
  isShuffle: boolean;
  isRepeat: boolean;
  favorites: string[];
  recentlyPlayed: string[];
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  playTrackByIndex: (index: number) => void;
  playTrackById: (id: string) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
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
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [isRepeat, setIsRepeat] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<string[]>([]);

  // Restore saved settings & lists on client
  useEffect(() => {
    try {
      const savedVol = localStorage.getItem("zenvora_focus_volume");
      if (savedVol !== null) {
        const v = parseInt(savedVol);
        if (!isNaN(v) && v >= 0 && v <= 100) {
          setVolumeState(v);
        }
      }

      const savedFavs = localStorage.getItem("zenvora_music_favorites");
      if (savedFavs) {
        setFavorites(JSON.parse(savedFavs));
      }

      const savedRecents = localStorage.getItem("zenvora_music_recently_played");
      if (savedRecents) {
        setRecentlyPlayed(JSON.parse(savedRecents));
      }

      const savedShuffle = localStorage.getItem("zenvora_music_shuffle");
      if (savedShuffle !== null) {
        setIsShuffle(savedShuffle === "true");
      }

      const savedRepeat = localStorage.getItem("zenvora_music_repeat");
      if (savedRepeat !== null) {
        setIsRepeat(savedRepeat === "true");
      }
    } catch (e) {}
  }, []);

  const currentTrack = useMemo(
    () => STUDY_TRACKS[currentTrackIndex] || STUDY_TRACKS[0],
    [currentTrackIndex]
  );

  const filteredTracks = useMemo(() => {
    if (activeCategory === "All") return STUDY_TRACKS;
    if (activeCategory === "Ambient" || activeCategory === "Ambient & Nature") {
      return STUDY_TRACKS.filter((t) => t.category === "Ambient & Nature");
    }
    if (activeCategory === "Focus" || activeCategory === "Deep Focus") {
      return STUDY_TRACKS.filter((t) => t.category === "Deep Focus");
    }
    if (activeCategory === "Cinema" || activeCategory === "Cinematic") {
      return STUDY_TRACKS.filter((t) => t.category === "Cinematic");
    }
    if (activeCategory === "Sleep") {
      return STUDY_TRACKS.filter(
        (t) =>
          t.category === "Anime & Lofi" ||
          t.id.includes("night") ||
          t.id.includes("sleep") ||
          t.id.includes("3-am") ||
          t.id.includes("snowfall") ||
          t.id.includes("rain") ||
          t.id.includes("close-your-eyes")
      );
    }
    return STUDY_TRACKS.filter((t) => t.category === activeCategory);
  }, [activeCategory]);

  const recordRecentTrack = useCallback((trackId: string) => {
    setRecentlyPlayed((prev) => {
      const updated = [trackId, ...prev.filter((id) => id !== trackId)].slice(0, 30);
      try {
        localStorage.setItem("zenvora_music_recently_played", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  }, []);

  const toggleFavorite = useCallback((trackId: string) => {
    setFavorites((prev) => {
      const exists = prev.includes(trackId);
      const updated = exists ? prev.filter((id) => id !== trackId) : [...prev, trackId];
      try {
        localStorage.setItem("zenvora_music_favorites", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  }, []);

  const isFavorite = useCallback(
    (trackId: string) => {
      return favorites.includes(trackId);
    },
    [favorites]
  );

  const toggleShuffle = useCallback(() => {
    setIsShuffle((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("zenvora_music_shuffle", String(next));
      } catch (e) {}
      return next;
    });
  }, []);

  const toggleRepeat = useCallback(() => {
    setIsRepeat((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("zenvora_music_repeat", String(next));
      } catch (e) {}
      return next;
    });
  }, []);

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
      recordRecentTrack(STUDY_TRACKS[index].id);
    }
  }, [recordRecentTrack]);

  const playTrackById = useCallback((id: string) => {
    const idx = STUDY_TRACKS.findIndex((t) => t.id === id);
    if (idx !== -1) {
      setCurrentTrackIndex(idx);
      setIsPlaying(true);
      recordRecentTrack(STUDY_TRACKS[idx].id);
    }
  }, [recordRecentTrack]);

  const nextTrack = useCallback(() => {
    if (isRepeat) {
      // Repeat same track
      setIsPlaying(true);
      return;
    }
    if (isShuffle && STUDY_TRACKS.length > 1) {
      let rand = Math.floor(Math.random() * STUDY_TRACKS.length);
      while (rand === currentTrackIndex) {
        rand = Math.floor(Math.random() * STUDY_TRACKS.length);
      }
      setCurrentTrackIndex(rand);
      setIsPlaying(true);
      recordRecentTrack(STUDY_TRACKS[rand].id);
      return;
    }
    setCurrentTrackIndex((prev) => {
      const next = (prev + 1) % STUDY_TRACKS.length;
      recordRecentTrack(STUDY_TRACKS[next].id);
      return next;
    });
    setIsPlaying(true);
  }, [isRepeat, isShuffle, currentTrackIndex, recordRecentTrack]);

  const prevTrack = useCallback(() => {
    if (isRepeat) {
      setIsPlaying(true);
      return;
    }
    if (isShuffle && STUDY_TRACKS.length > 1) {
      let rand = Math.floor(Math.random() * STUDY_TRACKS.length);
      while (rand === currentTrackIndex) {
        rand = Math.floor(Math.random() * STUDY_TRACKS.length);
      }
      setCurrentTrackIndex(rand);
      setIsPlaying(true);
      recordRecentTrack(STUDY_TRACKS[rand].id);
      return;
    }
    setCurrentTrackIndex((prev) => {
      const prevIdx = (prev - 1 + STUDY_TRACKS.length) % STUDY_TRACKS.length;
      recordRecentTrack(STUDY_TRACKS[prevIdx].id);
      return prevIdx;
    });
    setIsPlaying(true);
  }, [isRepeat, isShuffle, currentTrackIndex, recordRecentTrack]);

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
        isShuffle,
        isRepeat,
        favorites,
        recentlyPlayed,
        play,
        pause,
        togglePlay,
        playTrackByIndex,
        playTrackById,
        nextTrack,
        prevTrack,
        toggleShuffle,
        toggleRepeat,
        toggleFavorite,
        isFavorite,
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
