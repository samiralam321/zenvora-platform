"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Search,
  ExternalLink,
  ArrowRight,
  GraduationCap,
  Globe,
  Heart,
  User,
  Users,
  Landmark,
  Building2,
  Wallet,
  Compass,
  Filter,
  X,
  CheckCircle2,
  Star,
  Award,
  Calendar,
  IndianRupee,
  Bookmark,
  Share2,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
  GitBranch,
  Briefcase,
  Code2,
  Users2,
  AlertCircle,
  Clock,
  MapPin,
  FileCheck,
  ShieldCheck,
} from "lucide-react";

export interface ScholarshipItem {
  id: string;
  name: string;
  slug: string;
  organization: string;
  organizationType: string | null;
  country: string | null;
  logoUrl: string | null;
  description: string;

  genderEligibility: string; // "all" | "girls" | "boys"
  eligibleDegrees: string | null;
  eligibleBranches: string | null;
  eligibleYears: string | null;
  minimumPercentage: number | null;
  familyIncomeLimit: number | null;
  nationality: string | null;
  categoryRestrictions: string | null;

  amount: number | null;
  amountType: string | null;
  amountText: string | null;
  currency: string | null;
  fundingType: string | null;
  duration: string | null;
  benefits: string | null;

  requiredDocuments: string | null;
  applicationProcess: string | null;
  scholarshipType: string | null;

  applicationStart: string | null;
  applicationDeadline: string | null;
  deadlineText: string | null;
  applicationStatus: string; // "open" | "upcoming" | "closed" | "year_round"

  officialUrl: string | null;
  applicationUrl: string | null;
  notificationUrl: string | null;
  lastVerified: string | null;
  verificationStatus?: string | null;
  verificationNotes?: string | null;

  isNational?: boolean;
  isVerified: boolean;
  isFeatured: boolean;
  isPublished: boolean;
  tags: string | null;
  displayOrder: number;
}

// ─── Scholarship Category Filter Tabs ──────────────────────────────────────────

const SCHOLARSHIP_CATEGORIES = [
  { key: "all", label: "All Scholarships", icon: Globe },
  { key: "girls", label: "For Girls", icon: Heart },
  { key: "national", label: "National", icon: Landmark },
  { key: "open_to_all", label: "Open to All", icon: Users },
  { key: "government", label: "Government", icon: Building2 },
  { key: "indian_companies", label: "Indian Companies", icon: Building2 },
  { key: "international", label: "International", icon: Compass },
  { key: "financial_aid", label: "Financial Aid", icon: Wallet },
];

// ─── Filter Options ────────────────────────────────────────────────────────────

const GENDER_OPTIONS = [
  { value: "all_genders", label: "All Genders" },
  { value: "girls_only", label: "Girls Only" },
  { value: "open_to_all", label: "Open to All" },
];

const ACADEMIC_YEAR_OPTIONS = [
  "All Years",
  "First Year",
  "Second Year",
  "Third Year",
  "Fourth Year",
  "Any Year",
  "Postgraduate",
];

const FIELD_OPTIONS = [
  "All Fields",
  "Computer Science",
  "Information Technology",
  "Artificial Intelligence",
  "Data Science",
  "Cybersecurity",
  "Electronics",
  "All Engineering Branches",
  "Other STEM Fields",
];

const SCHOLARSHIP_TYPE_OPTIONS = [
  "All Types",
  "Merit Based",
  "Need Based",
  "Merit-cum-Means",
  "Category Based",
  "Disability Based",
  "Research Based",
  "Sports Based",
  "Corporate Scholarship",
  "Government Scholarship",
];

const ORG_TYPE_OPTIONS = [
  "All Organizations",
  "Indian Government",
  "Indian Private Company",
  "International Company",
  "Foreign Government",
  "International Foundation",
  "University",
  "Non-Profit Organization",
];

