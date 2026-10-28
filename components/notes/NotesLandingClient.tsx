"use client";

import React, { useState, useMemo } from "react";
import { Search, Sparkles, BookOpen, Layers } from "lucide-react";
import PinnedDomainCard from "@/components/notes/PinnedDomainCard";
import DottedConnector from "@/components/notes/DottedConnector";
import { NOTES_DOMAINS } from "@/lib/notesData";

export default function NotesLandingClient() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDomains = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return NOTES_DOMAINS;

    return NOTES_DOMAINS.filter((d) => {
      const matchName = d.name.toLowerCase().includes(q);
      const matchDesc = d.description.toLowerCase().includes(q);
      const matchTopics = d.topics.some((t) => t.toLowerCase().includes(q));
      const matchResources = d.resources.some(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.topic.toLowerCase().includes(q)
      );
      return matchName || matchDesc || matchTopics || matchResources;
    });
  }, [searchQuery]);

  return (
    <div className="relative min-h-screen bg-[#FDFCFB]">
      {/* ── Ruled Notebook Paper Faint Grid / Lines Background ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, transparent 31px, #E2E8F0 32px)",
          backgroundSize: "100% 32px",
        }}
        aria-hidden="true"
      />

      {/* ── Soft Ambient Radial Glow ── */}
      <div
        className="absolute top-16 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 20%, rgba(29, 100, 236, 0.06) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
        {/* ── Hero Section ── */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EEF4FF] border border-blue-200/80 text-[#1D64EC] text-xs font-bold mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#1D64EC]" />
            <span className="uppercase tracking-wider">YOUR LEARNING LIBRARY</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-4">
            Your Notes. Your{" "}
            <span className="text-[#1D64EC]">Learning Journey.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-600 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl mx-auto mb-8 font-normal">
            Explore carefully organized notes, handwritten PDFs, cheat sheets,
            and study resources across your favorite tech domains. Read online or
            download anytime.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes, subjects, or topics (e.g. Arrays, React, System Design)..."
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm shadow-sm focus:outline-none focus:border-[#1D64EC] focus:ring-4 focus:ring-[#1D64EC]/10 transition-all placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 text-xs font-semibold text-slate-400 hover:text-slate-700 p-1"
                >
                  Clear
                </button>
              )}
            </div>

            {searchQuery && (
              <p className="text-xs text-slate-500 mt-2 text-left px-1">
                Found {filteredDomains.length} domain(s) matching &quot;{searchQuery}&quot;
              </p>
            )}
          </div>
        </div>

        {/* ── Zigzag Pinned Cards Container (Reference Image 3) ── */}
        <div className="relative w-full max-w-5xl mx-auto">
          {/* Subtle curved dotted SVG connector weaving behind cards */}
          <DottedConnector count={filteredDomains.length} />

          {/* Vertical Alternating Pinned Cards */}
          <div className="relative z-10 flex flex-col space-y-2 md:space-y-4">
            {filteredDomains.map((domain, idx) => (
              <PinnedDomainCard
                key={domain.id}
                domain={domain}
                index={idx}
              />
            ))}
          </div>

          {filteredDomains.length === 0 && (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs max-w-md mx-auto">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900 mb-1">
                No matching notes found
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                We couldn&apos;t find any domains or notes matching &quot;{searchQuery}&quot;. Try another search term.
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="btn-primary text-xs font-semibold px-4 py-2"
              >
                Reset Search
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
