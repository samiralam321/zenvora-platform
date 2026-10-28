"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";

export interface Track {
  id: string;
  title: string;
  category: "Lo-fi Beats" | "Deep Focus" | "Ambient Sounds" | "Rain Sounds" | "Piano Focus";
  tags: string;
  durationSeconds: number;
  artworkUrl: string;
}

export const STUDY_PLAYLISTS: Track[] = [
  {
    id: "lofi-1",
    title: "Lo-fi Chill Beats",
    category: "Lo-fi Beats",
    tags: "Focus • Study • Relax",
    durationSeconds: 2700, // 45:00
    artworkUrl: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "lofi-2",
    title: "Late Night Code Session",
    category: "Lo-fi Beats",
    tags: "Late Night • Flow State",
    durationSeconds: 3600, // 60:00
    artworkUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "focus-1",
    title: "Deep Focus 432Hz Alpha Waves",
    category: "Deep Focus",
    tags: "Binaural • Clarity • Memory",
    durationSeconds: 3600,
    artworkUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "rain-1",
    title: "Gentle Rain on Study Window",
    category: "Rain Sounds",
    tags: "Atmospheric • Cozy • White Noise",
    durationSeconds: 5400,
    artworkUrl: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "piano-1",
    title: "Peaceful Piano Study Solos",
    category: "Piano Focus",
    tags: "Acoustic • Calm • Deep Learning",
    durationSeconds: 3000,
    artworkUrl: "https://images.unsplash.com/photo-1520523839898-50712825e617?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "ambient-1",
    title: "Celestial Ambient Pad",
    category: "Ambient Sounds",
    tags: "Ethereal • Minimalist • Calm",
    durationSeconds: 4200,
    artworkUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&auto=format&fit=crop&q=80",
  },
];

