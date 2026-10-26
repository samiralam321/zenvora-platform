"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Copy, Check, Lock, Download, Video, ArrowUpRight, CheckCircle2, Loader2, BookOpen, Sparkles } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ResourceItem {
  id: string;
  title: string;
  description: string;
  promptText?: string | null;
  fileUrl?: string | null;
  locked: boolean;
  category?: Category | null;
  video?: {
    id: string;
    youtubeId: string;
    title: string;
  } | null;
}

interface ResourcesClientProps {
  resources: ResourceItem[];
  categories: Category[];
  isInitiallyUnlocked: boolean;
  unlockMode: "required" | "optional" | "public";
}

export default function ResourcesClient({
  resources,
  categories,
  isInitiallyUnlocked,
  unlockMode = "required",
}: ResourcesClientProps) {
  const [unlocked, setUnlocked] = useState(
    isInitiallyUnlocked || unlockMode === "public"
  );
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [interest, setInterest] = useState("Full Stack Architecture");
  const [consent, setConsent] = useState(true);
  const [honeypot, setHoneypot] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  const handleCopyPrompt = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleUnlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (honeypot) return;

    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError("Please fill in your name, email, and WhatsApp number.");
      return;
    }

    if (!consent) {
      setError("Please accept the terms to unlock resources.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          interest,
          source: "resources_page",
          consent,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit.");
      }

      setFormSuccess(true);
      setTimeout(() => {
        setUnlocked(true);
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = resources.filter((item) => {
    if (selectedCategory === "all") return true;
    return item.category?.slug === selectedCategory;
  });

  return (
    <div className="pt-28 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white text-slate-900 font-sans">
      {/* Header */}
      <div className="text-left mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEF4FF] text-[#1D64EC] text-xs font-bold mb-3 uppercase tracking-wider">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Student Vault</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-slate-900 tracking-tight mb-3">
          Curated Student Resources &amp; Notes
        </h1>
        <p className="text-slate-500 text-base sm:text-lg max-w-2xl leading-relaxed">
          Production starter code, architectural blueprints, cheat sheets, and checklists for Web Dev, Backend, Full Stack, AI/ML, and GenAI.
        </p>
      </div>

      {/* Featured Entry Point for Opportunities & Programs */}
      <div className="mb-12 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider border border-blue-400/20">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Opportunities &amp; Programs</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Discover Opportunities Beyond the Classroom
          </h2>
          <p className="text-slate-300 text-xs sm:text-base leading-relaxed">
            Explore open-source programs, hackathons, coding contests, internships, scholarships, and student communities that help you learn, build, and grow.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/opportunities"
              className="px-5 py-2.5 rounded-xl bg-[#1D64EC] hover:bg-blue-600 text-white text-xs font-bold transition shadow-xs inline-flex items-center gap-1.5"
            >
              <span>Explore All Verified Opportunities</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* If Gated and not yet unlocked: Show Form */}
      {!unlocked ? (
        <div className="max-w-xl mx-auto my-8 p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-xl text-left">
          {formSuccess ? (
            <div className="py-12 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                Student Vault Unlocked!
              </h3>
              <p className="text-slate-500 text-sm">
                Access is granted. All roadmaps, code snippets, and cheat sheets are now available below.
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-[#EEF4FF] text-[#1D64EC] flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <span className="text-xs uppercase tracking-wider text-[#1D64EC] font-bold">
                  Free 1-Click Access
                </span>
              </div>

              <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
                Unlock All Student Study Materials
              </h2>
              <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                Enter your details to instantly access the full repository. You will never be asked again on this browser.
              </p>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs">
                  {error}
                </div>
              )}

              <form onSubmit={handleUnlockSubmit} className="space-y-4">
                <input
                  type="text"
                  name="trap"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  style={{ display: "none" }}
                  tabIndex={-1}
                  autoComplete="off"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-[#1D64EC]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-[#1D64EC]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      WhatsApp / Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-[#1D64EC]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Primary Learning Interest
                    </label>
                    <select
                      value={interest}
                      onChange={(e) => setInterest(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-slate-900 text-sm bg-white focus:outline-none focus:border-[#1D64EC]"
                    >
                      <option value="Web Development">Web Development</option>
                      <option value="Backend Engineering">Backend Engineering</option>
                      <option value="Full Stack Architecture">Full Stack Architecture</option>
                      <option value="AI & Machine Learning">AI &amp; Machine Learning</option>
                      <option value="Generative AI & LLMs">Generative AI &amp; LLMs</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-start gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="consent"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-1 rounded text-[#1D64EC] focus:ring-[#1D64EC]"
                  />
                  <label htmlFor="consent" className="text-xs text-slate-500 leading-normal">
                    I agree to receive student engineering roadmaps and updates from Zenvora. You can unsubscribe anytime.
                  </label>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-3 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 shadow-sm"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Unlocking Resources...</span>
                      </>
                    ) : (
                      <span>Unlock All Free Resources</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      ) : null}

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 my-8 scrollbar-hide">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`shrink-0 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
            selectedCategory === "all"
              ? "bg-[#1D64EC] text-white shadow-2xs font-semibold"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          All Resources ({resources.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.slug)}
            className={`shrink-0 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              selectedCategory === cat.slug
                ? "bg-[#1D64EC] text-white shadow-2xs font-semibold"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Resources Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {selectedCategory === "opportunities-programs" && (
          <div className="col-span-full bg-gradient-to-br from-[#EEF4FF] to-white rounded-3xl p-8 sm:p-12 border border-blue-100 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#1D64EC] text-white flex items-center justify-center mx-auto shadow-sm">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">
              Dedicated Opportunities &amp; Programs Hub
            </h3>
            <p className="text-slate-600 text-sm max-w-lg mx-auto leading-relaxed">
              Explore verified open-source mentorships (GSoC, LFX, Outreachy), coding championships (ICPC, Codeforces), hackathons (SIH, MLH), and tech fellowships with step-by-step application guides.
            </p>
            <div className="pt-2">
              <Link
                href="/opportunities"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1D64EC] text-white text-xs font-bold hover:bg-blue-700 transition shadow-xs"
              >
                <span>Browse All Verified Opportunities &rarr;</span>
              </Link>
            </div>
          </div>
        )}

        {filteredResources.map((item) => {
          const isLocked = item.locked && !unlocked;

          return (
            <div
              key={item.id}
              className={`rounded-2xl border transition-all flex flex-col justify-between p-6 bg-white ${
                isLocked
                  ? "border-slate-200 opacity-80"
                  : "border-slate-200 shadow-2xs hover:shadow-md hover:border-blue-200"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-[#EEF4FF] text-[#1D64EC]">
                    {item.category?.name || "General"}
                  </span>

                  {isLocked && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      <Lock className="w-3 h-3" />
                      <span>Unlock Above</span>
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {item.title}
                </h3>

                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-4">
                  {item.description}
                </p>

                {item.promptText && (
                  <div className="relative mb-4">
                    <pre
                      className={`p-3.5 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto whitespace-pre-wrap ${
                        isLocked ? "blur-xs select-none max-h-24" : "max-h-48"
                      }`}
                    >
                      {item.promptText}
                    </pre>

                    {!isLocked && (
                      <button
                        onClick={() => handleCopyPrompt(item.id, item.promptText!)}
                        className="absolute top-2 right-2 p-1.5 rounded-md bg-white/20 hover:bg-white/30 text-white transition text-xs flex items-center gap-1 backdrop-blur-xs"
                        title="Copy to clipboard"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-[10px] text-emerald-300">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span className="text-[10px]">Copy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                {item.fileUrl && !isLocked ? (
                  <a
                    href={item.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-[#1D64EC] hover:underline flex items-center gap-1"
                  >
                    <span>View Docs / Repo</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span className="text-xs text-slate-400">
                    {isLocked ? "Complete form to reveal" : "Ready to use"}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
