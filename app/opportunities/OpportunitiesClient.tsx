"use client";

import React, { useState, useMemo, useEffect, useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  ExternalLink,
  ArrowRight,
  Award,
  CheckCircle2,
  Globe,
  Filter,
  X,
  Star,
  Users,
  Users2,
  Code2,
  GitBranch,
  Briefcase,
  Heart,
  Trophy,
  ChevronDown,
  Zap,
  BookOpen,
} from "lucide-react";

export interface OpportunityItem {
  id: string;
  slug: string;
  title: string;
  organization: string;
  category: string;
  categories?: string | null;
  summary: string;
  contentType: string;
  youtubeUrl?: string | null;
  youtubeId?: string | null;
  thumbnail?: string | null;
  // New schema fields
  academicYears?: string | null;   // JSON array string
  eligibleDegrees?: string | null;
  eligibleBranches?: string | null;
  genderEligibility?: string | null;
  geographicRestrictions?: string | null;
  minQualifications?: string | null;
  eligibility?: string | null;
  participationType?: string | null;
  difficulty?: string | null;
  keyBenefit?: string | null;
  benefits?: string | null;
  howItWorks?: string | null;
  prepGuide?: string | null;
  applyProcess?: string | null;
  applicationUrl?: string | null;
  sourceUrl?: string | null;
  availabilityStatus?: string | null;
  isHistorical?: boolean;
  lastVerified?: string | null;
  tags?: string | null;
  tips?: string | null;
  faq?: string | null;
  featured: boolean;
  published: boolean;
  order: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  { key: "All Opportunities", label: "All Opportunities", icon: Globe, desc: "Browse every program and opportunity", color: "bg-slate-100 text-slate-700" },
  { key: "Hackathons", label: "Hackathons", icon: Zap, desc: "Build fast, compete hard, win big", color: "bg-orange-50 text-orange-700" },
  { key: "Open Source", label: "Open Source", icon: GitBranch, desc: "Contribute to real-world projects", color: "bg-emerald-50 text-emerald-700" },
  { key: "Internships", label: "Internships", icon: Briefcase, desc: "Gain professional experience", color: "bg-blue-50 text-blue-700" },
  { key: "Coding Contests", label: "Coding Contests", icon: Code2, desc: "Test your problem-solving skills", color: "bg-purple-50 text-purple-700" },
  { key: "Opportunities for Girls", label: "For Girls", icon: Heart, desc: "Programs built for women in tech", color: "bg-pink-50 text-pink-700" },
  { key: "Campus Ambassador Programs", label: "Ambassador", icon: Users2, desc: "Lead campus communities, grow your profile", color: "bg-violet-50 text-violet-700" },
];

const ACADEMIC_YEAR_OPTIONS = [
  "All Years",
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "Final Year",
  "Recent Graduates",
];

