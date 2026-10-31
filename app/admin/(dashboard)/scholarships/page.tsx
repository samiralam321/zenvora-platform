"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Search,
  Star,
  X,
  Loader2,
  Globe,
  Heart,
  Landmark,
  User,
  Users,
  ShieldCheck,
  Eye,
  EyeOff,
  Building2,
  Calendar,
  AlertCircle,
  Clock,
  IndianRupee,
  RefreshCw,
  Check,
} from "lucide-react";

interface Scholarship {
  id: string;
  name: string;
  slug: string;
  organization: string;
  organizationType: string | null;
  country: string | null;
  logoUrl: string | null;
  description: string;

  genderEligibility: string;
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
  applicationStatus: string;

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

export default function AdminScholarshipsPage() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGender, setFilterGender] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Link verification state
  const [verifyingAll, setVerifyingAll] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [verificationBanner, setVerificationBanner] = useState<string | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<Scholarship | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    organization: "",
    organizationType: "Indian Private Company",
    country: "India",
    isNational: true,
    logoUrl: "",
    description: "",

    genderEligibility: "all",
    eligibleDegrees: "B.Tech, B.E.",
    eligibleBranches: "Computer Science, IT, All Engineering Branches",
    eligibleYears: "First Year",
    minimumPercentage: "",
    familyIncomeLimit: "",
    nationality: "Indian",
    categoryRestrictions: "All Categories",

    amount: "",
    amountType: "per_year",
    amountText: "₹50,000 / year",
    fundingType: "Merit-cum-Means",
    duration: "4 Years",
    benefitsText: "",

    requiredDocumentsText: "",
    applicationProcessText: "",
    scholarshipType: "Merit-cum-Means",

    deadlineText: "Applications Open",
    applicationStatus: "open",
    officialUrl: "",
    applicationUrl: "",
    notificationUrl: "",
    verificationStatus: "verified",
    verificationNotes: "",

    isVerified: true,
    isFeatured: false,
    isPublished: true,
    displayOrder: 0,
  });

  const fetchScholarships = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/scholarships");
      const data = await res.json();
      if (data.scholarships) {
        setScholarships(data.scholarships);
      }
    } catch (e) {
      console.error("Failed to load scholarships:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScholarships();
  }, []);

  const handleVerifyAllLinks = async () => {
    try {
      setVerifyingAll(true);
      setVerificationBanner(null);
      const res = await fetch("/api/admin/scholarships/verify-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (res.ok) {
        setVerificationBanner(
          `Link Verification Complete: Checked ${data.totalChecked} scholarships (${data.verifiedCount} active, ${data.brokenCount} broken).`
        );
        fetchScholarships();
      } else {
        setVerificationBanner(`Verification failed: ${data.error || "Unknown error"}`);
      }
    } catch (e: any) {
      setVerificationBanner(`Verification failed: ${e.message}`);
    } finally {
      setVerifyingAll(false);
    }
  };

  const handleVerifySingleLink = async (id: string) => {
    try {
      setVerifyingId(id);
      const res = await fetch("/api/admin/scholarships/verify-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        fetchScholarships();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setVerifyingId(null);
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      name: "",
      slug: "",
      organization: "",
      organizationType: "Indian Private Company",
      country: "India",
      isNational: true,
      logoUrl: "",
      description: "",

      genderEligibility: "all",
      eligibleDegrees: "B.Tech, B.E.",
      eligibleBranches: "Computer Science, IT, All Engineering Branches",
      eligibleYears: "First Year",
      minimumPercentage: "",
      familyIncomeLimit: "",
      nationality: "Indian",
      categoryRestrictions: "All Categories",

      amount: "",
      amountType: "per_year",
      amountText: "₹50,000 / year",
      fundingType: "Merit-cum-Means",
      duration: "4 Years",
      benefitsText: "Tuition fee waiver\nLaptop or equipment grant\nMentorship support",

      requiredDocumentsText: "Aadhaar Card / ID Proof\nClass 12th Marksheet\nCollege Bonafide Certificate\nFamily Income Certificate",
      applicationProcessText: "1. Register on the official portal\n2. Submit academic and income documents\n3. Attend interview / verification round\n4. Direct grant disbursement",
      scholarshipType: "Merit-cum-Means",

      deadlineText: "Applications Open",
      applicationStatus: "open",
      officialUrl: "",
      applicationUrl: "",
      notificationUrl: "",
      verificationStatus: "verified",
      verificationNotes: "",

      isVerified: true,
      isFeatured: false,
      isPublished: true,
      displayOrder: 0,
    });
    setErrorMsg("");
    setModalOpen(true);
  };

  const openEditModal = (s: Scholarship) => {
    setEditingId(s.id);
    let benefitsArr: string[] = [];
    try {
      benefitsArr = s.benefits ? JSON.parse(s.benefits) : [];
    } catch {}

    let docsArr: string[] = [];
    try {
      docsArr = s.requiredDocuments ? JSON.parse(s.requiredDocuments) : [];
    } catch {}

    let stepsArr: string[] = [];
    try {
      stepsArr = s.applicationProcess ? JSON.parse(s.applicationProcess) : [];
    } catch {}

    setFormData({
      name: s.name,
      slug: s.slug,
      organization: s.organization,
      organizationType: s.organizationType || "Indian Private Company",
      country: s.country || "India",
      isNational: s.isNational !== undefined ? s.isNational : true,
      logoUrl: s.logoUrl || "",
      description: s.description,

      genderEligibility: s.genderEligibility,
      eligibleDegrees: s.eligibleDegrees || "",
      eligibleBranches: s.eligibleBranches || "",
      eligibleYears: s.eligibleYears || "",
      minimumPercentage: s.minimumPercentage ? s.minimumPercentage.toString() : "",
      familyIncomeLimit: s.familyIncomeLimit ? s.familyIncomeLimit.toString() : "",
      nationality: s.nationality || "Indian",
      categoryRestrictions: s.categoryRestrictions || "All Categories",

      amount: s.amount ? s.amount.toString() : "",
      amountType: s.amountType || "per_year",
      amountText: s.amountText || "",
      fundingType: s.fundingType || "Merit-cum-Means",
      duration: s.duration || "4 Years",
      benefitsText: benefitsArr.join("\n"),

      requiredDocumentsText: docsArr.join("\n"),
      applicationProcessText: stepsArr.join("\n"),
      scholarshipType: s.scholarshipType || "Merit-cum-Means",

      deadlineText: s.deadlineText || "Applications Open",
      applicationStatus: s.applicationStatus,
      officialUrl: s.officialUrl || "",
      applicationUrl: s.applicationUrl || "",
      notificationUrl: s.notificationUrl || "",
      verificationStatus: s.verificationStatus || "verified",
      verificationNotes: s.verificationNotes || "",

      isVerified: s.isVerified,
      isFeatured: s.isFeatured,
      isPublished: s.isPublished,
      displayOrder: s.displayOrder || 0,
    });
    setErrorMsg("");
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!formData.name.trim()) {
      setErrorMsg("Scholarship name is required.");
      return;
    }
    if (!formData.organization.trim()) {
      setErrorMsg("Organization name is required.");
      return;
    }

    setSaving(true);
    try {
      const benefits = formData.benefitsText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      const requiredDocuments = formData.requiredDocumentsText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      const applicationProcess = formData.applicationProcessText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim() || undefined,
        organization: formData.organization.trim(),
        organizationType: formData.organizationType,
        country: formData.country,
        isNational: formData.isNational,
        logoUrl: formData.logoUrl.trim() || null,
        description: formData.description.trim(),

        genderEligibility: formData.genderEligibility,
        eligibleDegrees: formData.eligibleDegrees.trim() || null,
        eligibleBranches: formData.eligibleBranches.trim() || null,
        eligibleYears: formData.eligibleYears.trim() || null,
        minimumPercentage: formData.minimumPercentage ? parseFloat(formData.minimumPercentage) : null,
        familyIncomeLimit: formData.familyIncomeLimit ? parseFloat(formData.familyIncomeLimit) : null,
        nationality: formData.nationality.trim() || "Indian",
        categoryRestrictions: formData.categoryRestrictions.trim() || "All Categories",

        amount: formData.amount ? parseFloat(formData.amount) : null,
        amountType: formData.amountType,
        amountText: formData.amountText.trim() || null,
        fundingType: formData.fundingType,
        duration: formData.duration.trim() || null,
        benefits,

        requiredDocuments,
        applicationProcess,
        scholarshipType: formData.scholarshipType,

        deadlineText: formData.deadlineText.trim() || "Deadline not announced",
        applicationStatus: formData.applicationStatus,
        officialUrl: formData.officialUrl.trim() || null,
        applicationUrl: formData.applicationUrl.trim() || null,
        notificationUrl: formData.notificationUrl.trim() || null,
        verificationStatus: formData.verificationStatus,
        verificationNotes: formData.verificationNotes.trim() || null,

        isVerified: formData.isVerified,
        isFeatured: formData.isFeatured,
        isPublished: formData.isPublished,
        displayOrder: Number(formData.displayOrder) || 0,
      };

      const url = "/api/admin/scholarships";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { id: editingId, ...payload } : payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save scholarship");

      setModalOpen(false);
      fetchScholarships();
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: string, field: "isPublished" | "isVerified" | "isFeatured", val: boolean) => {
    try {
      const res = await fetch("/api/admin/scholarships", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, [field]: val }),
      });
      if (res.ok) {
        setScholarships((prev) =>
          prev.map((s) => (s.id === id ? { ...s, [field]: val } : s))
        );
      }
    } catch (e) {
      console.error("Toggle error:", e);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/scholarships?id=${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setScholarships((prev) => prev.filter((s) => s.id !== deleteTarget.id));
        setDeleteTarget(null);
      }
    } catch (e) {
      console.error("Delete error:", e);
    } finally {
      setDeleting(false);
    }
  };

  const filtered = scholarships.filter((s) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        s.name.toLowerCase().includes(q) ||
        s.organization.toLowerCase().includes(q) ||
        (s.country || "").toLowerCase().includes(q);
      if (!match) return false;
    }
    if (filterGender !== "all" && s.genderEligibility !== filterGender) return false;
    if (filterStatus !== "all" && s.applicationStatus !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Scholarships Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Curate, verify, and publish reliable engineering scholarships for Indian students.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleVerifyAllLinks}
            disabled={verifyingAll}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl transition shadow-2xs disabled:opacity-60"
            title="Perform live HTTP checks on all scholarship links to detect 404s and broken URLs"
          >
            <RefreshCw className={`w-4 h-4 text-[#1D64EC] ${verifyingAll ? "animate-spin" : ""}`} />
            <span>{verifyingAll ? "Checking Links..." : "Verify All Links"}</span>
          </button>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 bg-[#1D64EC] hover:bg-[#1a56d4] text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Scholarship</span>
          </button>
        </div>
      </div>

      {/* ── Link Verification Banner ── */}
      {verificationBanner && (
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#1D64EC] shrink-0" />
            <span>{verificationBanner}</span>
          </div>
          <button
            onClick={() => setVerificationBanner(null)}
            className="text-blue-500 hover:text-blue-700 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <div className="text-2xl font-black text-slate-900">{scholarships.length}</div>
          <div className="text-xs font-semibold text-slate-500 mt-0.5">Total Scholarships</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <div className="text-2xl font-black text-blue-600">
            {scholarships.filter((s) => s.isNational).length}
          </div>
          <div className="text-xs font-semibold text-slate-500 mt-0.5">National Schemes</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <div className="text-2xl font-black text-purple-600">
            {scholarships.filter((s) => !s.isNational).length}
          </div>
          <div className="text-xs font-semibold text-slate-500 mt-0.5">International</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <div className="text-2xl font-black text-emerald-600">
            {scholarships.filter((s) => s.verificationStatus === "verified").length}
          </div>
          <div className="text-xs font-semibold text-slate-500 mt-0.5">Verified Links</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <div className="text-2xl font-black text-rose-600">
            {scholarships.filter((s) => s.verificationStatus === "broken").length}
          </div>
          <div className="text-xs font-semibold text-slate-500 mt-0.5">Broken Links</div>
        </div>
      </div>

      {/* ── Filter / Search Bar ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, organization..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#1D64EC]"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto overflow-x-auto">
          <select
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700"
          >
            <option value="all">All Genders</option>
            <option value="girls">Girls Only</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="open">Applications Open</option>
            <option value="upcoming">Upcoming</option>
            <option value="closed">Closed</option>
            <option value="year_round">Year-Round</option>
          </select>
        </div>
      </div>

      {/* ── Scholarship List Table ── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#1D64EC] mb-2" />
            <p className="text-xs font-semibold">Loading scholarships database...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <GraduationCap className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No scholarships found</p>
            <p className="text-xs text-slate-400">Try adjusting your search or add a new scholarship.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Scholarship & Organization</th>
                  <th className="py-3 px-4">Scope & Gender</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Link Health</th>
                  <th className="py-3 px-4 text-center">Verified</th>
                  <th className="py-3 px-4 text-center">Featured</th>
                  <th className="py-3 px-4 text-center">Live</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-bold text-slate-900 line-clamp-1">{s.name}</div>
                      <div className="text-slate-500 text-[11px] flex items-center gap-1.5 mt-0.5">
                        <span className="font-semibold">{s.organization}</span>
                        <span>·</span>
                        <span>{s.country || "India"}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {s.isNational ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#1D64EC] border border-blue-200">
                            <Landmark className="w-3 h-3" />
                            National
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                            <Globe className="w-3 h-3" />
                            International
                          </span>
                        )}

                        {s.genderEligibility === "girls" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 border border-pink-200">
                            <Heart className="w-3 h-3 fill-pink-500" />
                            Girls Only
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                            <Users className="w-3 h-3" />
                            Open
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-800">
                      {s.amountText || "Not Disclosed"}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          s.applicationStatus === "open"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : s.applicationStatus === "year_round"
                            ? "bg-sky-50 text-sky-700 border-sky-200"
                            : s.applicationStatus === "upcoming"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        {s.applicationStatus}
                      </span>
                    </td>

                    {/* Link Health */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {s.verificationStatus === "broken" ? (
                        <span
                          className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 cursor-help"
                          title={s.verificationNotes || "Broken link"}
                        >
                          <AlertCircle className="w-3 h-3 text-rose-600" />
                          Broken Link
                        </span>
                      ) : s.verificationStatus === "closed" ? (
                        <span
                          className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 cursor-help"
                          title="Cycle closed / application link hidden"
                        >
                          Closed
                        </span>
                      ) : s.verificationStatus === "pending" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          Pending
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-help"
                          title={s.verificationNotes || "Verified URL accessible"}
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Verified
                        </span>
                      )}
                    </td>

                    {/* Verified Toggle */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggle(s.id, "isVerified", !s.isVerified)}
                        className={`p-1.5 rounded-lg transition ${
                          s.isVerified ? "text-blue-600 hover:bg-blue-50" : "text-slate-300 hover:bg-slate-100"
                        }`}
                        title={s.isVerified ? "Marked as Verified" : "Unverified"}
                      >
                        <ShieldCheck className="w-4 h-4" />
                      </button>
                    </td>

                    {/* Featured Toggle */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggle(s.id, "isFeatured", !s.isFeatured)}
                        className={`p-1.5 rounded-lg transition ${
                          s.isFeatured ? "text-amber-500 hover:bg-amber-50" : "text-slate-300 hover:bg-slate-100"
                        }`}
                        title={s.isFeatured ? "Featured" : "Not Featured"}
                      >
                        <Star className={`w-4 h-4 ${s.isFeatured ? "fill-amber-500" : ""}`} />
                      </button>
                    </td>

                    {/* Published Toggle */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggle(s.id, "isPublished", !s.isPublished)}
                        className={`p-1.5 rounded-lg transition ${
                          s.isPublished ? "text-emerald-600 hover:bg-emerald-50" : "text-slate-300 hover:bg-slate-100"
                        }`}
                        title={s.isPublished ? "Published (Live)" : "Draft (Hidden)"}
                      >
                        {s.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleVerifySingleLink(s.id)}
                          disabled={verifyingId === s.id}
                          className="p-1.5 text-slate-400 hover:text-[#1D64EC] hover:bg-blue-50 rounded-lg transition"
                          title="Verify URL accessibility now"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${verifyingId === s.id ? "animate-spin text-[#1D64EC]" : ""}`} />
                        </button>
                        <Link
                          href={`/opportunities/scholarships/${s.slug}`}
                          target="_blank"
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                          title="View Live Page"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => openEditModal(s)}
                          className="p-1.5 text-slate-400 hover:text-[#1D64EC] hover:bg-blue-50 rounded-lg transition"
                          title="Edit Scholarship"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(s)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Scholarship"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-3xl w-full my-8 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#1D64EC]" />
                <h2 className="text-lg font-bold text-slate-900">
                  {editingId ? "Edit Scholarship" : "Add New Scholarship"}
                </h2>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-xs">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Section 1: Basic Information */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1D64EC]">
                  1. Basic Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Scholarship Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Reliance Foundation Undergraduate Scholarship"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#1D64EC]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Organization Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      placeholder="e.g. Reliance Foundation"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#1D64EC]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Organization Type</label>
                    <select
                      value={formData.organizationType}
                      onChange={(e) => setFormData({ ...formData, organizationType: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white"
                    >
                      <option value="Indian Government">Indian Government</option>
                      <option value="Indian Private Company">Indian Private Company</option>
                      <option value="International Company">International Company</option>
                      <option value="Foreign Government">Foreign Government</option>
                      <option value="International Foundation">International Foundation</option>
                      <option value="University">University</option>
                      <option value="Non-Profit Organization">Non-Profit Organization</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Country</label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      placeholder="India / International"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#1D64EC]"
                    />
                  </div>

                  <div className="sm:col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isNational}
                        onChange={(e) => setFormData({ ...formData, isNational: e.target.checked })}
                        className="w-4 h-4 rounded text-[#1D64EC] mt-0.5"
                      />
                      <div>
                        <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                          <Landmark className="w-3.5 h-3.5 text-[#1D64EC]" />
                          <span>National Level Scheme / Indian Organization</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                          Enable for Central/State Government scholarships, AICTE, UGC, or Indian corporate schemes (e.g. Reliance, Tata, Infosys). Uncheck for international or study abroad scholarships.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Short Description *</label>
                  <textarea
                    rows={2}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief summary of the scholarship..."
                    className="w-full border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-[#1D64EC]"
                  />
                </div>
              </div>

              {/* Section 2: Eligibility */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1D64EC]">
                  2. Eligibility Criteria
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Gender Eligibility</label>
                    <select
                      value={formData.genderEligibility}
                      onChange={(e) => setFormData({ ...formData, genderEligibility: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white"
                    >
                      <option value="all">Open to All Students</option>
                      <option value="girls">Girls Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Eligible Academic Years</label>
                    <input
                      type="text"
                      value={formData.eligibleYears}
                      onChange={(e) => setFormData({ ...formData, eligibleYears: e.target.value })}
                      placeholder="e.g. First Year, Second Year"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#1D64EC]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Family Income Limit (₹)</label>
                    <input
                      type="number"
                      value={formData.familyIncomeLimit}
                      onChange={(e) => setFormData({ ...formData, familyIncomeLimit: e.target.value })}
                      placeholder="e.g. 500000"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#1D64EC]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Eligible Degrees</label>
                    <input
                      type="text"
                      value={formData.eligibleDegrees}
                      onChange={(e) => setFormData({ ...formData, eligibleDegrees: e.target.value })}
                      placeholder="e.g. B.Tech, B.E., BCA"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#1D64EC]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Eligible Branches</label>
                    <input
                      type="text"
                      value={formData.eligibleBranches}
                      onChange={(e) => setFormData({ ...formData, eligibleBranches: e.target.value })}
                      placeholder="e.g. Computer Science, IT, All Engineering"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#1D64EC]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Funding & Benefits */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1D64EC]">
                  3. Funding & Benefits
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Amount Display Text *</label>
                    <input
                      type="text"
                      required
                      value={formData.amountText}
                      onChange={(e) => setFormData({ ...formData, amountText: e.target.value })}
                      placeholder="e.g. ₹50,000 / year"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#1D64EC]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Numeric Amount (for filtering)</label>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="e.g. 50000"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#1D64EC]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Funding Type</label>
                    <select
                      value={formData.fundingType}
                      onChange={(e) => setFormData({ ...formData, fundingType: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white"
                    >
                      <option value="Merit-cum-Means">Merit-cum-Means</option>
                      <option value="Merit Based">Merit Based</option>
                      <option value="Need Based">Need Based</option>
                      <option value="Government Scholarship">Government Scholarship</option>
                      <option value="Corporate Scholarship">Corporate Scholarship</option>
                      <option value="Research Based">Research Based</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Verified Benefits (One per line)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.benefitsText}
                    onChange={(e) => setFormData({ ...formData, benefitsText: e.target.value })}
                    placeholder="Enter each benefit on a new line..."
                    className="w-full border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-[#1D64EC]"
                  />
                </div>
              </div>

              {/* Section 4: Process & Documents */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1D64EC]">
                  4. Application Process & Documents
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Required Documents (One per line)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.requiredDocumentsText}
                      onChange={(e) => setFormData({ ...formData, requiredDocumentsText: e.target.value })}
                      placeholder="e.g. Aadhaar Card&#10;Class 12th Marksheet&#10;Income Certificate"
                      className="w-full border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-[#1D64EC]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Application Steps (One per line)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.applicationProcessText}
                      onChange={(e) => setFormData({ ...formData, applicationProcessText: e.target.value })}
                      placeholder="e.g. 1. Register on portal&#10;2. Upload marksheets&#10;3. Final selection"
                      className="w-full border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-[#1D64EC]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 5: Timeline & URLs */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1D64EC]">
                  5. Timeline & Official URLs
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Application Status</label>
                    <select
                      value={formData.applicationStatus}
                      onChange={(e) => setFormData({ ...formData, applicationStatus: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white"
                    >
                      <option value="open">Applications Open</option>
                      <option value="upcoming">Upcoming</option>
                      <option value="closed">Closed</option>
                      <option value="year_round">Year-Round</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Deadline Display Text</label>
                    <input
                      type="text"
                      value={formData.deadlineText}
                      onChange={(e) => setFormData({ ...formData, deadlineText: e.target.value })}
                      placeholder="e.g. 31 Dec 2026 or Year-round"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#1D64EC]"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-bold text-slate-700">Official Website URL</label>
                      {formData.officialUrl && (
                        <button
                          type="button"
                          onClick={() => window.open(formData.officialUrl, "_blank")}
                          className="text-[11px] font-semibold text-[#1D64EC] hover:underline flex items-center gap-1"
                        >
                          <span>Test Link</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <input
                      type="url"
                      value={formData.officialUrl}
                      onChange={(e) => setFormData({ ...formData, officialUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#1D64EC]"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-bold text-slate-700">Official Application Portal URL</label>
                      {formData.applicationUrl && (
                        <button
                          type="button"
                          onClick={() => window.open(formData.applicationUrl, "_blank")}
                          className="text-[11px] font-semibold text-[#1D64EC] hover:underline flex items-center gap-1"
                        >
                          <span>Test Link</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <input
                      type="url"
                      value={formData.applicationUrl}
                      onChange={(e) => setFormData({ ...formData, applicationUrl: e.target.value })}
                      placeholder="https://... (leave blank if applications are closed)"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#1D64EC]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Link Verification Status</label>
                    <select
                      value={formData.verificationStatus}
                      onChange={(e) => setFormData({ ...formData, verificationStatus: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white"
                    >
                      <option value="verified">Verified (Links Accessible & Active)</option>
                      <option value="pending">Pending Verification</option>
                      <option value="broken">Broken Link (404 / Connection Error)</option>
                      <option value="closed">Closed Application Cycle</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Verification Audit Remarks</label>
                    <input
                      type="text"
                      value={formData.verificationNotes}
                      onChange={(e) => setFormData({ ...formData, verificationNotes: e.target.value })}
                      placeholder="e.g. Official: 200 OK · Application: 200 OK"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#1D64EC]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 6: Visibility & Flags */}
              <div className="pt-4 border-t border-slate-100 flex items-center gap-6 flex-wrap">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.isVerified}
                    onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                    className="w-4 h-4 rounded text-[#1D64EC]"
                  />
                  <span>Mark Verified</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded text-[#1D64EC]"
                  />
                  <span>Mark Featured</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="w-4 h-4 rounded text-[#1D64EC]"
                  />
                  <span>Published (Live on Website)</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-[#1D64EC] hover:bg-[#1a56d4] text-white font-bold transition shadow-xs flex items-center gap-2 disabled:opacity-60"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingId ? "Update Scholarship" : "Publish Scholarship"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Dialog ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">Delete Scholarship?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to permanently delete{" "}
                <span className="font-bold text-slate-700">"{deleteTarget.name}"</span>?
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-60"
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
