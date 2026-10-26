"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Sparkles,
  Plus,
  Youtube,
  Edit,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Search,
  Building2,
  Award,
  Globe,
  Star,
  X,
  RefreshCw,
  Heart,
  Zap,
  GitBranch,
  Briefcase,
  Code2,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Opportunity {
  id: string;
  slug: string;
  title: string;
  organization: string;
  category: string;
  categories?: string | null;
  summary: string;
  content: string;
  contentType: "manual" | "video" | "combined";
  youtubeUrl?: string | null;
  youtubeId?: string | null;
  thumbnail?: string | null;
  // New eligibility fields
  academicYears?: string | null;
  eligibleDegrees?: string | null;
  eligibleBranches?: string | null;
  genderEligibility?: string | null;
  geographicRestrictions?: string | null;
  minQualifications?: string | null;
  eligibility?: string | null;
  participationType?: string | null;
  difficulty?: string | null;
  keyBenefit?: string | null;
  howItWorks?: string | null;
  prepGuide?: string | null;
  prerequisites?: string | null;
  benefits?: string | null;
  applyProcess?: string | null;
  applicationUrl?: string | null;
  sourceUrl?: string | null;
  availabilityStatus?: string | null;
  isHistorical?: boolean;
  lastVerified?: string | null;
  dates?: string | null;
  status: string;
  tags?: string | null;
  tips?: string | null;
  faq?: string | null;
  featured: boolean;
  published: boolean;
  publishedAt?: string | null;
  order: number;
  updatedAt: string;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const CATEGORIES = [
  "Hackathons",
  "Open Source",
  "Internships",
  "Coding Contests",
  "Opportunities for Girls",
  "Campus Ambassador Programs",
];

const AVAILABILITY_OPTIONS = [
  "Applications Open",
  "Applications Closed",
  "Year-Round",
  "Historical Program",
  "Information Available",
  "Availability Unverified",
];

const ACADEMIC_YEAR_OPTIONS = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "Final Year",
  "Recent Graduates",
  "All Eligible Students",
];

const EMPTY_FORM: Partial<Opportunity> = {
  title: "",
  slug: "",
  organization: "",
  category: "Hackathons",
  categories: "",
  summary: "",
  content: "",
  contentType: "manual",
  youtubeUrl: "",
  youtubeId: "",
  thumbnail: "",
  academicYears: JSON.stringify([]),
  eligibleDegrees: "",
  eligibleBranches: "",
  genderEligibility: "All Genders",
  geographicRestrictions: "India & Global",
  minQualifications: "",
  eligibility: "",
  participationType: "Individual",
  difficulty: "Beginner Friendly",
  keyBenefit: "",
  howItWorks: "",
  prepGuide: "",
  prerequisites: "",
  benefits: "",
  applyProcess: "",
  applicationUrl: "",
  sourceUrl: "",
  availabilityStatus: "Information Available",
  isHistorical: false,
  lastVerified: "",
  tags: "",
  tips: "",
  faq: JSON.stringify([]),
  featured: false,
  published: false,
  order: 0,
};

// ─── Component ─────────────────────────────────────────────────────────────────

