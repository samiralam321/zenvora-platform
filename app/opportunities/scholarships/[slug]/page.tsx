import React from "react";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import type { Metadata } from "next";
import {
  GraduationCap,
  ChevronLeft,
  CheckCircle2,
  ExternalLink,
  Calendar,
  IndianRupee,
  Award,
  Globe,
  Clock,
  Heart,
  Landmark,
  User,
  Users,
  Building2,
  FileCheck,
  ClipboardList,
  AlertCircle,
  Share2,
  ShieldCheck,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import ScholarshipDetailActions from "./ScholarshipDetailActions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = await prisma.scholarship.findUnique({
    where: { slug: params.slug },
  });
  if (!s) return { title: "Scholarship Not Found | Zenvora" };
  return {
    title: `${s.name} | Zenvora Scholarships`,
    description: s.description,
  };
}

function parseJsonArray(val?: string | null): string[] {
  if (!val) return [];
  try {
    const arr = JSON.parse(val);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export default async function ScholarshipDetailPage({ params }: Props) {
  let settings: any = {};
  try {
    const s = await prisma.setting.findUnique({ where: { key: "site_settings" } });
    if (s?.value) settings = JSON.parse(s.value);
  } catch (e) {}

  const [navItems, scholarship] = await Promise.all([
    prisma.navItem.findMany({
      where: { area: "header", visible: true },
      orderBy: { order: "asc" },
    }),
    prisma.scholarship.findUnique({
      where: { slug: params.slug },
    }),
  ]);

  if (!scholarship || !scholarship.isPublished) {
    notFound();
  }

  const benefits = parseJsonArray(scholarship.benefits);
  const documents = parseJsonArray(scholarship.requiredDocuments);
  const applicationSteps = parseJsonArray(scholarship.applicationProcess);

  // Suggested other scholarships for exploration
  const relatedScholarships = await prisma.scholarship.findMany({
    where: {
      isPublished: true,
      id: { not: scholarship.id },
    },
    take: 3,
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 text-slate-900 font-sans">
      <Header
        brandName={settings.brandName || "Zenvora"}
        avatarUrl={settings.avatarUrl || "/images/zenvora-logo.png"}
        navItems={navItems.length > 0 ? navItems : undefined}
      />

      <main className="flex-1 pt-[85px] pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Breadcrumb back link */}
          <div>
            <Link
              href="/opportunities/scholarships"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-900 transition group"
            >
              <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Scholarships</span>
            </Link>
          </div>

          {/* ── Hero Card ── */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
              <div className="space-y-3 min-w-0">
                {/* Badges row */}
                <div className="flex items-center gap-2 flex-wrap">
                  {scholarship.isVerified && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1D64EC] border border-blue-200">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified Program
                    </span>
                  )}

                  {scholarship.isNational && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      <Landmark className="w-3.5 h-3.5" />
                      National Scheme
                    </span>
                  )}

                  {scholarship.genderEligibility === "girls" ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-pink-50 text-pink-700 border border-pink-200">
                      <Heart className="w-3 h-3 fill-pink-500 text-pink-500" />
                      Girls Only
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      <Users className="w-3 h-3" />
                      Open to All Students
                    </span>
                  )}

                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                      scholarship.applicationStatus === "open"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : scholarship.applicationStatus === "year_round"
                        ? "bg-sky-50 text-sky-700 border-sky-200"
                        : scholarship.applicationStatus === "upcoming"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    }`}
                  >
                    {scholarship.applicationStatus === "open"
                      ? "Applications Open"
                      : scholarship.applicationStatus === "year_round"
                      ? "Year-Round Applications"
                      : scholarship.applicationStatus === "upcoming"
                      ? "Upcoming Cohort"
                      : "Applications Closed"}
                  </span>
                </div>

                {/* Scholarship Title */}
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  {scholarship.name}
                </h1>

                {/* Organization details */}
                <div className="flex items-center gap-3 text-sm text-slate-600 flex-wrap">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span>{scholarship.organization}</span>
                  </div>
                  <span>·</span>
                  <span>{scholarship.organizationType || "Organization"}</span>
                  <span>·</span>
                  <span>{scholarship.country || "India"}</span>
                </div>
              </div>

              {/* Amount badge */}
              <div className="bg-[#EEF4FF] rounded-2xl border border-blue-200/80 p-5 lg:text-right shrink-0 lg:min-w-[240px]">
                <div className="text-xs font-semibold text-[#1D64EC] uppercase tracking-wider mb-1">
                  Scholarship Value
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {scholarship.amountText || "Amount Not Disclosed"}
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  {scholarship.fundingType || "Educational Grant"} · {scholarship.duration || "Course Duration"}
                </div>
              </div>
            </div>

            {/* Short Description & Action Buttons */}
            <div className="pt-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl">
                {scholarship.description}
              </p>

              {/* Client interactive buttons: Apply, Official, Share, Save */}
              <ScholarshipDetailActions
                scholarshipId={scholarship.id}
                scholarshipSlug={scholarship.slug}
                applicationUrl={scholarship.applicationUrl}
                officialUrl={scholarship.officialUrl}
                applicationStatus={scholarship.applicationStatus}
              />
            </div>
          </div>

          {/* ── Key Highlights Grid ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Eligible Years</span>
              </div>
              <div className="text-sm font-bold text-slate-800">
                {scholarship.eligibleYears || "All Academic Years"}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
                <IndianRupee className="w-4 h-4 text-slate-400" />
                <span>Family Income Limit</span>
              </div>
              <div className="text-sm font-bold text-slate-800">
                {scholarship.familyIncomeLimit
                  ? `Below ₹${(scholarship.familyIncomeLimit / 100000).toFixed(1)} Lakh`
                  : "No Income Limit"}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
                <Award className="w-4 h-4 text-slate-400" />
                <span>Minimum Marks</span>
              </div>
              <div className="text-sm font-bold text-slate-800">
                {scholarship.minimumPercentage ? `${scholarship.minimumPercentage}% aggregate` : "Passing Marks"}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Deadline</span>
              </div>
              <div className="text-sm font-bold text-slate-800 truncate">
                {scholarship.deadlineText || "Deadline not announced"}
              </div>
            </div>
          </div>

          {/* ── Detailed Content Layout ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: Eligibility, Benefits, Steps, Documents */}
            <div className="lg:col-span-2 space-y-8">
              {/* Eligibility Criteria */}
              <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <GraduationCap className="w-5 h-5 text-[#1D64EC]" />
                  <h2 className="text-lg font-bold text-slate-900">Eligibility Criteria</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div className="space-y-1">
                    <span className="text-slate-500 font-semibold">Eligible Degrees</span>
                    <p className="text-slate-800 font-medium">{scholarship.eligibleDegrees || "All Degrees"}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-500 font-semibold">Eligible Branches</span>
                    <p className="text-slate-800 font-medium">{scholarship.eligibleBranches || "All Branches"}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-500 font-semibold">Academic Years</span>
                    <p className="text-slate-800 font-medium">{scholarship.eligibleYears || "Any Year"}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-500 font-semibold">Gender Eligibility</span>
                    <p className="text-slate-800 font-medium">
                      {scholarship.genderEligibility === "girls"
                        ? "Female Candidates Only"
                        : "Open to All Genders"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-500 font-semibold">Nationality Requirement</span>
                    <p className="text-slate-800 font-medium">{scholarship.nationality || "Indian Citizen"}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-500 font-semibold">Category Restrictions</span>
                    <p className="text-slate-800 font-medium">
                      {scholarship.categoryRestrictions || "Open to All Categories"}
                    </p>
                  </div>
                </div>
              </section>

              {/* Verified Benefits */}
              {benefits.length > 0 && (
                <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <Award className="w-5 h-5 text-[#1D64EC]" />
                    <h2 className="text-lg font-bold text-slate-900">Scholarship Benefits & Support</h2>
                  </div>

                  <ul className="space-y-3">
                    {benefits.map((b, i) => (
                      <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{b}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Step-by-Step Application Guide */}
              {applicationSteps.length > 0 && (
                <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <ClipboardList className="w-5 h-5 text-[#1D64EC]" />
                    <h2 className="text-lg font-bold text-slate-900">How to Apply (Step-by-Step)</h2>
                  </div>

                  <div className="space-y-3">
                    {applicationSteps.map((step, i) => (
                      <div key={i} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700">
                        <span className="w-6 h-6 rounded-full bg-[#EEF4FF] text-[#1D64EC] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <p className="leading-relaxed pt-0.5">{step}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Required Documents Checklist */}
              {documents.length > 0 && (
                <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <FileCheck className="w-5 h-5 text-[#1D64EC]" />
                    <h2 className="text-lg font-bold text-slate-900">Required Documents Checklist</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {documents.map((doc, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700"
                      >
                        <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                        <span className="font-medium">{doc}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Right 1 Col: Official Verification, Disclaimer, Related Scholarships */}
            <div className="space-y-6">
              {/* Official Sources Card */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Globe className="w-4 h-4 text-[#1D64EC]" />
                  <h3 className="text-sm font-bold text-slate-900">Official Links & Verification</h3>
                </div>

                <div className="space-y-3">
                  {scholarship.applicationStatus === "closed" ? (
                    <div className="w-full bg-slate-50 border border-slate-200 text-slate-500 text-xs font-semibold py-2.5 px-4 rounded-xl text-center">
                      Applications Closed · Next cycle not announced
                    </div>
                  ) : scholarship.applicationUrl ? (
                    <a
                      href={scholarship.applicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-[#1D64EC] hover:bg-[#1a56d4] text-white text-xs font-bold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 shadow-xs"
                    >
                      <span>Apply on Official Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : null}

                  {scholarship.officialUrl && (
                    <a
                      href={scholarship.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2"
                    >
                      <span>Official Organization Website</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {scholarship.notificationUrl && (
                    <a
                      href={scholarship.notificationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2"
                    >
                      <span>Official Notification PDF</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                <div className="pt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>
                    Last verified by Zenvora:{" "}
                    {scholarship.lastVerified
                      ? new Date(scholarship.lastVerified).toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })
                      : "Recently"}
                  </span>
                </div>

                {/* Important Disclaimer */}
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-800 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>Official Disclaimer</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-800">
                    Always verify the latest eligibility criteria, guidelines, and deadlines on the
                    official organization portal before submitting your application.
                  </p>
                </div>
              </div>

              {/* Related Scholarships */}
              {relatedScholarships.length > 0 && (
                <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
                  <h3 className="text-sm font-bold text-slate-900">More Scholarships to Explore</h3>
                  <div className="space-y-3">
                    {relatedScholarships.map((rel) => (
                      <Link
                        key={rel.id}
                        href={`/opportunities/scholarships/${rel.slug}`}
                        className="block p-3 rounded-xl bg-slate-50/80 hover:bg-slate-100/90 border border-slate-100 transition group"
                      >
                        <div className="text-[10px] font-bold text-[#1D64EC] uppercase tracking-wider mb-0.5">
                          {rel.organization}
                        </div>
                        <div className="text-xs font-bold text-slate-800 group-hover:text-[#1D64EC] transition-colors line-clamp-1">
                          {rel.name}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1 font-semibold">
                          {rel.amountText || "Educational Grant"}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer settings={settings} />
      {settings.scrollToTopEnabled !== false && <ScrollToTop />}
    </div>
  );
}