interface AudioContextType {
  tracks: Track[];
  currentTrack: Track;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  isRepeat: boolean;
  selectedCategory: string;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seek: (seconds: number) => void;
  setVolumeLevel: (val: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  selectCategory: (category: string) => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

export function StudyAudioProvider({ children }: { children: React.ReactNode }) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(744); // 12:24 default matching Reference Image 2
  const [volume, setVolume] = useState(0.75);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Lo-fi Beats");

  // Web Audio synthesizer references
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const synthNodesRef = useRef<any[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentTrack = STUDY_PLAYLISTS[currentTrackIndex] || STUDY_PLAYLISTS[0];

  // Initialize Web Audio graph
  const initAudioEngine = useCallback(() => {
    if (typeof window === "undefined") return;
    if (!audioCtxRef.current) {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const ctx = new AudioContextClass();
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(isMuted ? 0 : volume, ctx.currentTime);
        masterGain.connect(ctx.destination);

        audioCtxRef.current = ctx;
        gainNodeRef.current = masterGain;
      }
    }
    if (audioCtxRef.current?.state === "suspended") {
      audioCtxRef.current.resume();
    }
  }, [isMuted, volume]);

  // Start ambient audio synthesis according to category
  const startSoundscape = useCallback(
    (track: Track) => {
      initAudioEngine();
      const ctx = audioCtxRef.current;
      const master = gainNodeRef.current;
      if (!ctx || !master) return;

      // Stop previous sounds
      synthNodesRef.current.forEach((node) => {
        try {
          if (node.stop) node.stop();
          if (node.disconnect) node.disconnect();
        } catch (e) {}
      });
      synthNodesRef.current = [];

      const category = track.category;

      if (category === "Rain Sounds") {
        // Multi-layered filtered noise for natural rain
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0,
          b1 = 0,
          b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99 * b0 + white * 0.05;
          b1 = 0.95 * b1 + white * 0.1;
          b2 = 0.85 * b2 + white * 0.25;
          output[i] = (b0 + b1 + b2) * 0.3;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(1200, ctx.currentTime);

        const rainGain = ctx.createGain();
        rainGain.gain.setValueAtTime(0.4, ctx.currentTime);

        whiteNoise.connect(filter);
        filter.connect(rainGain);
        rainGain.connect(master);
        whiteNoise.start();

        synthNodesRef.current.push(whiteNoise, filter, rainGain);
      } else if (category === "Deep Focus") {
        // 432Hz Alpha wave binaural drone
        const oscLeft = ctx.createOscillator();
        const oscRight = ctx.createOscillator();
        const merger = ctx.createChannelMerger(2);
        const focusGain = ctx.createGain();

        oscLeft.type = "sine";
        oscLeft.frequency.setValueAtTime(432, ctx.currentTime);

        oscRight.type = "sine";
        oscRight.frequency.setValueAtTime(438, ctx.currentTime); // 6Hz binaural beat for deep study focus

        focusGain.gain.setValueAtTime(0.15, ctx.currentTime);

        oscLeft.connect(merger, 0, 0);
        oscRight.connect(merger, 0, 1);
        merger.connect(focusGain);
        focusGain.connect(master);

        oscLeft.start();
        oscRight.start();

        synthNodesRef.current.push(oscLeft, oscRight, merger, focusGain);
      } else {
        // Warm Lo-fi / Piano / Ambient Chords
        const rootFreqs = category === "Piano Focus" ? [261.63, 329.63, 392.0] : [220, 261.63, 329.63, 392.0];
        rootFreqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const oscGain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          osc.type = category === "Ambient Sounds" ? "sine" : "triangle";
          osc.frequency.setValueAtTime(freq, ctx.currentTime);

          filter.type = "lowpass";
          filter.frequency.setValueAtTime(category === "Ambient Sounds" ? 400 : 750, ctx.currentTime);

          oscGain.gain.setValueAtTime(0.08 / rootFreqs.length, ctx.currentTime);

          osc.connect(filter);
          filter.connect(oscGain);
          oscGain.connect(master);
          osc.start();

          synthNodesRef.current.push(osc, filter, oscGain);
        });
      }
    },
    [initAudioEngine]
  );

  const stopSoundscape = useCallback(() => {
    synthNodesRef.current.forEach((node) => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (e) {}
    });
    synthNodesRef.current = [];
  }, []);

  // Update volume in gain node
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      const targetGain = isMuted ? 0 : volume;
      gainNodeRef.current.gain.setTargetAtTime(
        targetGain,
        audioCtxRef.current.currentTime,
        0.05
      );
    }
  }, [volume, isMuted]);

  // Timer loop when playing
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= currentTrack.durationSeconds) {
            return isRepeat ? 0 : 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentTrack.durationSeconds, isRepeat]);

  const play = useCallback(() => {
    setIsPlaying(true);
    startSoundscape(currentTrack);
  }, [currentTrack, startSoundscape]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    stopSoundscape();
  }, [stopSoundscape]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, pause, play]);

  const nextTrack = useCallback(() => {
    let nextIdx = (currentTrackIndex + 1) % STUDY_PLAYLISTS.length;
    if (isShuffle) {
      nextIdx = Math.floor(Math.random() * STUDY_PLAYLISTS.length);
    }
    setCurrentTrackIndex(nextIdx);
    setCurrentTime(0);
    if (isPlaying) {
      startSoundscape(STUDY_PLAYLISTS[nextIdx]);
    }
  }, [currentTrackIndex, isShuffle, isPlaying, startSoundscape]);

  const prevTrack = useCallback(() => {
    const prevIdx =
      (currentTrackIndex - 1 + STUDY_PLAYLISTS.length) % STUDY_PLAYLISTS.length;
    setCurrentTrackIndex(prevIdx);
    setCurrentTime(0);
    if (isPlaying) {
      startSoundscape(STUDY_PLAYLISTS[prevIdx]);
    }
  }, [currentTrackIndex, isPlaying, startSoundscape]);

  const seek = useCallback((seconds: number) => {
    setCurrentTime(seconds);
  }, []);

  const setVolumeLevel = useCallback((val: number) => {
    setVolume(val);
    if (val > 0) setIsMuted(false);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffle((prev) => !prev);
  }, []);

  const toggleRepeat = useCallback(() => {
    setIsRepeat((prev) => !prev);
  }, []);

  const selectCategory = useCallback(
    (cat: string) => {
      setSelectedCategory(cat);
      const foundIdx = STUDY_PLAYLISTS.findIndex((t) => t.category === cat);
      if (foundIdx !== -1) {
        setCurrentTrackIndex(foundIdx);
        setCurrentTime(0);
        if (isPlaying) {
          startSoundscape(STUDY_PLAYLISTS[foundIdx]);
        }
      }
    },
    [isPlaying, startSoundscape]
  );

  return (
    <AudioContext.Provider
      value={{
        tracks: STUDY_PLAYLISTS,
        currentTrack,
        isPlaying,
        currentTime,
        duration: currentTrack.durationSeconds,
        volume,
        isMuted,
        isShuffle,
        isRepeat,
        selectedCategory,
        play,
        pause,
        togglePlay,
        nextTrack,
        prevTrack,
        seek,
        setVolumeLevel,
        toggleMute,
        toggleShuffle,
        toggleRepeat,
        selectCategory,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useStudyAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useStudyAudio must be used within a StudyAudioProvider");
  }
  return context;
}
