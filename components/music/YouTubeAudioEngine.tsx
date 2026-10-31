"use client";

import React, { useEffect, useRef, useState } from "react";
import { useMusic } from "@/context/MusicContext";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function YouTubeAudioEngine() {
  const {
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    play,
    pause,
    nextTrack,
  } = useMusic();

  const playerRef = useRef<any>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const lastTrackIdRef = useRef<string>(currentTrack.youtubeId);

  // 1. Load YouTube IFrame API once
  useEffect(() => {
    if (typeof window === "undefined") return;

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player) return;

      if (playerRef.current) return;

      try {
        playerRef.current = new window.YT.Player("zenvora-yt-audio-player", {
          height: "200",
          width: "200",
          videoId: currentTrack.youtubeId,
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            iv_load_policy: 3,
            origin: typeof window !== "undefined" ? window.location.origin : undefined,
          },
          events: {
            onReady: (event: any) => {
              setIsPlayerReady(true);
              event.target.setVolume(isMuted ? 0 : volume);
            },
            onStateChange: (event: any) => {
              // 0 = ENDED, 1 = PLAYING, 2 = PAUSED
              if (event.data === 0) {
                nextTrack();
              } else if (event.data === 1) {
                play();
              } else if (event.data === 2) {
                pause();
              }
            },
            onError: (err: any) => {
              console.warn("YouTube audio track error, auto-advancing:", err);
              setTimeout(() => {
                nextTrack();
              }, 1200);
            },
          },
        });
      } catch (e) {
        console.warn("Error initializing YouTube Player:", e);
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        initPlayer();
      };

      if (!document.getElementById("youtube-iframe-api")) {
        const script = document.createElement("script");
        script.id = "youtube-iframe-api";
        script.src = "https://www.youtube.com/iframe_api";
        script.async = true;
        document.body.appendChild(script);
      }
    }

    return () => {
      // Keep player persistent across route transitions
    };
  }, []);

  // 2. Track Change Synchronization
  useEffect(() => {
    if (!isPlayerReady || !playerRef.current) return;

    if (lastTrackIdRef.current !== currentTrack.youtubeId) {
      lastTrackIdRef.current = currentTrack.youtubeId;
      try {
        if (isPlaying) {
          playerRef.current.loadVideoById(currentTrack.youtubeId);
        } else {
          playerRef.current.cueVideoById(currentTrack.youtubeId);
        }
      } catch (e) {
        console.warn("Error changing track:", e);
      }
    }
  }, [currentTrack.youtubeId, isPlayerReady, isPlaying]);

  // 3. Play / Pause Synchronization
  useEffect(() => {
    if (!isPlayerReady || !playerRef.current) return;

    try {
      const state = playerRef.current.getPlayerState?.();
      if (isPlaying) {
        if (state !== 1 && state !== 3) {
          playerRef.current.playVideo();
        }
      } else {
        if (state === 1 || state === 3) {
          playerRef.current.pauseVideo();
        }
      }
    } catch (e) {}
  }, [isPlaying, isPlayerReady]);

  // 4. Volume / Mute Synchronization
  useEffect(() => {
    if (!isPlayerReady || !playerRef.current) return;

    try {
      if (isMuted) {
        playerRef.current.mute?.();
        playerRef.current.setVolume?.(0);
      } else {
        playerRef.current.unMute?.();
        playerRef.current.setVolume?.(volume);
      }
    } catch (e) {}
  }, [volume, isMuted, isPlayerReady]);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        bottom: "-500px",
        right: "-500px",
        width: "200px",
        height: "200px",
        opacity: 0.001,
        pointerEvents: "none",
        zIndex: -1,
      }}
    >
      <div id="zenvora-yt-audio-player" />
    </div>
  );
}
