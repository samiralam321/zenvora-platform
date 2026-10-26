"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X, Filter, Youtube, Plus, Folder, Tv, ExternalLink, Film } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface PlaylistItem {
  id: string;
  title: string;
  slug: string;
  channelName?: string | null;
  categoryId?: string | null;
  category?: Category | null;
  videos?: VideoItem[];
}

interface VideoItem {
  id: string;
  youtubeId: string;
  title: string;
  description?: string | null;
  thumbnail: string;
  duration?: string | null;
  publishedAt?: string | Date | null;
  channelName?: string | null;
  playlistId?: string | null;
  playlist?: {
    id: string;
    title: string;
    slug: string;
    channelName?: string | null;
  } | null;
  views: number;
  isShort: boolean;
  featured: boolean;
  categoryId?: string | null;
  category?: Category | null;
}

interface WatchTutorialsClientProps {
  initialVideos: VideoItem[];
  categories: Category[];
  playlists?: PlaylistItem[];
  initialCategory?: string;
  initialPlaylist?: string;
  watchModalEnabled?: boolean;
}

export default function WatchTutorialsClient({
  initialVideos,
  categories,
  playlists = [],
  initialCategory = "all",
  initialPlaylist = "all",
  watchModalEnabled = false,
}: WatchTutorialsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedPlaylist, setSelectedPlaylist] = useState(initialPlaylist);
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "featured">("newest");
  const [visibleCount, setVisibleCount] = useState(12);

  const allCategories = useMemo(() => {
    return [{ id: "all", name: "All Domains", slug: "all" }, ...categories];
  }, [categories]);

  // Playlists available in current domain
  const availablePlaylists = useMemo(() => {
    if (selectedCategory === "all") return playlists;
    return playlists.filter((p) => p.category?.slug === selectedCategory);
  }, [playlists, selectedCategory]);

  const filteredVideos = useMemo(() => {
    return initialVideos
      .filter((v) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = v.title.toLowerCase().includes(q);
          const matchesDesc = v.description?.toLowerCase().includes(q);
          const matchesChannel = v.channelName?.toLowerCase().includes(q);
          const matchesPlaylist = v.playlist?.title.toLowerCase().includes(q);
          if (!matchesTitle && !matchesDesc && !matchesChannel && !matchesPlaylist) return false;
        }

        if (selectedCategory !== "all" && v.category?.slug !== selectedCategory) {
          return false;
        }

        if (selectedPlaylist !== "all") {
          if (selectedPlaylist === "standalone") {
            if (v.playlistId) return false;
          } else {
            if (v.playlistId !== selectedPlaylist && v.playlist?.slug !== selectedPlaylist) {
              return false;
            }
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "featured") {
          if (a.featured !== b.featured) return a.featured ? -1 : 1;
        }
        if (sortBy === "oldest") {
          return new Date(a.publishedAt || 0).getTime() - new Date(b.publishedAt || 0).getTime();
        }
        return new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime();
      });
  }, [initialVideos, searchQuery, selectedCategory, selectedPlaylist, sortBy]);

  // Group filtered videos by playlist to preserve clean separation
  const playlistGroups = useMemo(() => {
    if (selectedPlaylist !== "all") return [];
    return availablePlaylists
      .map((p) => {
        const vids = filteredVideos.filter((v) => v.playlistId === p.id);
        return {
          playlist: p,
          videos: vids,
        };
      })
      .filter((g) => g.videos.length > 0);
  }, [availablePlaylists, filteredVideos, selectedPlaylist]);

  // When a specific playlist is selected, sub-group its videos by channelName
  // so mixed-source playlists (e.g. OOPS with CodeHelp + YouTube Playlist) render separately
  const channelSubGroups = useMemo(() => {
    if (selectedPlaylist === "all") return [];
    const groupMap = new Map<string, VideoItem[]>();
    filteredVideos.forEach((v) => {
      const ch = v.channelName || v.playlist?.channelName || "YouTube Course";
      if (!groupMap.has(ch)) groupMap.set(ch, []);
      groupMap.get(ch)!.push(v);
    });
    // Only split if there are genuinely multiple distinct channels
    if (groupMap.size <= 1) return [];
    return Array.from(groupMap.entries()).map(([channel, videos]) => ({
      channel,
      videos,
    }));
  }, [filteredVideos, selectedPlaylist]);

  const standaloneVideos = useMemo(() => {
    return filteredVideos.filter((v) => !v.playlistId);
  }, [filteredVideos]);

  return (
    <div className="pt-28 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white text-slate-900">
      {/* Page Header */}
      <div className="mb-10 text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEF4FF] text-[#1D64EC] text-xs font-bold mb-3 uppercase tracking-wider">
          <Folder className="w-3.5 h-3.5" />
          <span>Curated Learning Tracks &amp; Playlists</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-slate-900 tracking-tight mb-3">
          Tech Lectures &amp; Courses
        </h1>
        <p className="text-slate-500 text-base sm:text-lg max-w-2xl leading-relaxed">
          Step-by-step course tracks organized strictly by domain and YouTube channel playlist. No
          mixed lectures, no confusing jumps.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by topic, instructor, channel, or course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#1D64EC] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Sort:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:border-[#1D64EC] cursor-pointer bg-white"
          >
            <option value="newest">Newest First</option>
            <option value="featured">Featured First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Domain Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide border-b border-slate-100">
        {allCategories.map((cat) => {
          const isActive = selectedCategory === cat.slug;
          const count =
            cat.slug === "all"
              ? initialVideos.length
              : initialVideos.filter((v) => v.category?.slug === cat.slug).length;

          return (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.slug);
                setSelectedPlaylist("all");
              }}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? "bg-[#1D64EC] text-white shadow-2xs font-semibold"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Course Playlist Filter Pills (When multiple playlists exist in domain) */}
      {availablePlaylists.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 scrollbar-hide">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Courses:
          </span>
          <button
            onClick={() => setSelectedPlaylist("all")}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              selectedPlaylist === "all"
                ? "bg-slate-900 text-white"
                : "bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            All Courses ({availablePlaylists.length})
          </button>
          {availablePlaylists.map((p) => {
            const isActive = selectedPlaylist === p.id || selectedPlaylist === p.slug;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPlaylist(p.id)}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  isActive
                    ? "bg-[#1D64EC] text-white shadow-2xs"
                    : "bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Folder className="w-3.5 h-3.5" />
                <span>{p.title}</span>
                {p.channelName && (
                  <span className="opacity-70 text-[10px]">({p.channelName})</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* CP Component 1: Refer to website to get started with CP */}
      {selectedCategory === "competitive-programming" && (
        <div className="mb-10 rounded-2xl border-2 border-blue-100 bg-gradient-to-br from-[#F8FAFC] via-white to-[#EEF4FF]/50 p-6 sm:p-7 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EEF4FF] text-[#1D64EC]">
                Step 1 &bull; Getting Started with CP
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Refer to this website to get started with CP
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Start your competitive programming journey with CPMaster. Follow the structured beginner roadmap, language setups, and contest problem-solving guidance.
              </p>
            </div>
            <a
              href="https://cpmaster.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold"
            >
              <span>Visit CPMaster Website</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}

      {/* Videos & Playlists Content View */}
      {filteredVideos.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-slate-50 border border-dashed border-slate-200 p-8 max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-[#EEF4FF] text-[#1D64EC] flex items-center justify-center mx-auto mb-3">
            <Youtube className="w-6 h-6 text-rose-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            {initialVideos.length === 0 ? "No Lectures Imported Yet" : "No Matching Lectures Found"}
          </h3>
          <p className="text-slate-500 text-xs sm:text-sm mb-6 max-w-md mx-auto leading-relaxed">
            {initialVideos.length === 0
              ? "You haven't imported any lectures yet. Admins can paste any YouTube playlist link in the Admin Panel to populate this curriculum track."
              : "Try switching to 'All Domains' or clearing your search keywords."}
          </p>

          <div className="flex items-center justify-center gap-3">
            {initialVideos.length === 0 ? (
              <Link
                href="/admin/tutorials"
                className="btn-primary text-xs font-semibold py-2.5 px-5 rounded-lg flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Open Admin Importer</span>
              </Link>
            ) : (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedPlaylist("all");
                }}
                className="border border-slate-200 hover:border-slate-300 bg-white text-slate-700 text-xs font-semibold py-2.5 px-5 rounded-lg transition"
              >
                Reset All Filters
              </button>
            )}
          </div>
        </div>
      ) : selectedPlaylist === "all" && playlistGroups.length > 0 ? (
        /* Render Grouped by Playlists */
        <div className="space-y-12">
          {playlistGroups.map(({ playlist, videos: pVideos }) => (
            <div
              key={playlist.id}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 sm:p-8 space-y-6"
            >
              {/* Playlist Header */}
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
                      {pVideos.length} sequential lectures &bull; Channel course track
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedPlaylist(playlist.id)}
                  className="text-xs font-bold text-[#1D64EC] hover:underline flex items-center gap-1 shrink-0 self-start sm:self-center"
                >
                  <span>Focus this playlist only</span>
                  <span>&rarr;</span>
                </button>
              </div>

              {/* Grid of lectures inside playlist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {pVideos.map((video, vIdx) => {
                  const youtubeUrl = `https://www.youtube.com/watch?v=${video.youtubeId}`;
                  return (
                    <div
                      key={video.id}
                      className="bg-white rounded-2xl border border-slate-100 hover:border-slate-300 shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col group"
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

                      <div className="p-5 flex flex-col justify-between flex-1">
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
                          <span className="text-[11px] text-slate-400 font-medium">
                            {playlist.channelName || "YouTube Course"}
                          </span>
                          <a
                            href={youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#1D64EC] font-semibold hover:underline flex items-center gap-1"
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
          ))}

          {/* Standalone section if any */}
          {standaloneVideos.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                  <Film className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">
                    Individual Masterclasses &amp; Deep Dives ({standaloneVideos.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Standalone lectures not attached to a channel course series
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {standaloneVideos.map((video) => {
                  const youtubeUrl = `https://www.youtube.com/watch?v=${video.youtubeId}`;
                  return (
                    <div
                      key={video.id}
                      className="bg-white rounded-2xl border border-slate-100 hover:border-slate-300 shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col group"
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

                      <div className="p-5 flex flex-col justify-between flex-1">
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
                            className="text-[#1D64EC] font-semibold hover:underline flex items-center gap-1"
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
        /* Specific playlist selected — show channel sub-groups or flat grid */
        <div className="space-y-8">
          {/* Course header banner with back button */}
          {(() => {
            const currentP = playlists.find(
              (p) => p.id === selectedPlaylist || p.slug === selectedPlaylist
            );
            return (
              <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-50/80 via-white to-blue-50/30 border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-white border border-blue-100 flex items-center justify-center text-[#1D64EC] shrink-0 shadow-2xs">
                    <Folder className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h2 className="font-bold text-slate-900 text-xl tracking-tight">
                        {currentP?.title || "Course Playlist"}
                      </h2>
                      {currentP?.category?.name && (
                        <span className="text-[11px] font-bold bg-[#EEF4FF] text-[#1D64EC] px-2.5 py-0.5 rounded-full">
                          {currentP.category.name}
                        </span>
                      )}
                      {currentP?.channelName && (
                        <span className="text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-100 px-2.5 py-0.5 rounded-md flex items-center gap-1.5">
                          <Tv className="w-3 h-3 text-rose-500" />
                          <span>{currentP.channelName}</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      {channelSubGroups.length > 1
                        ? `${filteredVideos.length} total resources across ${channelSubGroups.length} learning series`
                        : `Showing all ${filteredVideos.length} sequential lectures in this course • Complete curriculum track`}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPlaylist("all")}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2 rounded-lg transition self-start sm:self-auto shrink-0 shadow-2xs"
                >
                  &larr; View All Courses
                </button>
              </div>
            );
          })()}

          {/* Multiple channel sub-groups: render each series in its own section */}
          {channelSubGroups.length > 1 ? (
            <div className="space-y-8">
              {channelSubGroups.map(({ channel, videos: subVideos }) => (
                <div
                  key={channel}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 sm:p-7 space-y-5"
                >
                  {/* Sub-group header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                        <Tv className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base tracking-tight">
                          {channel}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {subVideos.length} lecture{subVideos.length !== 1 ? "s" : ""} in this series
                        </p>
                      </div>
                    </div>
                    {subVideos.length > 3 && (
                      <span className="text-xs font-medium text-slate-400 self-start sm:self-center shrink-0">
                        Showing 3 of {subVideos.length} • scroll to watch more
                      </span>
                    )}
                  </div>

                  {/* Single-row preview: max 3 cards */}
                  <div className="flex overflow-x-auto pb-2 -mx-2 px-2 sm:mx-0 sm:px-0 sm:pb-0 lg:grid lg:grid-cols-3 gap-5 snap-x snap-mandatory scrollbar-hide">
                    {subVideos.slice(0, 3).map((video) => {
                      const youtubeUrl = `https://www.youtube.com/watch?v=${video.youtubeId}`;
                      return (
                        <div
                          key={video.id}
                          className="w-[80vw] max-w-[300px] sm:w-auto sm:max-w-none shrink-0 snap-start lg:shrink bg-white rounded-2xl border border-slate-100 hover:border-slate-300 shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col group"
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
                          <div className="p-4 flex flex-col justify-between flex-1">
                            <h4 className="font-bold text-slate-900 text-sm mb-1.5 line-clamp-2 hover:text-[#1D64EC] transition-colors leading-snug">
                              <a href={youtubeUrl} target="_blank" rel="noopener noreferrer">
                                {video.title}
                              </a>
                            </h4>
                            <div className="pt-3 mt-auto border-t border-slate-100 flex items-center justify-between text-xs">
                              <span className="text-[11px] text-slate-400 font-medium truncate max-w-[60%]">
                                {channel}
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
              ))}
            </div>
          ) : (
            /* Single channel: flat full grid of all lectures */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredVideos.map((video) => {
                const youtubeUrl = `https://www.youtube.com/watch?v=${video.youtubeId}`;
                return (
                  <div
                    key={video.id}
                    className="bg-white rounded-2xl border border-slate-100 shadow-2xs overflow-hidden flex flex-col hover:shadow-md transition-shadow group"
                  >
                    <a
                      href={youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative aspect-video w-full overflow-hidden block cursor-pointer bg-slate-100"
                    >
                      <Image
                        src={video.thumbnail}
                        alt={video.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-102"
                      />
                      {video.duration && (
                        <div className="absolute bottom-2.5 right-2.5 bg-black/80 text-white text-[11px] px-2 py-0.5 rounded font-mono">
                          {video.duration}
                        </div>
                      )}
                    </a>
                    <div className="p-6 flex flex-col justify-between flex-1">
                      <div>
                        <div className="flex items-center gap-2 mb-2.5">
                          <span className="inline-block bg-[#EEF4FF] text-[#1D64EC] font-semibold text-xs px-2.5 py-0.5 rounded-full">
                            {video.category?.name || "Tech Lecture"}
                          </span>
                          {video.channelName && (
                            <span className="inline-block bg-slate-100 text-slate-600 font-semibold text-[10px] px-2 py-0.5 rounded">
                              {video.channelName}
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-slate-900 text-lg mb-2 line-clamp-2 hover:text-[#1D64EC] transition-colors">
                          <a href={youtubeUrl} target="_blank" rel="noopener noreferrer">
                            {video.title}
                          </a>
                        </h3>
                        {video.description && (
                          <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed mb-4">
                            {video.description}
                          </p>
                        )}
                      </div>
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs text-slate-400">
                          {video.playlist?.title || "Course Video"}
                        </span>
                        <a
                          href={youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#1D64EC] font-semibold text-sm hover:underline inline-flex items-center gap-1"
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
          )}
        </div>
      )}

      {/* CP Component 3: Priyansh Agrawal CP Sheet (immediately after YouTube playlist) */}
      {selectedCategory === "competitive-programming" && (
        <div className="mt-12 rounded-2xl border-2 border-blue-100 bg-gradient-to-br from-[#F8FAFC] via-white to-[#EEF4FF]/50 p-6 sm:p-7 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EEF4FF] text-[#1D64EC]">
                Step 3 &bull; Curated Practice Sheet
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Follow this Sheet by Priyansh Agrawal
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Follow this official CP Sheet by Priyansh Agrawal (TLE Eliminators) to systematically solve Codeforces problems sorted by difficulty ratings (800 to 2000+) and contest topics.
              </p>
            </div>
            <a
              href="https://www.tle-eliminators.com/cp-sheet"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-xs sm:text-sm shadow-md transition-all"
            >
              <span>Open Priyansh Agrawal&rsquo;s CP Sheet</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
