"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Youtube } from "lucide-react";

interface VideoThumbnailProps {
  thumbnail?: string | null;
  youtubeId?: string;
  title: string;
  alt?: string;
  className?: string;
  sizes?: string;
}

/**
 * Robust YouTube Thumbnail component with:
 * 1. Direct Edge CDN loading (unoptimized={true} prevents Next.js server proxy 404s & rate-limiting)
 * 2. Multi-tier fallback cascade (maxresdefault -> hqdefault -> mqdefault -> branded card)
 * 3. Smooth skeleton pulse while loading
 */
export default function VideoThumbnail({
  thumbnail,
  youtubeId,
  title,
  alt,
  className = "object-cover transition-transform duration-300 group-hover:scale-102",
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
}: VideoThumbnailProps) {
  // If thumbnail has maxresdefault, YouTube frequently 404s on 720p/standard videos.
  // We prefer hqdefault if maxresdefault is present, or fallback immediately.
  const getInitialSrc = () => {
    if (thumbnail && !thumbnail.includes("maxresdefault.jpg")) {
      return thumbnail;
    }
    if (youtubeId) {
      return `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
    }
    return thumbnail || (youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` : "");
  };

  const [src, setSrc] = useState<string>(getInitialSrc);
  const [hasError, setHasError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setSrc(getInitialSrc());
    setHasError(false);
    setLoaded(false);
  }, [thumbnail, youtubeId]);

  const handleError = () => {
    if (!youtubeId) {
      setHasError(true);
      return;
    }

    if (src.includes("maxresdefault")) {
      // Fallback 1: hqdefault is 100% guaranteed for all YouTube uploads
      setSrc(`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`);
    } else if (src.includes("hqdefault")) {
      // Fallback 2: mqdefault
      setSrc(`https://i.ytimg.com/vi/${youtubeId}/mqdefault.jpg`);
    } else {
      // Fallback 3: branded SVG card
      setHasError(true);
    }
  };

  if (hasError || !src) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white p-4 select-none">
        <div className="w-10 h-10 rounded-xl bg-rose-600/20 text-rose-500 flex items-center justify-center mb-2 shadow-sm border border-rose-500/30">
          <Youtube className="w-5 h-5 fill-rose-500" />
        </div>
        <p className="text-[11px] text-slate-300 text-center font-medium line-clamp-2 px-2 leading-tight">
          {title}
        </p>
      </div>
    );
  }

  return (
    <>
      {!loaded && <div className="absolute inset-0 bg-slate-200 animate-pulse" />}
      <Image
        src={src}
        alt={alt || title}
        fill
        sizes={sizes}
        unoptimized
        loading="lazy"
        className={`${className} ${loaded ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}
        onLoad={() => setLoaded(true)}
        onError={handleError}
      />
    </>
  );
}