const AVAILABILITY_COLORS: Record<string, string> = {
  "Applications Open": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Year-Round": "bg-sky-50 text-sky-700 border-sky-200",
  "Applications Closed": "bg-red-50 text-red-600 border-red-200",
  "Historical Program": "bg-slate-100 text-slate-500 border-slate-200",
  "Information Available": "bg-amber-50 text-amber-700 border-amber-200",
  "Availability Unverified": "bg-slate-100 text-slate-500 border-slate-200",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  "Beginner Friendly": "bg-green-50 text-green-700",
  "Intermediate": "bg-yellow-50 text-yellow-700",
  "Advanced": "bg-red-50 text-red-600",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseJsonArray(val?: string | null): string[] {
  if (!val) return [];
  try {
    const arr = JSON.parse(val);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function getCategoryIcon(cat: string) {
  const found = CATEGORIES.find((c) => c.key === cat);
  return found?.icon || Globe;
}

// ─── Session storage key ──────────────────────────────────────────────────────

const SESSION_KEY = "zenvora_opp_state";

interface SavedState {
  activeCategory: string;
  searchQuery: string;
  academicYearFilter: string;
  genderFilter: string;
  participationFilter: string;
  difficultyFilter: string;
  availabilityFilter: string;
  showHistorical: boolean;
  filtersOpen: boolean;
  scrollY: number;
}

function loadState(): Partial<SavedState> {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveState(state: SavedState) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
  } catch {}
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function OpportunitiesClient({
  opportunities,
}: {
  opportunities: OpportunityItem[];
}) {
  // Always initialise with safe defaults (identical on server + client = no hydration mismatch).
  // State is restored from sessionStorage inside useLayoutEffect after hydration.
  const [activeCategory, setActiveCategory] = useState("All Opportunities");
  const [searchQuery, setSearchQuery] = useState("");
  const [academicYearFilter, setAcademicYearFilter] = useState("All Years");
  const [genderFilter, setGenderFilter] = useState("all");
  const [participationFilter, setParticipationFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [showHistorical, setShowHistorical] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const restoredRef = useRef(false);

  // Refs for the separate-pill animation — pill is a standalone element, text never moves
  const oppTabContainerRef = useRef<HTMLDivElement>(null);
  const oppBtnRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [oppPillStyle, setOppPillStyle] = useState<{
    left: number; width: number; top: number; height: number;
  } | null>(null);

  // Restore persisted state + scroll position on mount (client-only, after hydration)
  // Only restore scroll when navigating back from a detail page — not on fresh navbar clicks.
  useLayoutEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;

    const saved = loadState();
    if (saved.activeCategory) setActiveCategory(saved.activeCategory);
    if (saved.searchQuery) setSearchQuery(saved.searchQuery);
    if (saved.academicYearFilter) setAcademicYearFilter(saved.academicYearFilter);
    if (saved.genderFilter) setGenderFilter(saved.genderFilter);
    if (saved.participationFilter) setParticipationFilter(saved.participationFilter);
    if (saved.difficultyFilter) setDifficultyFilter(saved.difficultyFilter);
    if (saved.availabilityFilter) setAvailabilityFilter(saved.availabilityFilter);
    if (saved.showHistorical !== undefined) setShowHistorical(saved.showHistorical);
    if (saved.filtersOpen !== undefined) setFiltersOpen(saved.filtersOpen);

    // Only jump to saved scroll position when the user came back from a detail page.
    // Fresh navigation (navbar click, direct URL) always starts at the top.
    const cameFromDetail =
      typeof document !== "undefined" &&
      document.referrer.includes("/opportunities/");

    const y = saved.scrollY ?? 0;
    if (cameFromDetail && y > 0) {
      requestAnimationFrame(() => {
        window.scrollTo({ top: y, behavior: "instant" });
      });
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, []); // only on mount

  // Persist state whenever anything changes
  useEffect(() => {
    saveState({
      activeCategory,
      searchQuery,
      academicYearFilter,
      genderFilter,
      participationFilter,
      difficultyFilter,
      availabilityFilter,
      showHistorical,
      filtersOpen,
      scrollY: window.scrollY,
    });
  }, [
    activeCategory,
    searchQuery,
    academicYearFilter,
    genderFilter,
    participationFilter,
    difficultyFilter,
    availabilityFilter,
    showHistorical,
    filtersOpen,
  ]);

  // Also save scroll position continuously while the user browses
  useEffect(() => {
    const onScroll = () => {
      saveState({
        activeCategory,
        searchQuery,
        academicYearFilter,
        genderFilter,
        participationFilter,
        difficultyFilter,
        availabilityFilter,
        showHistorical,
        filtersOpen,
        scrollY: window.scrollY,
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, searchQuery, academicYearFilter, genderFilter, participationFilter, difficultyFilter, availabilityFilter, showHistorical, filtersOpen]);

  // ── Pill measurement — measure the active tab button to position the sliding pill ──
  useEffect(() => {
    const el = oppBtnRefs.current.get(activeCategory);
    if (!el) return;
    setOppPillStyle({
      left: el.offsetLeft,
      width: el.offsetWidth,
      top: el.offsetTop,
      height: el.offsetHeight,
    });
  }, [activeCategory]);

  // ── Derived Stats ─────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = opportunities.length;
    const openNow = opportunities.filter((o) => o.availabilityStatus === "Applications Open").length;
    const forGirls = opportunities.filter(
      (o) => o.genderEligibility === "Women Only / Female Candidates"
    ).length;
    const beginner = opportunities.filter((o) => o.difficulty === "Beginner Friendly").length;
    return { total, openNow, forGirls, beginner };
  }, [opportunities]);

  // ── Filtered List ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return opportunities.filter((opp) => {
      // Historical gate
      if (opp.isHistorical && !showHistorical) return false;

      // Category
      if (activeCategory !== "All Opportunities") {
        const primary = opp.category === activeCategory;
        let inExtra = false;
        if (opp.categories) {
          const extra = parseJsonArray(opp.categories);
          inExtra = extra.includes(activeCategory);
        }
        if (!primary && !inExtra) return false;
      }

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const haystack = `${opp.title} ${opp.organization} ${opp.summary} ${opp.keyBenefit || ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      // Academic year
      if (academicYearFilter !== "All Years") {
        const years = parseJsonArray(opp.academicYears);
        if (!years.includes("All Eligible Students") && !years.includes(academicYearFilter)) return false;
      }

      // Gender
      if (genderFilter === "women") {
        if (opp.genderEligibility !== "Women Only / Female Candidates") return false;
      }

      // Participation type
      if (participationFilter !== "all") {
        if (opp.participationType !== participationFilter) return false;
      }

      // Difficulty
      if (difficultyFilter !== "all") {
        if (opp.difficulty !== difficultyFilter) return false;
      }

      // Availability
      if (availabilityFilter !== "all") {
        if (opp.availabilityStatus !== availabilityFilter) return false;
      }

      return true;
    });
  }, [
    opportunities,
    activeCategory,
    searchQuery,
    academicYearFilter,
    genderFilter,
    participationFilter,
    difficultyFilter,
    availabilityFilter,
    showHistorical,
  ]);

  const featured = filtered.filter((o) => o.featured);
  const regular = filtered.filter((o) => !o.featured);

  const hasFilters =
    searchQuery ||
    academicYearFilter !== "All Years" ||
    genderFilter !== "all" ||
    participationFilter !== "all" ||
    difficultyFilter !== "all" ||
    availabilityFilter !== "all" ||
    showHistorical;

  const clearFilters = () => {
    setSearchQuery("");
    setAcademicYearFilter("All Years");
    setGenderFilter("all");
    setParticipationFilter("all");
    setDifficultyFilter("all");
    setAvailabilityFilter("all");
    setShowHistorical(false);
  };

  return (
    <div className="bg-white min-h-screen">
      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-[#EEF4FF] via-white to-[#F0FDF4] border-b border-slate-100 py-14 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#1D64EC] bg-[#EEF4FF] px-4 py-1.5 rounded-full mb-5">
            <Trophy className="w-3.5 h-3.5" />
            Student Opportunities
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-5">
            Discover Opportunities
            <br />
            <span className="text-[#1D64EC]">Beyond the Classroom</span>
          </h1>
          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            Hackathons, open-source programs, internships, coding contests, and exclusive
            programs for women in tech — curated for Indian engineering students.
          </p>

          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search programs, organizations…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-white shadow-sm text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1D64EC]/30 focus:border-[#1D64EC] transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Stats Strip */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mt-8">
            {[
              { label: "Total Programs", value: stats.total, color: "text-slate-800" },
              { label: "Applications Open", value: stats.openNow, color: "text-emerald-600" },
              { label: "For Women in Tech", value: stats.forGirls, color: "text-pink-600" },
              { label: "Beginner Friendly", value: stats.beginner, color: "text-blue-600" },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center">
                <div className={`text-3xl font-extrabold ${color}`}>{value}</div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Category Tabs ───────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-slate-100 sticky top-[68px] z-20 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={oppTabContainerRef}
            className="relative flex items-center gap-1 overflow-x-auto py-3 scrollbar-hide"
          >
            {/* Standalone sliding pill — only this element moves; icons and text never transform */}
            {oppPillStyle && (
              <motion.div
                className="absolute bg-[#1D64EC] rounded-xl shadow-sm pointer-events-none"
                initial={false}
                animate={{
                  left: oppPillStyle.left,
                  top: oppPillStyle.top,
                  width: oppPillStyle.width,
                  height: oppPillStyle.height,
                }}
                transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                style={{ zIndex: 0 }}
              />
            )}

            {CATEGORIES.map(({ key, label, icon: Icon }) => {
              // Ambassador tab links to its dedicated page — not part of the pill system
              if (key === "Campus Ambassador Programs") {
                return (
                  <Link
                    key={key}
                    href="/opportunities/campus-ambassador-programs"
                    className="relative z-10 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap text-slate-600 hover:text-violet-700"
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                );
              }
              const isActive = activeCategory === key;
              return (
                <button
                  key={key}
                  ref={(el) => {
                    if (el) oppBtnRefs.current.set(key, el);
                    else oppBtnRefs.current.delete(key);
                  }}
                  onClick={() => setActiveCategory(key)}
                  className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap ${
                    isActive ? "text-white" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Filters ─────────────────────────────────────────────────────────── */}
      <section className="bg-slate-50/70 border-b border-slate-100 py-3">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition ${
                filtersOpen || hasFilters
                  ? "bg-[#1D64EC] text-white border-[#1D64EC]"
                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasFilters && (
                <span className="bg-white/30 text-white rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none">
                  ON
                </span>
              )}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${filtersOpen ? "rotate-180" : ""}`} />
            </button>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-800">{filtered.length}</span> programs
              {hasFilters && (
                <button onClick={clearFilters} className="text-[#1D64EC] hover:underline font-medium ml-1">
                  Clear all
                </button>
              )}
            </div>
          </div>

          {filtersOpen && (
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pb-3">
              {/* Academic Year */}
              <select
                value={academicYearFilter}
                onChange={(e) => setAcademicYearFilter(e.target.value)}
                className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1D64EC]/30 font-medium"
              >
                {ACADEMIC_YEAR_OPTIONS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>

              {/* Gender */}
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1D64EC]/30 font-medium"
              >
                <option value="all">All Genders</option>
                <option value="women">Women Only</option>
              </select>

              {/* Participation */}
              <select
                value={participationFilter}
                onChange={(e) => setParticipationFilter(e.target.value)}
                className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1D64EC]/30 font-medium"
              >
                <option value="all">Any Format</option>
                <option value="Individual">Individual</option>
                <option value="Team">Team</option>
                <option value="Mentorship">Mentorship</option>
              </select>

              {/* Difficulty */}
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1D64EC]/30 font-medium"
              >
                <option value="all">Any Level</option>
                <option value="Beginner Friendly">Beginner Friendly</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>

              {/* Availability */}
              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1D64EC]/30 font-medium"
              >
                <option value="all">Any Status</option>
                <option value="Applications Open">Applications Open</option>
                <option value="Year-Round">Year-Round</option>
                <option value="Applications Closed">Applications Closed</option>
                <option value="Information Available">Info Available</option>
              </select>

              {/* Historical toggle */}
              <button
                onClick={() => setShowHistorical(!showHistorical)}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border transition ${
                  showHistorical
                    ? "bg-slate-200 text-slate-800 border-slate-300"
                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                {showHistorical ? "Hide Historical" : "Show Historical"}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Content Area ────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-7 h-7 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">No programs found</h3>
            <p className="text-slate-500 text-sm mb-4">Try adjusting your filters or search terms.</p>
            <button
              onClick={clearFilters}
              className="px-5 py-2.5 bg-[#1D64EC] text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            {/* Featured grid */}
            {featured.length > 0 && activeCategory === "All Opportunities" && (
              <div className="mb-10">
                <div className="flex items-center gap-2 mb-5">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <h2 className="text-lg font-extrabold text-slate-900">Featured Programs</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {featured.map((opp) => (
                    <OpportunityCard key={opp.id} opp={opp} featured />
                  ))}
                </div>
              </div>
            )}

            {/* All / regular */}
            {(activeCategory !== "All Opportunities" || regular.length > 0) && (
              <div>
                {featured.length > 0 && activeCategory === "All Opportunities" && (
                  <h2 className="text-lg font-extrabold text-slate-900 mb-5">All Programs</h2>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {(activeCategory !== "All Opportunities" ? filtered : regular).map((opp) => (
                    <OpportunityCard key={opp.id} opp={opp} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

// ─── Opportunity Card ─────────────────────────────────────────────────────────

function OpportunityCard({ opp, featured }: { opp: OpportunityItem; featured?: boolean }) {
  const academicYears = parseJsonArray(opp.academicYears);
  const availStatus = opp.availabilityStatus || "Information Available";
  const statusClass = AVAILABILITY_COLORS[availStatus] || AVAILABILITY_COLORS["Information Available"];
  const diffClass = opp.difficulty ? DIFFICULTY_COLORS[opp.difficulty] || "" : "";
  const CategoryIcon = getCategoryIcon(opp.category);
  const isWomenOnly = opp.genderEligibility === "Women Only / Female Candidates";

  // Persist scroll position into the existing sessionStorage entry before leaving
  const handleViewDetails = () => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      const existing = raw ? JSON.parse(raw) : {};
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...existing, scrollY: window.scrollY }));
    } catch {}
  };

  return (
    <div
      className={`group flex flex-col bg-white rounded-2xl border shadow-2xs overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5 ${
        featured ? "border-[#1D64EC]/30 ring-1 ring-[#1D64EC]/10" : "border-slate-200"
      }`}
    >
      {/* Card top accent bar */}
      {opp.isHistorical && (
        <div className="bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-widest text-center py-1.5 px-3 border-b border-slate-200">
          ⚠ Historical Program — No longer active
        </div>
      )}

      <div className="flex flex-col flex-1 p-5">
        {/* Header badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#EEF4FF] text-[#1D64EC]">
            <CategoryIcon className="w-3 h-3" />
            {opp.category}
          </span>

          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${statusClass}`}>
            {availStatus}
          </span>

          {featured && (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
              ⭐ Featured
            </span>
          )}

          {isWomenOnly && (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-pink-50 text-pink-700 border border-pink-200">
              ♀ Women Only
            </span>
          )}
        </div>

        {/* Title + Org */}
        <div className="mb-3">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            {opp.organization}
          </p>
          <h3 className="text-base font-extrabold text-slate-900 leading-snug group-hover:text-[#1D64EC] transition-colors">
            {opp.title}
          </h3>
        </div>

        {/* Summary */}
        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-4 flex-1">
          {opp.summary}
        </p>

        {/* Key Benefit */}
        {opp.keyBenefit && (
          <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2.5 mb-4">
            <Award className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs font-semibold text-emerald-800">{opp.keyBenefit}</p>
          </div>
        )}

        {/* Academic Year Pills */}
        <div className="mb-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Eligible Years
          </p>
          <div className="flex flex-wrap gap-1.5">
            {academicYears.length > 0 ? (
              academicYears.map((yr) => (
                <span
                  key={yr}
                  className="text-[11px] font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-lg"
                >
                  {yr}
                </span>
              ))
            ) : (
              <span className="text-[11px] text-slate-400 italic">Eligibility needs verification</span>
            )}
          </div>
        </div>

        {/* Meta tags row */}
        <div className="flex flex-wrap gap-2 mb-4">
          {opp.participationType && (
            <span className="flex items-center gap-1 text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg font-medium">
              <Users className="w-3 h-3" />
              {opp.participationType}
            </span>
          )}
          {opp.difficulty && (
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg ${diffClass}`}>
              {opp.difficulty}
            </span>
          )}
          {opp.geographicRestrictions && (
            <span className="flex items-center gap-1 text-[11px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded-lg">
              <Globe className="w-3 h-3" />
              {opp.geographicRestrictions}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-auto pt-3 border-t border-slate-100">
          <Link
            href={`/opportunities/${opp.slug}`}
            onClick={handleViewDetails}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#1D64EC] hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-2xs"
          >
            View Details
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {opp.applicationUrl && (
            <a
              href={opp.applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 px-3 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold rounded-xl transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Portal
            </a>
          )}
        </div>
      </div>
    </div>
  );
}


