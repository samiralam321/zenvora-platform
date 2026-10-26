"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Search,
  ExternalLink,
  ArrowRight,
  Globe,
  X,
  Star,
  Users2,
  Filter,
  ChevronDown,
  CheckCircle2,
  Award,
} from "lucide-react";
import type { OpportunityItem } from "../OpportunitiesClient";

// ─── Constants ────────────────────────────────────────────────────────────────

const SUB_CATEGORIES = [
  { key: "All", label: "All Programs" },
  { key: "Developer Communities", label: "Developer Communities" },
  { key: "Cloud Computing", label: "Cloud Computing" },
  { key: "Coding and Competitive Programming", label: "Coding & Competitive" },
  { key: "AI and Machine Learning", label: "AI & ML" },
  { key: "Design and Creative Technology", label: "Design & Creative" },
  { key: "Career Development", label: "Career Development" },
  { key: "Campus Leadership", label: "Campus Leadership" },
];

const AVAILABILITY_COLORS: Record<string, string> = {
  "Applications Open": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Year-Round": "bg-sky-50 text-sky-700 border-sky-200",
  "Applications Closed": "bg-red-50 text-red-600 border-red-200",
  "Historical Program": "bg-slate-100 text-slate-500 border-slate-200",
  "Information Available": "bg-amber-50 text-amber-700 border-amber-200",
  "Availability Unverified": "bg-slate-100 text-slate-500 border-slate-200",
};

const STATUS_FILTERS = [
  "All Statuses",
  "Applications Open",
  "Year-Round",
  "Information Available",
  "Availability Unverified",
  "Applications Closed",
];

const SESSION_KEY = "zenvora_ambassador_state";