const INCOME_LIMIT_OPTIONS = [
  { value: "all", label: "No Income Restriction" },
  { value: "100000", label: "Below ₹1 Lakh" },
  { value: "250000", label: "Below ₹2.5 Lakh" },
  { value: "500000", label: "Below ₹5 Lakh" },
  { value: "800000", label: "Below ₹8 Lakh" },
  { value: "1500000", label: "Below ₹15 Lakh" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "open", label: "Applications Open" },
  { value: "upcoming", label: "Upcoming" },
  { value: "closed", label: "Closed" },
  { value: "year_round", label: "Year-Round" },
];

const AMOUNT_RANGE_OPTIONS = [
  { value: "all", label: "All Amounts" },
  { value: "under_25k", label: "Below ₹25,000" },
  { value: "25k_50k", label: "₹25,000–₹50,000" },
  { value: "50k_100k", label: "₹50,000–₹1 Lakh" },
  { value: "100k_200k", label: "₹1 Lakh–₹2 Lakh" },
  { value: "above_200k", label: "Above ₹2 Lakh" },
  { value: "fully_funded", label: "Fully Funded" },
];

function parseJsonArray(val?: string | null): string[] {
  if (!val) return [];
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function ScholarshipsClient({
  initialScholarships,
}: {
  initialScholarships: ScholarshipItem[];
}) {
  const [scholarships] = useState<ScholarshipItem[]>(initialScholarships);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Advanced Filters
  const [filterGender, setFilterGender] = useState("all_genders");
  const [filterYear, setFilterYear] = useState("All Years");
  const [filterField, setFilterField] = useState("All Fields");
  const [filterType, setFilterType] = useState("All Types");
  const [filterOrgType, setFilterOrgType] = useState("All Organizations");
  const [filterIncome, setFilterIncome] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterAmount, setFilterAmount] = useState("all");
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  // Saved Bookmarks
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("zenvora_saved_scholarships");
      if (stored) setSavedIds(JSON.parse(stored));
    } catch {}
  }, []);

  const toggleSave = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    let updated: string[];
    if (savedIds.includes(id)) {
      updated = savedIds.filter((item) => item !== id);
    } else {
      updated = [...savedIds, id];
    }
    setSavedIds(updated);
    try {
      localStorage.setItem("zenvora_saved_scholarships", JSON.stringify(updated));
    } catch {}
  };

  const handleShare = (slug: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/opportunities/scholarships/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(slug);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const resetAllFilters = () => {
    setSearchQuery("");
    setActiveCategory("all");
    setFilterGender("all_genders");
    setFilterYear("All Years");
    setFilterField("All Fields");
    setFilterType("All Types");
    setFilterOrgType("All Organizations");
    setFilterIncome("all");
    setFilterStatus("all");
    setFilterAmount("all");
    setShowSavedOnly(false);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filterGender !== "all_genders") count++;
    if (filterYear !== "All Years") count++;
    if (filterField !== "All Fields") count++;
    if (filterType !== "All Types") count++;
    if (filterOrgType !== "All Organizations") count++;
    if (filterIncome !== "all") count++;
    if (filterStatus !== "all") count++;
    if (filterAmount !== "all") count++;
    if (showSavedOnly) count++;
    return count;
  }, [
    filterGender,
    filterYear,
    filterField,
    filterType,
    filterOrgType,
    filterIncome,
    filterStatus,
    filterAmount,
    showSavedOnly,
  ]);

  // ── Dynamic Statistics Row (Updated: Replaced For Boys with National) ──
  const stats = useMemo(() => {
    const total = scholarships.length;
    const open = scholarships.filter(
      (s) => s.applicationStatus === "open" || s.applicationStatus === "year_round"
    ).length;
    const girls = scholarships.filter((s) => s.genderEligibility === "girls").length;
    const national = scholarships.filter(
      (s) =>
        s.isNational === true ||
        (s.country?.toLowerCase() === "india" &&
          (s.organizationType?.toLowerCase().includes("government") ||
            s.organizationType?.toLowerCase().includes("private") ||
            s.organizationType?.toLowerCase().includes("non-profit")))
    ).length;
    const international = scholarships.filter(
      (s) =>
        !s.isNational &&
        (s.country?.toLowerCase() !== "india" ||
          s.organizationType?.toLowerCase().includes("international") ||
          s.organizationType?.toLowerCase().includes("foreign"))
    ).length;

    return { total, open, girls, national, international };
  }, [scholarships]);

  // ── Filtering Logic ──
  const filteredScholarships = useMemo(() => {
    return scholarships.filter((s) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = s.name.toLowerCase().includes(q);
        const matchesOrg = s.organization.toLowerCase().includes(q);
        const matchesCountry = (s.country || "").toLowerCase().includes(q);
        const matchesDesc = s.description.toLowerCase().includes(q);
        const matchesDegrees = (s.eligibleDegrees || "").toLowerCase().includes(q);
        const matchesBranches = (s.eligibleBranches || "").toLowerCase().includes(q);
        const matchesYears = (s.eligibleYears || "").toLowerCase().includes(q);
        const matchesFunding = (s.fundingType || "").toLowerCase().includes(q);
        const matchesTags = (s.tags || "").toLowerCase().includes(q);

        if (
          !matchesName &&
          !matchesOrg &&
          !matchesCountry &&
          !matchesDesc &&
          !matchesDegrees &&
          !matchesBranches &&
          !matchesYears &&
          !matchesFunding &&
          !matchesTags
        ) {
          return false;
        }
      }

      // 2. Category Tab
      if (activeCategory === "girls" && s.genderEligibility !== "girls") return false;
      if (activeCategory === "national" && !s.isNational) return false;
      if (activeCategory === "open_to_all" && s.genderEligibility !== "all") return false;
      if (
        activeCategory === "government" &&
        !s.organizationType?.toLowerCase().includes("government")
      )
        return false;
      if (
        activeCategory === "indian_companies" &&
        !s.organizationType?.toLowerCase().includes("indian private")
      )
        return false;
      if (
        activeCategory === "international" &&
        s.country?.toLowerCase() === "india" &&
        !s.organizationType?.toLowerCase().includes("international") &&
        !s.organizationType?.toLowerCase().includes("foreign")
      )
        return false;
      if (
        activeCategory === "financial_aid" &&
        !s.fundingType?.toLowerCase().includes("need") &&
        !s.fundingType?.toLowerCase().includes("means")
      )
        return false;

      // 3. Dropdown Gender Filter
      if (filterGender === "girls_only" && s.genderEligibility !== "girls") return false;
      if (filterGender === "open_to_all" && s.genderEligibility !== "all") return false;

      // 4. Academic Year
      if (filterYear !== "All Years") {
        if (!s.eligibleYears?.toLowerCase().includes(filterYear.toLowerCase()) && !s.eligibleYears?.toLowerCase().includes("any")) {
          return false;
        }
      }

      // 5. Field of Study
      if (filterField !== "All Fields") {
        const b = (s.eligibleBranches || "").toLowerCase();
        const f = filterField.toLowerCase();
        if (!b.includes(f) && !b.includes("all engineering") && !b.includes("stem") && !b.includes("all branches")) {
          return false;
        }
      }

      // 6. Scholarship Type
      if (filterType !== "All Types") {
        const st = (s.scholarshipType || s.fundingType || "").toLowerCase();
        if (!st.includes(filterType.toLowerCase())) return false;
      }

      // 7. Organization Type
      if (filterOrgType !== "All Organizations") {
        if (s.organizationType?.toLowerCase() !== filterOrgType.toLowerCase()) return false;
      }

      // 8. Income Limit
      if (filterIncome !== "all") {
        const threshold = parseFloat(filterIncome);
        if (s.familyIncomeLimit && s.familyIncomeLimit > threshold) return false;
      }

      // 9. Application Status
      if (filterStatus !== "all") {
        if (filterStatus === "open" && s.applicationStatus !== "open" && s.applicationStatus !== "year_round")
          return false;
        if (filterStatus === "upcoming" && s.applicationStatus !== "upcoming") return false;
        if (filterStatus === "closed" && s.applicationStatus !== "closed") return false;
        if (filterStatus === "year_round" && s.applicationStatus !== "year_round") return false;
      }

      // 10. Amount Range
      if (filterAmount !== "all") {
        if (filterAmount === "fully_funded" && s.amountType !== "fully_funded") return false;
        if (filterAmount === "under_25k" && (!s.amount || s.amount > 25000)) return false;
        if (filterAmount === "25k_50k" && (!s.amount || s.amount < 25000 || s.amount > 50000)) return false;
        if (filterAmount === "50k_100k" && (!s.amount || s.amount < 50000 || s.amount > 100000)) return false;
        if (filterAmount === "100k_200k" && (!s.amount || s.amount < 100000 || s.amount > 200000)) return false;
        if (filterAmount === "above_200k" && (!s.amount || s.amount < 200000)) return false;
      }

      // 11. Saved Only
      if (showSavedOnly && !savedIds.includes(s.id)) return false;

      return true;
    });
  }, [
    scholarships,
    searchQuery,
    activeCategory,
    filterGender,
    filterYear,
    filterField,
    filterType,
    filterOrgType,
    filterIncome,
    filterStatus,
    filterAmount,
    showSavedOnly,
    savedIds,
  ]);

  return (
    <div className="space-y-6 pb-20">
      {/* ── Hero Section (Matching Specification) ───────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center pt-6 sm:pt-8">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EEF4FF] border border-blue-200/80 text-[#1D64EC] text-xs font-bold mb-4 shadow-2xs">
          <GraduationCap className="w-4 h-4 text-[#1D64EC]" />
          <span className="uppercase tracking-wider">STUDENT SCHOLARSHIPS</span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-5xl lg:text-[52px] font-black text-slate-900 tracking-tight leading-[1.15] mb-3">
          Discover Scholarships.{" "}
          <span className="text-[#1D64EC] block sm:inline">Fund Your Future.</span>
        </h1>

        {/* Description */}
        <p className="text-slate-600 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl mx-auto mb-6 font-normal">
          Discover scholarships, financial aid, and educational funding opportunities from trusted Indian
          and international organizations, curated for engineering and computer science students.
        </p>

        {/* Search Bar */}
        <div className="relative max-w-xl mx-auto mb-6">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scholarships, organizations, or eligibility..."
              className="w-full pl-11 pr-10 py-3.5 bg-white border border-slate-200/90 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1D64EC] focus:ring-4 focus:ring-[#1D64EC]/10 shadow-sm transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* ── Updated Dynamic Statistics Row: Total | Open | For Girls | National | International ── */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 max-w-3xl mx-auto pt-2 pb-4 border-t border-slate-100">
          <div className="text-center p-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{stats.total}</div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
              Total Scholarships
            </div>
          </div>
          <div className="text-center p-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">{stats.open}</div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
              Applications Open
            </div>
          </div>
          <div className="text-center p-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-pink-600">{stats.girls}</div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
              For Girls
            </div>
          </div>
          <div className="text-center p-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#1D64EC]">{stats.national}</div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
              National
            </div>
          </div>
          <div className="text-center p-2 col-span-2 sm:col-span-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-violet-600">{stats.international}</div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
              International
            </div>
          </div>
        </div>
      </section>

      {/* ── Scholarship Category Navigation Bar ──────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {SCHOLARSHIP_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.key;
            const Icon = cat.icon;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-[#1D64EC] text-white shadow-sm"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/60"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Filters Bar & Active Indicators ───────────────────────────────── */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition ${
                filtersOpen || activeFilterCount > 0
                  ? "bg-[#EEF4FF] text-[#1D64EC] border-blue-200"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#1D64EC] text-white text-[10px] flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
              {filtersOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => setShowSavedOnly(!showSavedOnly)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                showSavedOnly
                  ? "bg-amber-50 text-amber-700 border-amber-300"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${showSavedOnly ? "fill-amber-500 text-amber-500" : ""}`} />
              <span>Saved ({savedIds.length})</span>
            </button>

            {activeFilterCount > 0 && (
              <button
                onClick={resetAllFilters}
                className="text-xs text-rose-600 hover:underline font-semibold px-2 py-1"
              >
                Clear all filters
              </button>
            )}
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-800">{filteredScholarships.length}</span>{" "}
            {filteredScholarships.length === 1 ? "scholarship" : "scholarships"}
          </div>
        </div>

        {/* ── Expandable Filter Panel ────────────────────────────────────────── */}
        {filtersOpen && (
          <div className="mt-4 p-5 sm:p-6 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-5 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Gender */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Gender Eligibility
                </label>
                <select
                  value={filterGender}
                  onChange={(e) => setFilterGender(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#1D64EC]"
                >
                  {GENDER_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Academic Year */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Academic Year
                </label>
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#1D64EC]"
                >
                  {ACADEMIC_YEAR_OPTIONS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              {/* Field of Study */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Field of Study
                </label>
                <select
                  value={filterField}
                  onChange={(e) => setFilterField(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#1D64EC]"
                >
                  {FIELD_OPTIONS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              {/* Scholarship Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Scholarship Type
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#1D64EC]"
                >
                  {SCHOLARSHIP_TYPE_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Organization Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Organization Type
                </label>
                <select
                  value={filterOrgType}
                  onChange={(e) => setFilterOrgType(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#1D64EC]"
                >
                  {ORG_TYPE_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>

              {/* Family Income Limit */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Family Income Limit
                </label>
                <select
                  value={filterIncome}
                  onChange={(e) => setFilterIncome(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#1D64EC]"
                >
                  {INCOME_LIMIT_OPTIONS.map((i) => (
                    <option key={i.value} value={i.value}>
                      {i.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Application Status */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Application Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#1D64EC]"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Scholarship Amount */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Scholarship Amount
                </label>
                <select
                  value={filterAmount}
                  onChange={(e) => setFilterAmount(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#1D64EC]"
                >
                  {AMOUNT_RANGE_OPTIONS.map((a) => (
                    <option key={a.value} value={a.value}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200/70">
              <button
                onClick={resetAllFilters}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/60 transition"
              >
                Reset Filters
              </button>
              <button
                onClick={() => setFiltersOpen(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#1D64EC] text-white hover:bg-[#1a56d4] transition shadow-xs"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ── Scholarship Cards Grid (3 col desktop, 2 col tablet, 1 col mobile) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {filteredScholarships.length === 0 ? (
          <div className="bg-slate-50/70 rounded-3xl border border-slate-200 p-8 sm:p-12 text-center max-w-xl mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#1D64EC] flex items-center justify-center mx-auto">
              <GraduationCap className="w-7 h-7" />
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              No scholarships match your filters
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Try clearing your search query or loosening your eligibility filters to discover more
              funding programs.
            </p>
            <div className="pt-2">
              <button
                onClick={resetAllFilters}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#1D64EC] text-white hover:bg-[#1a56d4] transition shadow-xs"
              >
                <span>Clear All Filters</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredScholarships.map((s) => {
              const isSaved = savedIds.includes(s.id);
              const isClosed = s.applicationStatus === "closed";

              return (
                <div
                  key={s.id}
                  className="group bg-white rounded-2xl border border-slate-200/90 hover:border-blue-300 hover:shadow-xl transition-all duration-300 flex flex-col p-5 sm:p-6 relative overflow-hidden"
                >
                  {/* Top Header: Org Info, Badges, Bookmark */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center shrink-0 text-slate-700 font-bold text-xs uppercase shadow-2xs">
                        {s.logoUrl ? (
                          <img
                            src={s.logoUrl}
                            alt={s.organization}
                            className="w-full h-full object-contain rounded-xl p-1"
                          />
                        ) : (
                          <span>{s.organization.slice(0, 2)}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-700 truncate">
                            {s.organization}
                          </span>
                          {s.isVerified && (
                            <span title="Verified by Zenvora">
                              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <span>{s.country || "India"}</span>
                          {s.organizationType && (
                            <>
                              <span>·</span>
                              <span className="truncate">{s.organizationType}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => toggleSave(s.id, e)}
                        className={`p-2 rounded-xl transition ${
                          isSaved
                            ? "bg-amber-50 text-amber-500 hover:bg-amber-100"
                            : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
                        }`}
                        title={isSaved ? "Saved" : "Save Scholarship"}
                      >
                        <Bookmark className={`w-4 h-4 ${isSaved ? "fill-amber-500" : ""}`} />
                      </button>
                    </div>
                  </div>

                  {/* Badges: Gender & Status */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {s.genderEligibility === "girls" ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-pink-50 text-pink-700 border border-pink-200/80">
                        <Heart className="w-3 h-3 fill-pink-500 text-pink-500" />
                        Girls Only
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80">
                        <Users className="w-3 h-3" />
                        Open to All
                      </span>
                    )}

                    {s.isNational && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#1D64EC] border border-blue-200/70">
                        <Landmark className="w-3 h-3" />
                        National
                      </span>
                    )}

                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        s.applicationStatus === "open"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : s.applicationStatus === "year_round"
                          ? "bg-sky-50 text-sky-700 border-sky-200"
                          : s.applicationStatus === "upcoming"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}
                    >
                      {s.applicationStatus === "open"
                        ? "Applications Open"
                        : s.applicationStatus === "year_round"
                        ? "Year-Round"
                        : s.applicationStatus === "upcoming"
                        ? "Upcoming"
                        : "Applications Closed"}
                    </span>
                  </div>

                  {/* Scholarship Name */}
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#1D64EC] transition-colors leading-snug mb-2 line-clamp-2">
                    <Link href={`/opportunities/scholarships/${s.slug}`}>{s.name}</Link>
                  </h3>

                  {/* Prominent Amount */}
                  <div className="mb-3.5">
                    <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-baseline gap-1.5">
                      <span>{s.amountText || "Amount Not Disclosed"}</span>
                    </div>
                    {s.fundingType && (
                      <span className="text-[11px] font-medium text-slate-500">
                        {s.fundingType} · {s.duration || "Course Duration"}
                      </span>
                    )}
                  </div>

                  {/* Eligibility Summary Checklist */}
                  <div className="bg-slate-50/80 rounded-xl p-3 space-y-1.5 mb-4 text-xs text-slate-600 border border-slate-100">
                    {s.eligibleYears && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">
                          Year: <strong>{s.eligibleYears}</strong>
                        </span>
                      </div>
                    )}
                    {s.eligibleDegrees && (
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">
                          Degree: <strong>{s.eligibleDegrees}</strong>
                        </span>
                      </div>
                    )}
                    {s.familyIncomeLimit && (
                      <div className="flex items-center gap-2">
                        <IndianRupee className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">
                          Income: <strong>Below ₹{(s.familyIncomeLimit / 100000).toFixed(1)} Lakh</strong>
                        </span>
                      </div>
                    )}
                    {s.minimumPercentage && (
                      <div className="flex items-center gap-2">
                        <Award className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">
                          Min Marks: <strong>{s.minimumPercentage}% aggregate</strong>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Deadline text */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-5 mt-auto">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{s.deadlineText || "Deadline not announced"}</span>
                  </div>

                  {/* Card Action Buttons: View Details & Official Website */}
                  <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                    <Link
                      href={`/opportunities/scholarships/${s.slug}`}
                      className="flex-1 bg-[#1D64EC] hover:bg-[#1a56d4] text-white text-xs font-bold py-2.5 px-3 rounded-xl transition text-center shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    {s.officialUrl && (
                      <a
                        href={s.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shrink-0 flex items-center gap-1"
                        title="Open Official Website"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                        <span className="hidden sm:inline">Official</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
