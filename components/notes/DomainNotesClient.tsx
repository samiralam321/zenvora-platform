"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ChevronRight,
  FileText,
  Eye,
  Download,
  BookOpen,
} from "lucide-react";
import { DomainNotes, NoteResource } from "@/lib/notesData";
import { getCategoryIcon } from "@/lib/notesIcons";

function fmtBytes(b?: number | null) {
  if (!b) return "";
  if (b < 1024 * 1024) return Math.round(b / 1024) + " KB";
  return (b / (1024 * 1024)).toFixed(1) + " MB";
}

export default function DomainNotesClient({ domain }: { domain: DomainNotes }) {
  const [selectedTopic, setSelectedTopic] = useState("All Notes");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");

  const IconComponent = getCategoryIcon(domain);

  // Filter notes based on topic, search query, and difficulty
  const filteredResources = useMemo(() => {
    return domain.resources.filter((res) => {
      // 1. Topic filter (case-insensitive & trimmed)
      if (
        selectedTopic !== "All Notes" &&
        res.topic.toLowerCase().trim() !== selectedTopic.toLowerCase().trim()
      ) {
        return false;
      }

      // 2. Difficulty filter
      if (selectedDifficulty !== "All" && res.difficulty !== selectedDifficulty) {
        return false;
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = res.title.toLowerCase().includes(q);
        const matchDesc = res.description.toLowerCase().includes(q);
        const matchTopic = res.topic.toLowerCase().includes(q);
        return matchTitle || matchDesc || matchTopic;
      }

      return true;
    });
  }, [domain.resources, selectedTopic, selectedDifficulty, searchQuery]);

  // Download handler — uses real storagePath (DB PDF) when available
  const handleDownload = (res: NoteResource, e: React.MouseEvent) => {
    e.stopPropagation();

    // If a real PDF is stored in DB, open it directly for download
    if ((res as any).storagePath) {
      const a = document.createElement("a");
      a.href = (res as any).storagePath;
      a.download = (res as any).downloadFileName || `${res.title}.pdf`;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    // Fallback: generate a text summary for static seed notes
    const contentLines: string[] = [
      `=============================================================`,
      `ZENVORA LEARNING PLATFORM - CURATED STUDENT NOTES`,
      `Document: ${res.title}`,
      `Domain: ${domain.name}`,
      `Topic: ${res.topic} | Level: ${res.difficulty} | Pages: ${res.pages}`,
      `Last Updated: ${res.lastUpdated}`,
      `=============================================================\n`,
    ];
    contentLines.push(`Downloaded from Zenvora (https://zenvora-platform.vercel.app/notes/${domain.slug})`);
    const blob = new Blob([contentLines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = res.downloadFileName.replace(".pdf", "-Summary.txt");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      {/* ── Top Header / Breadcrumbs Bar ── */}
      <section className="bg-white border-b border-slate-200/80 pt-28 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs text-slate-500 mb-4 font-medium">
            <Link href="/" className="hover:text-slate-900 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link href="/notes" className="hover:text-slate-900 transition-colors">
              Notes
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[#1D64EC] font-semibold">{domain.shortName}</span>
          </nav>

          {/* Heading */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EEF4FF] text-[#1D64EC] border border-blue-200/70 mb-3 shadow-2xs">
                <IconComponent className="w-3.5 h-3.5" />
                <span>Domain Library &bull; {domain.resources.length} Handbooks</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                {domain.name} Notes
              </h1>

              <p className="text-slate-600 text-xs sm:text-sm max-w-2xl mt-1.5 leading-relaxed font-normal">
                {domain.description} Explore full concept breakdowns, handwritten formulas,
                and interview-ready reference handbooks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main 2-Column Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ── LEFT COLUMN: Topic Sidebar ── */}
          <aside className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs sticky top-24">
              <div className="flex items-center gap-2.5 pb-3 mb-3 border-b border-slate-100">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: domain.badgeBg,
                    color: domain.badgeText,
                  }}
                >
                  <IconComponent className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {domain.shortName}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {Math.max(0, domain.topics.length - 1)} Specialization Topics
                  </p>
                </div>
              </div>

              {/* Topics List */}
              <nav className="space-y-1">
                {domain.topics.map((topic) => {
                  const isSelected = selectedTopic === topic;
                  const count =
                    topic === "All Notes"
                      ? domain.resources.length
                      : domain.resources.filter(
                          (r) => r.topic?.toLowerCase().trim() === topic.toLowerCase().trim()
                        ).length;

                  return (
                    <button
                      key={topic}
                      onClick={() => setSelectedTopic(topic)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between ${
                        isSelected
                          ? "bg-[#EEF4FF] text-[#1D64EC] font-bold shadow-2xs"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      <span className="truncate">{topic}</span>
                      {count > 0 && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                            isSelected
                              ? "bg-blue-100 text-[#1D64EC]"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* ── RIGHT COLUMN: Main Notes List ── */}
          <main className="lg:col-span-9 space-y-4">
            {/* Count indicator */}
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
              <span>
                Showing {filteredResources.length} of {domain.resources.length} notes
              </span>
              {selectedTopic !== "All Notes" && (
                <span className="text-[#1D64EC]">
                  Topic: <strong>{selectedTopic}</strong>
                </span>
              )}
            </div>

            {/* ── Notes Resources List ── */}
            <div className="space-y-4">
              {filteredResources.map((res) => (
                <div
                  key={res.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 group"
                >
                  {/* Left: Icon & Details */}
                  <div className="flex items-start gap-4 max-w-2xl">
                    {/* PDF Icon Badge */}
                    <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0 text-rose-600 shadow-2xs group-hover:scale-105 transition-transform">
                      <FileText className="w-6 h-6" />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {res.topic}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            res.difficulty === "Beginner"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : res.difficulty === "Intermediate"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : res.difficulty === "Advanced"
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {res.difficulty}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#1D64EC] transition-colors">
                        {res.title}
                      </h3>

                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                        {res.description}
                      </p>

                      <div className="flex items-center gap-2.5 text-[11px] text-slate-400 font-medium pt-1 flex-wrap">
                        <span>PDF Format</span>
                        <span>&bull;</span>
                        <span>
                          {res.pages && res.pages > 0
                            ? `${res.pages} Pages`
                            : "PDF Document"}
                        </span>
                        {res.fileSize && (
                          <>
                            <span>&bull;</span>
                            <span>{fmtBytes(res.fileSize)}</span>
                          </>
                        )}
                        <span>&bull;</span>
                        <span>Updated {res.lastUpdated}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Action Buttons */}
                  <div className="flex items-center gap-2.5 sm:self-center shrink-0">
                    <Link
                      href={`/notes/${domain.slug}/${res.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#EEF4FF] text-[#1D64EC] border border-blue-200/80 hover:bg-[#1D64EC] hover:text-white transition-all shadow-2xs group/btn cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Read Online</span>
                    </Link>

                    <button
                      onClick={(e) => handleDownload(res, e)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-2xs"
                      title="Download PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">Download</span>
                    </button>
                  </div>
                </div>
              ))}

              {domain.resources.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 sm:p-16 text-center shadow-xs">
                  <div className="w-14 h-14 rounded-2xl bg-[#EEF4FF] text-[#1D64EC] flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-7 h-7 text-[#1D64EC]" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">
                    No notes available yet
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                    New study materials will be added soon. Check back shortly or explore other domains in the meantime.
                  </p>
                </div>
              ) : filteredResources.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
                  <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-900 mb-1">
                    No notes matching your filter
                  </h3>
                  <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
                    Try switching to &quot;All Notes&quot; or clearing your search term to see
                    all available resources for this domain.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedTopic("All Notes");
                      setSelectedDifficulty("All");
                      setSearchQuery("");
                    }}
                    className="btn-primary text-xs font-semibold px-4 py-2"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : null}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