interface SavedState {
  subCategory: string;
  searchQuery: string;
  statusFilter: string;
  scrollY: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseJsonArray(val?: string | null): string[] {
  if (!val) return [];
  try {
    const arr = JSON.parse(val);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function getSubCategory(opp: OpportunityItem): string {
  const tags = parseJsonArray(opp.tags);
  return tags[0] || "Developer Communities";
}

// ─── Card Component ───────────────────────────────────────────────────────────

function AmbassadorCard({ opp, featured = false }: { opp: OpportunityItem; featured?: boolean }) {
  const status = opp.availabilityStatus || "Information Available";
  const statusColor =
    AVAILABILITY_COLORS[status] || "bg-slate-100 text-slate-500 border-slate-200";
  const benefits = parseJsonArray(opp.benefits);
  const subCat = getSubCategory(opp);

  return (
    <Link
      href={`/opportunities/${opp.slug}`}
      className={`group block bg-white border rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${
        featured ? "border-[#1D64EC]/20 shadow-sm" : "border-slate-100 shadow-2xs"
      }`}
    >
      <div className="p-5 sm:p-6 flex flex-col h-full">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            {featured && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#1D64EC] bg-blue-50 border border-blue-100 rounded-full px-2 py-0.5 mb-2">
                <Star className="w-2.5 h-2.5 fill-current" />
                Featured
              </span>
            )}
            <h3 className="text-sm sm:text-base font-semibold text-slate-900 leading-snug group-hover:text-[#1D64EC] transition-colors line-clamp-2">
              {opp.title}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">{opp.organization}</p>
          </div>
          <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
            <Users2 className="w-4 h-4 text-violet-600" />
          </span>
        </div>

        {/* Sub-category tag */}
        <div className="mb-3">
          <span className="inline-block text-[10px] font-medium text-violet-600 bg-violet-50 border border-violet-100 rounded-full px-2 py-0.5">
            {subCat}
          </span>
        </div>

        {/* Summary */}
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3 mb-4 flex-1">
          {opp.summary}
        </p>

        {/* Key benefit */}
        {opp.keyBenefit && (
          <div className="flex items-start gap-2 bg-slate-50 rounded-xl p-3 mb-4">
            <Award className="w-3.5 h-3.5 text-[#1D64EC] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-700 leading-relaxed line-clamp-2">{opp.keyBenefit}</p>
          </div>
        )}

        {/* Benefits list (max 2) */}
        {benefits.length > 0 && (
          <ul className="space-y-1 mb-4">
            {benefits.slice(0, 2).map((b, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="w-3 h-3 text-violet-500 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-slate-600 line-clamp-1">{b}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Footer row */}
        <div className="flex items-center justify-between gap-2 mt-auto pt-3 border-t border-slate-100">
          <span
            className={`inline-block text-[10px] font-semibold border rounded-full px-2.5 py-1 ${statusColor}`}
          >
            {status}
          </span>
          <span className="flex items-center gap-1 text-xs font-medium text-[#1D64EC] group-hover:gap-2 transition-all">
            View details <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AmbassadorClient({
  opportunities,
}: {
  opportunities: OpportunityItem[];
}) {
  const [subCategory, setSubCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const didRestoreRef = useRef(false);

  // ── Restore scroll state from sessionStorage ──
  useEffect(() => {
    if (didRestoreRef.current) return;
    didRestoreRef.current = true;

    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) {
        const saved: SavedState = JSON.parse(raw);
        if (saved.subCategory) setSubCategory(saved.subCategory);
        if (saved.searchQuery) setSearchQuery(saved.searchQuery);
        if (saved.statusFilter) setStatusFilter(saved.statusFilter);
        if (saved.scrollY) {
          requestAnimationFrame(() => {
            setTimeout(() => window.scrollTo({ top: saved.scrollY, behavior: "instant" }), 80);
          });
        }
      }
    } catch {}

    setHydrated(true);
  }, []);

  // ── Save state to sessionStorage on every change ──
  useEffect(() => {
    if (!hydrated) return;
    const state: SavedState = {
      subCategory,
      searchQuery,
      statusFilter,
      scrollY: window.scrollY,
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
  }, [subCategory, searchQuery, statusFilter, hydrated]);

  // ── Save scroll position on scroll ──
  useEffect(() => {
    if (!hydrated) return;
    const handleScroll = () => {
      try {
        const raw = sessionStorage.getItem(SESSION_KEY);
        const current = raw ? JSON.parse(raw) : {};
        sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...current, scrollY: window.scrollY }));
      } catch {}
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hydrated]);

  // ── Filter logic ──
  const filtered = useMemo(() => {
    return opportunities.filter((opp) => {
      // Sub-category filter
      if (subCategory !== "All") {
        const tags = parseJsonArray(opp.tags);
        if (!tags.includes(subCategory)) return false;
      }
      // Status filter
      if (statusFilter !== "All Statuses") {
        if (opp.availabilityStatus !== statusFilter) return false;
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const haystack = `${opp.title} ${opp.organization} ${opp.summary} ${opp.tags || ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [opportunities, subCategory, searchQuery, statusFilter]);

  const featured = useMemo(
    () => opportunities.filter((o) => o.featured),
    [opportunities]
  );

  const hasActiveFilters =
    subCategory !== "All" || statusFilter !== "All Statuses" || searchQuery.trim() !== "";

  const clearFilters = () => {
    setSubCategory("All");
    setStatusFilter("All Statuses");
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ── Hero ── */}
      <section className="bg-gradient-to-b from-violet-50/80 to-white border-b border-slate-100 px-4 sm:px-6 py-12 sm:py-16">
        <div className="max-w-5xl mx-auto text-center">
          {/* Breadcrumb */}
          <nav className="flex items-center justify-center gap-2 text-xs text-slate-500 mb-6">
            <Link href="/opportunities" className="hover:text-[#1D64EC] transition-colors">
              Opportunities
            </Link>
            <span>›</span>
            <span className="text-slate-700 font-medium">Campus Ambassador Programs</span>
          </nav>

          <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 text-xs font-semibold rounded-full px-3.5 py-1.5 mb-4">
            <Users2 className="w-3.5 h-3.5" />
            Student Leadership
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight mb-4">
            Campus Ambassador Programs
          </h1>
          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Lead your campus, build technical communities, connect with industry leaders, and grow
            your developer profile.
          </p>

          {/* Stats bar */}
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-slate-500">
            <span>
              <span className="font-semibold text-slate-800">{opportunities.length}</span> programs listed
            </span>
            <span className="w-px h-4 bg-slate-200" />
            <span>
              <span className="font-semibold text-slate-800">{featured.length}</span> featured
            </span>
            <span className="w-px h-4 bg-slate-200" />
            <span>
              <span className="font-semibold text-slate-800">
                {opportunities.filter((o) => o.availabilityStatus === "Year-Round").length}
              </span>{" "}
              year-round
            </span>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        {/* ── Featured Programs ── */}
        {featured.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-5">
              <Star className="w-4 h-4 text-[#1D64EC] fill-current" />
              <h2 className="text-lg font-semibold text-slate-900">Featured Campus Programs</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featured.map((opp) => (
                <AmbassadorCard key={opp.id} opp={opp} featured />
              ))}
            </div>
          </section>
        )}

        {/* ── Search & Filter Bar ── */}
        <div className="sticky top-[75px] z-20 bg-white/95 backdrop-blur-sm border-b border-slate-100 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search programs, organizations..."
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#1D64EC]/20 focus:border-[#1D64EC] placeholder-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#1D64EC]/20 focus:border-[#1D64EC] text-slate-700 cursor-pointer min-w-[180px]"
              >
                {STATUS_FILTERS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>

            {/* Clear filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* ── Sub-category tabs ── */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-8 scrollbar-hide">
          {SUB_CATEGORIES.map((sc) => (
            <button
              key={sc.key}
              onClick={() => setSubCategory(sc.key)}
              className={`flex-shrink-0 text-xs sm:text-sm font-medium px-4 py-2 rounded-full border transition-all ${
                subCategory === sc.key
                  ? "bg-violet-600 text-white border-violet-600 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:border-violet-300 hover:text-violet-700"
              }`}
            >
              {sc.label}
            </button>
          ))}
        </div>

        {/* ── Results header ── */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-800">{filtered.length}</span> program
            {filtered.length !== 1 ? "s" : ""}
            {subCategory !== "All" && (
              <span className="text-slate-400"> in {subCategory}</span>
            )}
          </p>
        </div>

        {/* ── Cards Grid ── */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((opp) => (
              <AmbassadorCard key={opp.id} opp={opp} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-4">
              <Users2 className="w-6 h-6 text-violet-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-700 mb-2">No programs found</h3>
            <p className="text-sm text-slate-500 mb-5">
              Try adjusting your filters or search query.
            </p>
            <button
              onClick={clearFilters}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-[#1D64EC] rounded-xl hover:bg-[#1850c5] transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* ── Bottom CTA ── */}
        <div className="mt-16 bg-violet-50 border border-violet-100 rounded-2xl p-8 text-center">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Looking for more opportunities?
          </h3>
          <p className="text-sm text-slate-600 mb-5 max-w-md mx-auto">
            Explore hackathons, open source programs, internships, coding contests, and more on the
            full Opportunities page.
          </p>
          <Link
            href="/opportunities"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#1D64EC] rounded-xl hover:bg-[#1850c5] transition-colors"
          >
            Browse All Opportunities
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
