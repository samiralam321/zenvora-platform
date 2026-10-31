"use client";

import React, { useState, useMemo, useRef, useEffect, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { Youtube, Plus, Folder, Tv, ArrowRight, Play, Film, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

interface VideoItem {
  id: string;
  youtubeId: string;
  title: string;
  description?: string | null;
  thumbnail: string;
  duration?: string | null;
  channelName?: string | null;
  playlistId?: string | null;
  category?: { name: string; slug: string } | null;
}

interface PlaylistItem {
  id: string;
  title: string;
  slug: string;
  channelName?: string | null;
  categoryId?: string | null;
  category?: { name: string; slug: string } | null;
  videos?: VideoItem[];
}

interface TutorialsSectionProps {
  data?: {
    heading?: string;
    linkText?: string;
    linkUrl?: string;
  };
  videos?: VideoItem[];
  playlists?: PlaylistItem[];
  categories?: CategoryItem[];
}

export default function TutorialsSection({
  data = {},
  videos = [],
  playlists = [],
  categories = [],
}: TutorialsSectionProps) {
  const heading = data.heading || "Curated Lectures & Courses";
  const linkText = data.linkText || "Browse all courses";
  const linkUrl = data.linkUrl || "/watch-tutorials";

  const [isPending, startTransition] = useTransition();
  const [activeDomain, setActiveDomain] = useState<string>("all");
  const [deferredDomain, setDeferredDomain] = useState<string>("all");

  const handleDomainClick = (slug: string) => {
    setActiveDomain(slug);
    startTransition(() => {
      setDeferredDomain(slug);
    });
  };

  // Precomputed domain counts map: O(N) once, instead of repeated .filter in render loop
  const domainVideoCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const v of videos) {
      const slug = v.category?.slug;
      if (slug) map.set(slug, (map.get(slug) || 0) + 1);
    }
    return map;
  }, [videos]);

  // Refs for the separate-pill animation (pill is a standalone element, text never moves)
  const tabContainerRef = useRef<HTMLDivElement>(null);
  const allBtnRef = useRef<HTMLButtonElement>(null);
  const domBtnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [pillStyle, setPillStyle] = useState<{
    left: number; width: number; top: number; height: number;
  } | null>(null);

  // Determine available domains
  const availableDomains = useMemo(() => {
    if (categories.length > 0) return categories;
    const map = new Map<string, string>();
    videos.forEach((v) => {
      if (v.category?.slug && v.category?.name) {
        map.set(v.category.slug, v.category.name);
      }
    });
    return Array.from(map.entries()).map(([slug, name]) => ({ id: slug, slug, name }));
  }, [categories, videos]);

  // Filter playlists and videos by deferred domain (non-blocking)
  const filteredPlaylists = useMemo(() => {
    if (deferredDomain === "all") return playlists;
    return playlists.filter((p) => p.category?.slug === deferredDomain);
  }, [playlists, deferredDomain]);

  const filteredStandaloneVideos = useMemo(() => {
    const standalone = videos.filter((v) => !v.playlistId);
    if (deferredDomain === "all") return standalone;
    return standalone.filter((v) => v.category?.slug === deferredDomain);
  }, [videos, deferredDomain]);

  const totalItemCount = videos.length;

  // Measure active button to position the sliding pill independently of text
  useEffect(() => {
    let el: HTMLButtonElement | null = null;
    if (activeDomain === "all") {
      el = allBtnRef.current;
    } else {
      const idx = availableDomains.findIndex((d) => d.slug === activeDomain);
      el = idx >= 0 ? (domBtnRefs.current[idx] ?? null) : null;
    }
    if (!el) return;
    setPillStyle({
      left: el.offsetLeft,
      width: el.offsetWidth,
      top: el.offsetTop,
      height: el.offsetHeight,
    });
  }, [activeDomain, availableDomains]);

  return (
    <section id="lectures" className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEF4FF] text-[#1D64EC] text-xs font-bold mb-3 uppercase tracking-wider">
              <Youtube className="w-3.5 h-3.5 text-rose-500" />
              <span>Structured Channel Playlists &amp; Lectures</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              {heading}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Curated by learning domain and strictly organized into separate YouTube channel
              playlists so you always follow a cohesive, step-by-step roadmap.
            </p>
          </div>

          <Link
            href={linkUrl}
            className="border border-slate-200 hover:border-slate-300 bg-white text-slate-800 text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg transition-colors shrink-0 self-start sm:self-auto flex items-center gap-1.5 shadow-2xs"
          >
            <span>{linkText}</span>
            <span>&rarr;</span>
          </Link>
        </div>

        {/* Domain Filter Tabs — Animated Sliding Pill */}
        {availableDomains.length > 0 && (
          <div
            ref={tabContainerRef}
            className="relative flex items-center gap-1.5 overflow-x-auto pb-4 mb-10 scrollbar-hide border-b border-slate-100"
          >
            {/* Standalone pill — ONLY this element moves; text buttons are never transformed */}
            {pillStyle && (
              <motion.div
                className="absolute bg-[#1D64EC] rounded-xl shadow-xs pointer-events-none"
                initial={false}
                animate={{
                  left: pillStyle.left,
                  top: pillStyle.top,
                  width: pillStyle.width,
                  height: pillStyle.height,
                }}
                transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                style={{ zIndex: 0 }}
              />
            )}

            {/* All Domains button — completely stationary, z-index above pill */}
            <button
              ref={allBtnRef}
              onClick={() => handleDomainClick("all")}
              className={`relative z-10 shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                activeDomain === "all" ? "text-white" : "text-slate-700 hover:text-slate-900"
              }`}
            >
              All Domains ({totalItemCount})
            </button>

            {availableDomains.map((dom, idx) => {
              const domVideoCount = domainVideoCounts.get(dom.slug) || 0;
              const isActive = activeDomain === dom.slug;
              return (
                <button
                  key={dom.slug}
                  ref={(el) => { domBtnRefs.current[idx] = el; }}
                  onClick={() => handleDomainClick(dom.slug)}
                  className={`relative z-10 shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                    isActive ? "text-white" : "text-slate-700 hover:text-slate-900"
                  }`}
                >
                  {dom.name} ({domVideoCount})
                </button>
              );
            })}
          </div>
        )}

        {/* Grouped by Distinct Course Playlists */}
        <div className={`transition-opacity duration-150 ${isPending ? "opacity-60" : "opacity-100"}`}>
        {filteredPlaylists.length > 0 || filteredStandaloneVideos.length > 0 ? (
          <div className="space-y-12">
            {/* 1. Distinct Playlists / Courses */}
            {filteredPlaylists.map((playlist) => {
              const pVideos =
                playlist.videos && playlist.videos.length > 0
                  ? playlist.videos
                  : videos.filter((v) => v.playlistId === playlist.id);

              if (pVideos.length === 0) return null;

              return (
                <div
                  key={playlist.id}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 sm:p-8 space-y-6"
                >
                  {/* Playlist & Channel Course Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div className="flex items-start gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#1D64EC] shrink-0">
                        <Folder className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-bold text-slate-900 text-xl tracking-tight">
                            {playlist.title}
                          </h3>
                          <span className="text-[11px] font-bold bg-[#EEF4FF] text-[#1D64EC] px-2.5 py-0.5 rounded-full">
                            {playlist.category?.name || "Curriculum"}
                          </span>
                          {playlist.channelName && (
                            <span className="text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-100 px-2.5 py-0.5 rounded-md flex items-center gap-1.5">
                              <Tv className="w-3 h-3 text-rose-500" />
                              <span>{playlist.channelName}</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">
                          {pVideos.length} sequential lectures &bull; All lectures belonging to this
                          channel course are kept strictly together
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`${linkUrl}?playlist=${playlist.slug || playlist.id}`}
                      className="text-xs font-bold text-[#1D64EC] hover:underline flex items-center gap-1 shrink-0 self-start sm:self-center"
                    >
                      <span>Explore Full Playlist ({pVideos.length})</span>
                      <span>&rarr;</span>
                    </Link>
                  </div>

                  {/* Single Row of Preview Lectures (Max 3 on desktop, horizontal swipe on mobile/tablet) */}
                  <div className="flex overflow-x-auto pb-3 -mx-2 px-2 sm:mx-0 sm:px-0 sm:pb-0 lg:grid lg:grid-cols-3 gap-5 lg:gap-6 snap-x snap-mandatory scrollbar-hide">
                    {pVideos.slice(0, 3).map((video) => {
                      const youtubeUrl = `https://www.youtube.com/watch?v=${video.youtubeId}`;
                      return (
                        <div
                          key={video.id}
                          className="w-[82vw] max-w-[320px] sm:w-[calc(50%-10px)] sm:max-w-none lg:w-auto shrink-0 snap-start lg:shrink bg-white rounded-2xl border border-slate-100 hover:border-slate-300 shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col group"
                        >
                          <a
                            href={youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative aspect-video w-full overflow-hidden block bg-slate-100"
                          >
                            <Image
                              src={video.thumbnail}
                              alt={video.title}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-102"
                            />
                            {video.duration && (
                              <div className="absolute bottom-2.5 right-2.5 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
                                {video.duration}
                              </div>
                            )}

                          </a>

                          <div className="p-4 sm:p-5 flex flex-col justify-between flex-1">
                            <div>
                              <h4 className="font-bold text-slate-900 text-sm mb-1.5 line-clamp-2 hover:text-[#1D64EC] transition-colors leading-snug">
                                <a href={youtubeUrl} target="_blank" rel="noopener noreferrer">
                                  {video.title}
                                </a>
                              </h4>
                              {video.description && (
                                <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">
                                  {video.description}
                                </p>
                              )}
                            </div>

                            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                              <span className="text-[11px] text-slate-400 font-medium truncate max-w-[65%]">
                                {playlist.channelName || "YouTube Course"}
                              </span>
                              <a
                                href={youtubeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#1D64EC] font-semibold hover:underline flex items-center gap-1 shrink-0"
                              >
                                <span>Watch</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* 2. Standalone Individual Lectures (if any) */}
            {filteredStandaloneVideos.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 sm:p-8 space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                    <Film className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">
                      Individual Masterclasses &amp; Deep-Dives ({filteredStandaloneVideos.length})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Standalone conceptual lectures and comprehensive one-shot guides
                    </p>
                  </div>
                </div>

                {/* Single Row of Standalone Lectures (Max 3 on desktop, horizontal swipe on mobile/tablet) */}
                <div className="flex overflow-x-auto pb-3 -mx-2 px-2 sm:mx-0 sm:px-0 sm:pb-0 lg:grid lg:grid-cols-3 gap-5 lg:gap-6 snap-x snap-mandatory scrollbar-hide">
                  {filteredStandaloneVideos.slice(0, 3).map((video) => {
                    const youtubeUrl = `https://www.youtube.com/watch?v=${video.youtubeId}`;
                    return (
                      <div
                        key={video.id}
                        className="w-[82vw] max-w-[320px] sm:w-[calc(50%-10px)] sm:max-w-none lg:w-auto shrink-0 snap-start lg:shrink bg-white rounded-2xl border border-slate-100 hover:border-slate-300 shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col group"
                      >
                        <a
                          href={youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="relative aspect-video w-full overflow-hidden block bg-slate-100"
                        >
                          <Image
                            src={video.thumbnail}
                            alt={video.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-102"
                          />
                          {video.duration && (
                            <div className="absolute bottom-2.5 right-2.5 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
                              {video.duration}
                            </div>
                          )}
                        </a>

                        <div className="p-4 sm:p-5 flex flex-col justify-between flex-1">
                          <div>
                            <div className="mb-2">
                              <span className="inline-block bg-[#EEF4FF] text-[#1D64EC] font-semibold text-[11px] px-2.5 py-0.5 rounded-full">
                                {video.category?.name || "Curriculum"}
                              </span>
                            </div>
                            <h4 className="font-bold text-slate-900 text-sm mb-1.5 line-clamp-2 hover:text-[#1D64EC] transition-colors leading-snug">
                              <a href={youtubeUrl} target="_blank" rel="noopener noreferrer">
                                {video.title}
                              </a>
                            </h4>
                          </div>

                          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                            <span className="text-[11px] text-slate-400">
                              {video.channelName || "YouTube"}
                            </span>
                            <a
                              href={youtubeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#1D64EC] font-semibold hover:underline flex items-center gap-1 shrink-0"
                            >
                              <span>Watch</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-[#F8FAFC] border border-dashed border-slate-200 rounded-3xl p-10 sm:p-14 text-center max-w-2xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-[#EEF4FF] text-[#1D64EC] flex items-center justify-center mx-auto mb-4">
              <Youtube className="w-7 h-7 text-rose-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Curriculum Ready for Course Import
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6 max-w-md mx-auto">
              Select any domain (like DSA, Web Dev, or GenAI) in the Admin Panel and paste a YouTube
              channel playlist to automatically create an organized course track.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/admin/tutorials"
                className="btn-primary text-xs font-semibold py-2.5 px-5 rounded-lg flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Open Admin Importer</span>
              </Link>
            </div>
          </div>
        )}
        </div>
      </div>
    </section>
  );
}