export default function AdminOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [publishFilter, setPublishFilter] = useState("all");

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [ytUrl, setYtUrl] = useState("");
  const [extraNotes, setExtraNotes] = useState("");
  const [generatingDraft, setGeneratingDraft] = useState(false);

  const [currentOpp, setCurrentOpp] = useState<Partial<Opportunity>>(EMPTY_FORM);
  // Track selected academic years as an array in UI
  const [selectedYears, setSelectedYears] = useState<string[]>([]);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchOpportunities = async () => {
    try {
      const res = await fetch("/api/admin/opportunities");
      const data = await res.json();
      if (data.opportunities) setOpportunities(data.opportunities);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOpportunities(); }, []);

  // ── Modal helpers ──────────────────────────────────────────────────────────

  const openNewModal = () => {
    setCurrentOpp(EMPTY_FORM);
    setSelectedYears([]);
    setYtUrl("");
    setExtraNotes("");
    setMessage(null);
    setIsEditorOpen(true);
  };

  const openEditModal = (opp: Opportunity) => {
    setCurrentOpp(opp);
    try {
      const parsed = JSON.parse(opp.academicYears || "[]");
      setSelectedYears(Array.isArray(parsed) ? parsed : []);
    } catch {
      setSelectedYears([]);
    }
    setYtUrl(opp.youtubeUrl || "");
    setExtraNotes("");
    setMessage(null);
    setIsEditorOpen(true);
  };

  const closeModal = () => {
    setIsEditorOpen(false);
    setMessage(null);
  };

  // ── Year toggle ────────────────────────────────────────────────────────────

  const toggleYear = (yr: string) => {
    setSelectedYears((prev) => {
      if (yr === "All Eligible Students") return ["All Eligible Students"];
      const without = prev.filter((y) => y !== "All Eligible Students");
      return prev.includes(yr) ? without.filter((y) => y !== yr) : [...without, yr];
    });
  };

  // ── YouTube Draft ──────────────────────────────────────────────────────────

  const handleGenerateFromYouTube = async () => {
    if (!ytUrl.trim()) {
      setMessage({ type: "error", text: "Please enter a valid YouTube video URL." });
      return;
    }
    setGeneratingDraft(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/opportunities/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: ytUrl.trim(), extraNotes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate draft.");
      setCurrentOpp((prev) => ({ ...prev, ...data.draft, published: false }));
      setMessage({ type: "success", text: "Draft generated — review all details before publishing." });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to generate draft." });
    } finally {
      setGeneratingDraft(false);
    }
  };

  // ── Save ───────────────────────────────────────────────────────────────────

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentOpp.title?.trim() || !currentOpp.organization?.trim()) {
      setMessage({ type: "error", text: "Title and Organization are required." });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const isUpdating = Boolean(currentOpp.id);
      const payload = {
        ...currentOpp,
        academicYears: JSON.stringify(selectedYears),
      };
      const res = await fetch("/api/admin/opportunities", {
        method: isUpdating ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save.");
      setMessage({ type: "success", text: `Opportunity ${isUpdating ? "updated" : "created"} successfully!` });
      await fetchOpportunities();
      setIsEditorOpen(false);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Error saving opportunity." });
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/opportunities?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setOpportunities((prev) => prev.filter((o) => o.id !== id));
        setDeleteConfirmId(null);
        setMessage({ type: "success", text: "Opportunity deleted." });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to delete." });
    }
  };

  const togglePublish = async (opp: Opportunity) => {
    const updated = !opp.published;
    const res = await fetch("/api/admin/opportunities", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: opp.id, published: updated, publishedAt: updated ? new Date().toISOString() : null }),
    });
    if (res.ok) setOpportunities((prev) => prev.map((o) => (o.id === opp.id ? { ...o, published: updated } : o)));
  };

  const toggleFeatured = async (opp: Opportunity) => {
    const updated = !opp.featured;
    const res = await fetch("/api/admin/opportunities", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: opp.id, featured: updated }),
    });
    if (res.ok) setOpportunities((prev) => prev.map((o) => (o.id === opp.id ? { ...o, featured: updated } : o)));
  };

  // ── Filtered list ──────────────────────────────────────────────────────────

  const filtered = opportunities.filter((o) => {
    const q = search.toLowerCase();
    const matchSearch = !q || o.title.toLowerCase().includes(q) || o.organization.toLowerCase().includes(q);
    const matchCat = categoryFilter === "all" || o.category === categoryFilter;
    const matchPub =
      publishFilter === "all" ||
      (publishFilter === "published" && o.published) ||
      (publishFilter === "draft" && !o.published);
    return matchSearch && matchCat && matchPub;
  });

  const stats = {
    total: opportunities.length,
    published: opportunities.filter((o) => o.published).length,
    drafts: opportunities.filter((o) => !o.published).length,
    open: opportunities.filter((o) => o.availabilityStatus === "Applications Open").length,
  };

  const getCatIcon = (cat: string) => {
    switch (cat) {
      case "Hackathons": return <Zap className="w-3 h-3" />;
      case "Open Source": return <GitBranch className="w-3 h-3" />;
      case "Internships": return <Briefcase className="w-3 h-3" />;
      case "Coding Contests": return <Code2 className="w-3 h-3" />;
      case "Opportunities for Girls": return <Heart className="w-3 h-3" />;
      default: return <Globe className="w-3 h-3" />;
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEF4FF] text-[#1D64EC] text-xs font-bold mb-2 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Opportunities Admin</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Opportunities & Programs</h1>
          <p className="text-slate-500 text-sm mt-1">Curate verified programs for Indian engineering students.</p>
        </div>
        <button
          onClick={openNewModal}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition"
        >
          <Plus className="w-4 h-4" />
          Create Opportunity
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Programs", value: stats.total, color: "text-slate-900" },
          { label: "Published", value: stats.published, color: "text-emerald-600" },
          { label: "Drafts", value: stats.drafts, color: "text-amber-600" },
          { label: "Applications Open", value: stats.open, color: "text-[#1D64EC]" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
            <span className={`text-xs font-bold uppercase tracking-wider block ${color}`}>{label}</span>
            <span className={`text-2xl font-extrabold mt-1 block ${color}`}>{value}</span>
          </div>
        ))}
      </div>

      {/* Alert */}
      {message && (
        <div className={`p-4 rounded-xl text-sm font-medium flex items-center justify-between ${message.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
          <div className="flex items-center gap-2">
            {message.type === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)}><X className="w-4 h-4 text-slate-400 hover:text-slate-600" /></button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search title, organization…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-[#1D64EC]"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none">
            <option value="all">All Categories ({opportunities.length})</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={publishFilter} onChange={(e) => setPublishFilter(e.target.value)} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none">
            <option value="all">All Visibility</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
          <button onClick={fetchOpportunities} className="p-2 border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-600 transition">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <Loader2 className="w-8 h-8 animate-spin text-[#1D64EC] mx-auto mb-3" />
          <p className="text-sm text-slate-500">Loading opportunities…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200">
          <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No opportunities found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting filters or create a new program.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((opp) => {
            const avail = opp.availabilityStatus || "Information Available";
            const availColor =
              avail === "Applications Open" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
              avail === "Year-Round" ? "bg-sky-50 text-sky-700 border-sky-200" :
              avail === "Applications Closed" ? "bg-red-50 text-red-600 border-red-200" :
              avail === "Historical Program" ? "bg-slate-100 text-slate-500 border-slate-200" :
              "bg-amber-50 text-amber-700 border-amber-200";

            return (
              <div key={opp.id} className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 p-5 shadow-2xs hover:shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                    {opp.thumbnail ? (
                      <Image src={opp.thumbnail} alt={opp.title} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Award className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 font-bold text-[11px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#EEF4FF] text-[#1D64EC]">
                        {getCatIcon(opp.category)}{opp.category}
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${availColor}`}>{avail}</span>
                      {opp.isHistorical && <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">Historical</span>}
                      {opp.published ? (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">Published</span>
                      ) : (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">Draft</span>
                      )}
                      {opp.featured && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-indigo-500" /> Featured
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-900 text-base leading-snug">{opp.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5 text-slate-400" />{opp.organization}</span>
                      {opp.difficulty && <span className="text-slate-400">{opp.difficulty}</span>}
                      {opp.participationType && <span className="text-slate-400">{opp.participationType}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                  <a href={`/opportunities/${opp.slug}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition" title="View">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button onClick={() => toggleFeatured(opp)} className={`p-2 rounded-xl border transition ${opp.featured ? "bg-amber-50 border-amber-200 text-amber-600" : "border-slate-200 text-slate-400 hover:bg-slate-50"}`} title="Toggle Featured">
                    <Star className="w-4 h-4" />
                  </button>
                  <button onClick={() => togglePublish(opp)} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${opp.published ? "bg-slate-100 hover:bg-slate-200 text-slate-700" : "bg-emerald-600 hover:bg-emerald-700 text-white"}`}>
                    {opp.published ? "Unpublish" : "Publish"}
                  </button>
                  <button onClick={() => openEditModal(opp)} className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition" title="Edit">
                    <Edit className="w-4 h-4" />
                  </button>
                  {deleteConfirmId === opp.id ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleDelete(opp.id)} className="px-2.5 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold">Yes</button>
                      <button onClick={() => setDeleteConfirmId(null)} className="px-2.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">No</button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteConfirmId(opp.id)} className="p-2 rounded-xl border border-slate-200 hover:bg-red-50 hover:border-red-200 text-slate-400 hover:text-red-600 transition" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Editor Modal ──────────────────────────────────────────────────────── */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl my-6">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h2 className="text-lg font-extrabold text-slate-900">
                {currentOpp.id ? "Edit Opportunity" : "Create Opportunity"}
              </h2>
              <button onClick={closeModal} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500"><X className="w-5 h-5" /></button>
            </div>

            {/* Alert in modal */}
            {message && (
              <div className={`mx-6 mt-4 p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${message.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
                {message.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {message.text}
              </div>
            )}

            {/* YouTube importer */}
            {!currentOpp.id && (
              <div className="mx-6 mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <p className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                  <Youtube className="w-4 h-4 text-red-500" />
                  Import from YouTube (optional)
                </p>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={ytUrl}
                    onChange={(e) => setYtUrl(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#1D64EC]"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateFromYouTube}
                    disabled={generatingDraft}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {generatingDraft ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Youtube className="w-3.5 h-3.5" />}
                    Generate Draft
                  </button>
                </div>
                <textarea
                  placeholder="Extra notes for the AI (optional)…"
                  value={extraNotes}
                  onChange={(e) => setExtraNotes(e.target.value)}
                  rows={2}
                  className="mt-2 w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#1D64EC] resize-none"
                />
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSave} className="px-6 pb-6 pt-4 space-y-5">
              {/* Row: Title + Org */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Title *" required>
                  <input type="text" value={currentOpp.title || ""} onChange={(e) => setCurrentOpp((p) => ({ ...p, title: e.target.value }))} className={inputCls} required />
                </FormField>
                <FormField label="Organization *" required>
                  <input type="text" value={currentOpp.organization || ""} onChange={(e) => setCurrentOpp((p) => ({ ...p, organization: e.target.value }))} className={inputCls} required />
                </FormField>
              </div>

              {/* Row: Category + Availability Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Primary Category *">
                  <select value={currentOpp.category || "Hackathons"} onChange={(e) => setCurrentOpp((p) => ({ ...p, category: e.target.value }))} className={inputCls}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </FormField>
                <FormField label="Availability Status">
                  <select value={currentOpp.availabilityStatus || "Information Available"} onChange={(e) => setCurrentOpp((p) => ({ ...p, availabilityStatus: e.target.value }))} className={inputCls}>
                    {AVAILABILITY_OPTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </FormField>
              </div>

              {/* Summary */}
              <FormField label="Summary (1–2 lines)">
                <textarea value={currentOpp.summary || ""} onChange={(e) => setCurrentOpp((p) => ({ ...p, summary: e.target.value }))} rows={2} className={`${inputCls} resize-none`} />
              </FormField>

              {/* ── Eligibility Section ──────────────────────────────────── */}
              <div className="border border-slate-200 rounded-2xl p-4 space-y-4 bg-slate-50">
                <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-widest">Eligibility</h3>

                {/* Academic Years */}
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-2 block">Academic Year Eligibility (select all that apply)</label>
                  <div className="flex flex-wrap gap-2">
                    {ACADEMIC_YEAR_OPTIONS.map((yr) => (
                      <button
                        key={yr}
                        type="button"
                        onClick={() => toggleYear(yr)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition ${selectedYears.includes(yr) ? "bg-[#1D64EC] text-white border-[#1D64EC]" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"}`}
                      >
                        {yr}
                      </button>
                    ))}
                  </div>
                  {selectedYears.length === 0 && <p className="text-xs text-amber-600 mt-1">⚠ No year selected — will show "Eligibility needs verification"</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Eligible Degrees">
                    <input type="text" placeholder="B.Tech, B.E., BCA, MCA, M.Tech" value={currentOpp.eligibleDegrees || ""} onChange={(e) => setCurrentOpp((p) => ({ ...p, eligibleDegrees: e.target.value }))} className={inputCls} />
                  </FormField>
                  <FormField label="Eligible Branches">
                    <input type="text" placeholder="CSE, IT, ECE, All Branches" value={currentOpp.eligibleBranches || ""} onChange={(e) => setCurrentOpp((p) => ({ ...p, eligibleBranches: e.target.value }))} className={inputCls} />
                  </FormField>
                  <FormField label="Gender Eligibility">
                    <select value={currentOpp.genderEligibility || "All Genders"} onChange={(e) => setCurrentOpp((p) => ({ ...p, genderEligibility: e.target.value }))} className={inputCls}>
                      <option value="All Genders">All Genders</option>
                      <option value="Women Only / Female Candidates">Women Only / Female Candidates</option>
                    </select>
                  </FormField>
                  <FormField label="Geographic Scope">
                    <input type="text" placeholder="India & Global" value={currentOpp.geographicRestrictions || ""} onChange={(e) => setCurrentOpp((p) => ({ ...p, geographicRestrictions: e.target.value }))} className={inputCls} />
                  </FormField>
                  <FormField label="Participation Format">
                    <select value={currentOpp.participationType || "Individual"} onChange={(e) => setCurrentOpp((p) => ({ ...p, participationType: e.target.value }))} className={inputCls}>
                      <option value="Individual">Individual</option>
                      <option value="Team">Team</option>
                      <option value="Mentorship">Mentorship</option>
                    </select>
                  </FormField>
                  <FormField label="Difficulty">
                    <select value={currentOpp.difficulty || "Beginner Friendly"} onChange={(e) => setCurrentOpp((p) => ({ ...p, difficulty: e.target.value }))} className={inputCls}>
                      <option value="Beginner Friendly">Beginner Friendly</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </FormField>
                </div>

                <FormField label="Minimum Qualifications">
                  <input type="text" placeholder="e.g. Basic Git knowledge, Open to all" value={currentOpp.minQualifications || ""} onChange={(e) => setCurrentOpp((p) => ({ ...p, minQualifications: e.target.value }))} className={inputCls} />
                </FormField>

                <FormField label="Eligibility Summary (general)">
                  <textarea value={currentOpp.eligibility || ""} onChange={(e) => setCurrentOpp((p) => ({ ...p, eligibility: e.target.value }))} rows={2} className={`${inputCls} resize-none`} placeholder="General eligibility notes…" />
                </FormField>
              </div>

              {/* ── Key Benefit + How It Works ───────────────────────────── */}
              <FormField label="Key Benefit (1 sentence highlight)">
                <input type="text" placeholder="e.g. Stipend of $3,000–$6,600 + mentorship from Google engineers" value={currentOpp.keyBenefit || ""} onChange={(e) => setCurrentOpp((p) => ({ ...p, keyBenefit: e.target.value }))} className={inputCls} />
              </FormField>

              <FormField label="Benefits & Rewards">
                <textarea value={currentOpp.benefits || ""} onChange={(e) => setCurrentOpp((p) => ({ ...p, benefits: e.target.value }))} rows={3} className={`${inputCls} resize-none`} />
              </FormField>

              <FormField label="How It Works">
                <textarea value={currentOpp.howItWorks || ""} onChange={(e) => setCurrentOpp((p) => ({ ...p, howItWorks: e.target.value }))} rows={3} className={`${inputCls} resize-none`} />
              </FormField>

              {/* ── Application ─────────────────────────────────────────── */}
              <div className="border border-slate-200 rounded-2xl p-4 space-y-4 bg-slate-50">
                <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-widest">Application</h3>
                <FormField label="How to Apply">
                  <textarea value={currentOpp.applyProcess || ""} onChange={(e) => setCurrentOpp((p) => ({ ...p, applyProcess: e.target.value }))} rows={3} className={`${inputCls} resize-none`} placeholder="Step-by-step application process…" />
                </FormField>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Official Application URL">
                    <input type="url" placeholder="https://…" value={currentOpp.applicationUrl || ""} onChange={(e) => setCurrentOpp((p) => ({ ...p, applicationUrl: e.target.value }))} className={inputCls} />
                  </FormField>
                  <FormField label="Source / More Info URL">
                    <input type="url" placeholder="https://…" value={currentOpp.sourceUrl || ""} onChange={(e) => setCurrentOpp((p) => ({ ...p, sourceUrl: e.target.value }))} className={inputCls} />
                  </FormField>
                </div>
              </div>

              {/* Prep Guide */}
              <FormField label="Preparation Guide">
                <textarea value={currentOpp.prepGuide || ""} onChange={(e) => setCurrentOpp((p) => ({ ...p, prepGuide: e.target.value }))} rows={3} className={`${inputCls} resize-none`} placeholder="What students should do to prepare…" />
              </FormField>

              <FormField label="Tips & Tricks">
                <textarea value={currentOpp.tips || ""} onChange={(e) => setCurrentOpp((p) => ({ ...p, tips: e.target.value }))} rows={2} className={`${inputCls} resize-none`} />
              </FormField>

              {/* YouTube + Thumbnail */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="YouTube Video URL">
                  <input type="url" placeholder="https://www.youtube.com/watch?v=…" value={currentOpp.youtubeUrl || ""} onChange={(e) => setCurrentOpp((p) => ({ ...p, youtubeUrl: e.target.value }))} className={inputCls} />
                </FormField>
                <FormField label="Thumbnail URL">
                  <input type="url" placeholder="https://…" value={currentOpp.thumbnail || ""} onChange={(e) => setCurrentOpp((p) => ({ ...p, thumbnail: e.target.value }))} className={inputCls} />
                </FormField>
              </div>

              {/* Meta */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Last Verified">
                  <input type="text" placeholder="e.g. October 2026" value={currentOpp.lastVerified || ""} onChange={(e) => setCurrentOpp((p) => ({ ...p, lastVerified: e.target.value }))} className={inputCls} />
                </FormField>
                <FormField label="Display Order">
                  <input type="number" value={currentOpp.order ?? 0} onChange={(e) => setCurrentOpp((p) => ({ ...p, order: Number(e.target.value) }))} className={inputCls} min={0} />
                </FormField>
              </div>

              {/* Is Historical */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <input
                  id="isHistorical"
                  type="checkbox"
                  checked={Boolean(currentOpp.isHistorical)}
                  onChange={(e) => setCurrentOpp((p) => ({ ...p, isHistorical: e.target.checked }))}
                  className="w-4 h-4 rounded accent-[#1D64EC]"
                />
                <label htmlFor="isHistorical" className="text-xs font-semibold text-slate-700">
                  Mark as Historical Program (no longer active)
                </label>
              </div>

              {/* Publish & Featured toggles */}
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={Boolean(currentOpp.featured)} onChange={(e) => setCurrentOpp((p) => ({ ...p, featured: e.target.checked }))} className="w-4 h-4 rounded accent-[#1D64EC]" />
                  <span className="text-xs font-semibold text-slate-700">Featured Program</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={Boolean(currentOpp.published)} onChange={(e) => setCurrentOpp((p) => ({ ...p, published: e.target.checked }))} className="w-4 h-4 rounded accent-[#1D64EC]" />
                  <span className="text-xs font-semibold text-slate-700">Publish (make visible)</span>
                </label>
              </div>

              {/* Footer actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 font-semibold hover:bg-slate-50 transition">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-[#1D64EC] hover:bg-blue-700 text-white text-sm font-bold transition flex items-center gap-2 disabled:opacity-60"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {currentOpp.id ? "Save Changes" : "Create Opportunity"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const inputCls =
  "w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-[#1D64EC] focus:ring-1 focus:ring-[#1D64EC]/20 transition";

function FormField({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-600 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
