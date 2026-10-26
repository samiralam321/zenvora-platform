import React from "react";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import {
  Building2,
  ExternalLink,
  ArrowLeft,
  Award,
  CheckCircle2,
  Globe,
  AlertCircle,
  Lightbulb,
  BookOpen,
  ChevronRight,
  GitBranch,
  Users,
  GraduationCap,
  Heart,
  ClipboardList,
  Zap,
  Youtube,
  Info,
  MapPin,
  Star,
} from "lucide-react";
import DetailScrollRestorer from "./DetailScrollRestorer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props) {
  const opp = await prisma.opportunity.findUnique({
    where: { slug: params.slug },
  });
  if (!opp) return { title: "Opportunity Not Found | Zenvora" };
  return {
    title: `${opp.title} | Zenvora Opportunities`,
    description: opp.summary,
  };
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

const AVAILABILITY_COLORS: Record<string, string> = {
  "Applications Open": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Year-Round": "bg-sky-50 text-sky-700 border-sky-200",
  "Applications Closed": "bg-red-50 text-red-600 border-red-200",
  "Historical Program": "bg-slate-100 text-slate-500 border-slate-200",
  "Information Available": "bg-amber-50 text-amber-700 border-amber-200",
  "Availability Unverified": "bg-slate-100 text-slate-500 border-slate-200",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  "Beginner Friendly": "bg-green-50 text-green-700 border-green-200",
  Intermediate: "bg-yellow-50 text-yellow-700 border-yellow-200",
  Advanced: "bg-red-50 text-red-600 border-red-200",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function OpportunityDetailPage({ params }: Props) {
  let settings: any = {};
  try {
    const s = await prisma.setting.findUnique({ where: { key: "site_settings" } });
    if (s?.value) settings = JSON.parse(s.value);
  } catch (e) {}

  const navItems = await prisma.navItem.findMany({
    where: { area: "header", visible: true },
    orderBy: { order: "asc" },
  });

  const opportunity = await prisma.opportunity.findUnique({
    where: { slug: params.slug },
  });

  if (!opportunity || (!opportunity.published && process.env.NODE_ENV === "production")) {
    notFound();
  }

  // Related opportunities
  const related = await prisma.opportunity.findMany({
    where: {
      category: opportunity.category,
      id: { not: opportunity.id },
      published: true,
    },
    take: 3,
    orderBy: { featured: "desc" },
  });

  // Parse structured data
  const academicYears = parseJsonArray(opportunity.academicYears);
  let faqs: Array<{ q: string; a: string }> = [];
  if (opportunity.faq) {
    try { faqs = JSON.parse(opportunity.faq); } catch {}
  }

  const availStatus = opportunity.availabilityStatus || "Information Available";
  const statusClass = AVAILABILITY_COLORS[availStatus] || AVAILABILITY_COLORS["Information Available"];
  const diffClass = opportunity.difficulty
    ? DIFFICULTY_COLORS[opportunity.difficulty] || ""
    : "";
  const isWomenOnly = opportunity.genderEligibility === "Women Only / Female Candidates";

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFDFD] text-slate-900 font-sans">
      <Header
        brandName={settings.brandName || "Zenvora"}
        avatarUrl={settings.avatarUrl || "/images/zenvora-logo.png"}
        navItems={navItems.length > 0 ? navItems : undefined}
      />

      <main className="flex-1 pt-[75px] pb-20">
        {/* Restore scroll position on back-navigation (client-side, renders nothing) */}
        <DetailScrollRestorer slug={params.slug} />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          {/* ── Breadcrumbs ──────────────────────────────────────────────── */}
          <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-8">
            <Link href="/" className="hover:text-slate-900 transition">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link href="/opportunities" className="hover:text-slate-900 transition">Opportunities</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-semibold truncate max-w-xs">{opportunity.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ── Main Column ─────────────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-6">

              {/* ── A: Overview ─────────────────────────────────────────── */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-2xs space-y-6">
                {/* Historical warning */}
                {opportunity.isHistorical && (
                  <div className="flex items-start gap-3 bg-slate-100 border border-slate-300 rounded-2xl px-5 py-4">
                    <AlertCircle className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-slate-700">Historical Program</p>
                      <p className="text-xs text-slate-600 mt-0.5">
                        This program is no longer active. It is preserved here for reference only.
                        Do not attempt to apply — check the official portal for current status.
                      </p>
                    </div>
                  </div>
                )}

                {/* Badge row */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-[#EEF4FF] text-[#1D64EC]">
                    {opportunity.category}
                  </span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${statusClass}`}>
                    {availStatus}
                  </span>
                  {opportunity.featured && (
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      ⭐ Featured Program
                    </span>
                  )}
                  {isWomenOnly && (
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-pink-50 text-pink-700 border border-pink-200">
                      ♀ Women Only
                    </span>
                  )}
                  {opportunity.difficulty && (
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${diffClass}`}>
                      {opportunity.difficulty}
                    </span>
                  )}
                </div>

                {/* Title block */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-500 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#1D64EC]" />
                    Hosted by {opportunity.organization}
                  </p>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                    {opportunity.title}
                  </h1>
                  <p className="text-slate-600 text-base leading-relaxed">{opportunity.summary}</p>
                </div>

                {/* Academic Year eligibility — MANDATORY */}
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <GraduationCap className="w-5 h-5 text-[#1D64EC]" />
                    <h3 className="text-sm font-extrabold text-slate-900">Academic Year Eligibility</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {academicYears.length > 0 ? (
                      academicYears.map((yr) => (
                        <span
                          key={yr}
                          className="text-sm font-semibold px-3 py-1 bg-[#1D64EC] text-white rounded-xl"
                        >
                          {yr}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-500 italic">
                        Eligibility needs verification — check the official portal
                      </span>
                    )}
                  </div>
                </div>

                {/* Key Benefit */}
                {opportunity.keyBenefit && (
                  <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-4">
                    <Award className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 mb-1">Key Benefit</p>
                      <p className="text-sm font-semibold text-slate-800">{opportunity.keyBenefit}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* ── B: Eligibility ───────────────────────────────────────── */}
              <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-5">
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#1D64EC]" />
                  Eligibility Requirements
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {opportunity.eligibleDegrees && (
                    <EligibilityCard label="Eligible Degrees" value={opportunity.eligibleDegrees} icon={GraduationCap} />
                  )}
                  {opportunity.eligibleBranches && (
                    <EligibilityCard label="Eligible Branches / Streams" value={opportunity.eligibleBranches} icon={BookOpen} />
                  )}
                  {opportunity.genderEligibility && (
                    <EligibilityCard
                      label="Gender Eligibility"
                      value={opportunity.genderEligibility}
                      icon={Users}
                      highlight={isWomenOnly}
                    />
                  )}
                  {opportunity.geographicRestrictions && (
                    <EligibilityCard label="Geographic Scope" value={opportunity.geographicRestrictions} icon={MapPin} />
                  )}
                  {opportunity.participationType && (
                    <EligibilityCard label="Participation Format" value={opportunity.participationType} icon={Users} />
                  )}
                  {opportunity.minQualifications && (
                    <EligibilityCard label="Minimum Qualifications" value={opportunity.minQualifications} icon={Info} />
                  )}
                </div>

                {opportunity.eligibility && (
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">Eligibility Summary</p>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{opportunity.eligibility}</p>
                  </div>
                )}
              </section>

              {/* ── C: Benefits ──────────────────────────────────────────── */}
              {opportunity.benefits && (
                <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-4">
                  <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#1D64EC]" />
                    Benefits &amp; Rewards
                  </h2>
                  {(() => {
                    const benefitsList = parseJsonArray(opportunity.benefits);
                    if (benefitsList.length > 0) {
                      return (
                        <ul className="space-y-2">
                          {benefitsList.map((b, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-slate-700 leading-relaxed">{b}</span>
                            </li>
                          ))}
                        </ul>
                      );
                    }
                    return (
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {opportunity.benefits}
                      </p>
                    );
                  })()}
                </section>
              )}

              {/* ── D: How It Works ──────────────────────────────────────── */}
              {opportunity.howItWorks && (
                <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-4">
                  <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <GitBranch className="w-5 h-5 text-[#1D64EC]" />
                    How It Works
                  </h2>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{opportunity.howItWorks}</p>
                </section>
              )}

              {/* ── E: How to Apply ──────────────────────────────────────── */}
              <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-4">
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-[#1D64EC]" />
                  How to Apply
                </h2>

                {opportunity.applyProcess ? (
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {opportunity.applyProcess}
                  </p>
                ) : (
                  <p className="text-sm text-slate-500 italic">
                    Application details are not available here. Please check the official portal for the latest application instructions.
                  </p>
                )}

                {opportunity.applicationUrl ? (
                  <a
                    href={opportunity.applicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#1D64EC] hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition shadow-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Visit Official Portal
                  </a>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <Info className="w-4 h-4" />
                    No direct link available — search for the official program website.
                  </div>
                )}
              </section>

              {/* ── F: Preparation Guide ─────────────────────────────────── */}
              {(opportunity.prepGuide || opportunity.tips) && (
                <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-4">
                  <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-[#1D64EC]" />
                    Preparation Guide
                  </h2>
                  {opportunity.prepGuide && (
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{opportunity.prepGuide}</p>
                  )}
                  {opportunity.tips && (
                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 mt-2">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-amber-600 mb-2">Pro Tips</p>
                      {(() => {
                        const tipsList = parseJsonArray(opportunity.tips);
                        if (tipsList.length > 0) {
                          return (
                            <ul className="space-y-2">
                              {tipsList.map((t, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <Zap className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                                  <span className="text-sm text-slate-800 leading-relaxed">{t}</span>
                                </li>
                              ))}
                            </ul>
                          );
                        }
                        return (
                          <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">{opportunity.tips}</p>
                        );
                      })()}
                    </div>
                  )}
                </section>
              )}

              {/* ── G: Video Guide ───────────────────────────────────────── */}
              {opportunity.youtubeId && (
                <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-4">
                  <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <Youtube className="w-5 h-5 text-red-500" />
                    Video Guide
                  </h2>
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-900">
                    <iframe
                      src={`https://www.youtube.com/embed/${opportunity.youtubeId}`}
                      title={opportunity.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                    />
                  </div>
                </section>
              )}

              {/* ── FAQs ────────────────────────────────────────────────── */}
              {faqs.length > 0 && (
                <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-4">
                  <h2 className="text-xl font-extrabold text-slate-900">Frequently Asked Questions</h2>
                  <div className="space-y-4">
                    {faqs.map((faq, i) => (
                      <div key={i} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                        <p className="text-sm font-bold text-slate-900 mb-1.5">Q: {faq.q}</p>
                        <p className="text-sm text-slate-600 leading-relaxed">A: {faq.a}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ── H: Related Opportunities ─────────────────────────────── */}
              {related.length > 0 && (
                <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-5">
                  <h2 className="text-xl font-extrabold text-slate-900">Related Opportunities</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {related.map((r: any) => (
                      <Link
                        key={r.id}
                        href={`/opportunities/${r.slug}`}
                        className="group block p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-[#1D64EC]/30 hover:bg-blue-50/50 transition-all"
                      >
                        <p className="text-[11px] font-bold text-[#1D64EC] uppercase tracking-wider mb-1">
                          {r.category}
                        </p>
                        <p className="text-sm font-bold text-slate-900 group-hover:text-[#1D64EC] transition-colors leading-snug line-clamp-2">
                          {r.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">{r.organization}</p>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Back link */}
              <div className="pt-2">
                <Link
                  href="/opportunities"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#1D64EC] hover:underline"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to All Opportunities
                </Link>
              </div>
            </div>

            {/* ── Sidebar ─────────────────────────────────────────────────── */}
            <aside className="space-y-5">
              {/* Quick Facts */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
                <h3 className="text-base font-extrabold text-slate-900">Quick Facts</h3>

                <div className="space-y-3 text-sm">
                  <QuickFact label="Category" value={opportunity.category} />
                  <QuickFact label="Hosted by" value={opportunity.organization} />
                  <QuickFact label="Status" value={availStatus} highlight />
                  {opportunity.difficulty && (
                    <QuickFact label="Level" value={opportunity.difficulty} />
                  )}
                  {opportunity.participationType && (
                    <QuickFact label="Format" value={opportunity.participationType} />
                  )}
                  {opportunity.genderEligibility && (
                    <QuickFact label="Gender" value={opportunity.genderEligibility} />
                  )}
                  {opportunity.geographicRestrictions && (
                    <QuickFact label="Geography" value={opportunity.geographicRestrictions} />
                  )}
                </div>

                {opportunity.lastVerified && (
                  <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                    Last verified: {opportunity.lastVerified}
                  </p>
                )}
              </div>

              {/* Apply CTA */}
              {opportunity.applicationUrl && (
                <a
                  href={opportunity.applicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-5 py-3.5 bg-[#1D64EC] hover:bg-blue-700 text-white text-sm font-bold rounded-2xl transition shadow-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  Visit Official Portal
                </a>
              )}

              {/* Source URL */}
              {opportunity.sourceUrl && (
                <a
                  href={opportunity.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-5 py-3 border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold rounded-2xl transition"
                >
                  <Globe className="w-4 h-4" />
                  More Information
                </a>
              )}

              {/* Disclaimer */}
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-xs text-slate-600 leading-relaxed">
                <p className="font-bold text-amber-700 mb-1">⚠ Please Verify</p>
                <p>
                  Availability and eligibility details may change. Always confirm directly from the
                  official portal before applying.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer settings={settings} />
      {settings.scrollToTopEnabled !== false && <ScrollToTop />}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function EligibilityCard({
  label,
  value,
  icon: Icon,
  highlight,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  highlight?: boolean;
}) {
  // Try to parse as JSON array for pretty display
  let displayValue: string = value;
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      displayValue = parsed.join(", ");
    }
  } catch {}

  return (
    <div className={`p-4 rounded-2xl border ${highlight ? "bg-pink-50 border-pink-100" : "bg-slate-50 border-slate-100"}`}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon className={`w-4 h-4 ${highlight ? "text-pink-600" : "text-[#1D64EC]"}`} />
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      </div>
      <p className="text-sm font-semibold text-slate-800">{displayValue}</p>
    </div>
  );
}

function QuickFact({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-slate-500 text-xs font-medium shrink-0">{label}</span>
      <span className={`text-xs font-bold text-right ${highlight ? "text-[#1D64EC]" : "text-slate-800"}`}>
        {value}
      </span>
    </div>
  );
}
