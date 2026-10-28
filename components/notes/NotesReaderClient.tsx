"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Download,
  RotateCw,
  BookOpen,
  ArrowLeft,
  FileText,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  Headphones,
  Sliders,
} from "lucide-react";
import { DomainNotes, NoteResource, NoteChapter } from "@/lib/notesData";
import StudyMusicPlayer from "./StudyMusicPlayer";
import { StudyAudioProvider } from "./StudyAudioContext";

interface NotesReaderClientProps {
  domain: DomainNotes;
  resource: NoteResource;
}

export default function NotesReaderClient({
  domain,
  resource,
}: NotesReaderClientProps) {
  return (
    <StudyAudioProvider>
      <NotesReaderInner domain={domain} resource={resource} />
    </StudyAudioProvider>
  );
}

function NotesReaderInner({
  domain,
  resource,
}: NotesReaderClientProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const totalPages = resource.outline.length || resource.chapters.length || 8;
  const currentChapter =
    resource.chapters.find((ch) => ch.pageNumber === currentPage) ||
    resource.chapters[0] || {
      id: "ch-1",
      pageNumber: currentPage,
      title: `${resource.title} - Page ${currentPage}`,
      content: [
        {
          type: "paragraph",
          text: `Study notes and deep-dive conceptual breakdown for ${resource.title}.`,
        },
      ],
    };

  // Keyboard navigation for page flipping and fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === "ArrowRight" || e.key === "PageDown") {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
      } else if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [totalPages, isFullscreen]);

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 15, 175));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 15, 75));
  const handleResetZoom = () => setZoomLevel(100);
  const handleRotate = () => setRotation((r) => (r + 90) % 360);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2500);
  };

  // Download printable/text summary
  const handleDownload = () => {
    const lines: string[] = [
      `=============================================================`,
      `ZENVORA LEARNING PLATFORM - OFFICIAL STUDY HANDBOOK`,
      `Document: ${resource.title}`,
      `Domain: ${domain.name}`,
      `Total Pages: ${resource.pages} | Difficulty: ${resource.difficulty}`,
      `=============================================================\n`,
      ...resource.chapters.map((ch) => {
        const parts = [`--- PAGE ${ch.pageNumber}: ${ch.title} ---`];
        if (ch.subtitle) parts.push(`Subtitle: ${ch.subtitle}`);
        ch.content.forEach((c) => {
          if (c.heading) parts.push(`\n[${c.heading}]`);
          if (c.text) parts.push(c.text);
          if (c.points) parts.push(c.points.map((p) => `  * ${p}`).join("\n"));
          if (c.code) parts.push(`\n\`\`\`${c.code.language}\n${c.code.snippet}\n\`\`\``);
        });
        return parts.join("\n");
      }),
      `\nDownloaded from Zenvora Notes (https://zenvora-platform.vercel.app/notes/${domain.slug}/${resource.id})`,
    ];

    const blob = new Blob([lines.join("\n\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = resource.downloadFileName.replace(".pdf", "-Handbook.txt");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`min-h-screen bg-[#F1F5F9] font-sans text-slate-900 transition-colors ${
        isFullscreen ? "fixed inset-0 z-50 overflow-hidden bg-slate-950 text-white" : "pb-16"
      }`}
    >
      {/* ── Top Bar ── */}
      <header
        className={`border-b transition-colors ${
          isFullscreen
            ? "bg-slate-900/95 border-slate-800 text-white px-4 py-3"
            : "bg-white border-slate-200/80 pt-24 pb-3.5 px-4 sm:px-6 lg:px-8"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Breadcrumb / Title */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href={`/notes/${domain.slug}`}
              className={`p-2 rounded-xl transition ${
                isFullscreen
                  ? "bg-slate-800 text-slate-300 hover:text-white"
                  : "bg-slate-100 text-slate-600 hover:text-slate-900"
              }`}
              title="Back to domain notes"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div className="min-w-0">
              <nav className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 font-medium truncate mb-0.5">
                <Link href="/notes" className="hover:text-slate-900">
                  Notes
                </Link>
                <span>/</span>
                <Link href={`/notes/${domain.slug}`} className="hover:text-slate-900">
                  {domain.shortName}
                </Link>
                <span>/</span>
                <span className="text-[#1D64EC] truncate font-semibold">
                  {resource.title}
                </span>
              </nav>

              <h1
                className={`text-sm sm:text-base font-bold truncate ${
                  isFullscreen ? "text-white" : "text-slate-900"
                }`}
              >
                {resource.title}
              </h1>
            </div>
          </div>

          {/* Quick Reader Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDownload}
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                isFullscreen
                  ? "border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
              title="Download Notes"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-xs ${
                isFullscreen
                  ? "bg-rose-600 hover:bg-rose-700 text-white"
                  : "bg-[#1D64EC] hover:bg-[#1554C8] text-white"
              }`}
              title={isFullscreen ? "Exit Fullscreen (Esc)" : "Fullscreen Mode"}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span>Exit Fullscreen</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Fullscreen</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Workspace ── */}
      <div
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${
          isFullscreen ? "h-[calc(100vh-60px)] p-2" : "py-6"
        }`}
      >
        <div
          className={`grid gap-6 ${
            isFullscreen
              ? "grid-cols-1 h-full"
              : "grid-cols-1 lg:grid-cols-12"
          }`}
        >
          {/* ── REGION 1: Left Document Navigation (Hidden in Fullscreen) ── */}
          {!isFullscreen && (
            <aside className="lg:col-span-3 space-y-5">
              {/* Table of Contents Card */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
                <div className="flex items-center gap-2.5 pb-3 mb-3 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-slate-900 truncate">
                      {resource.title}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {totalPages} Pages &bull; {resource.difficulty}
                    </p>
                  </div>
                </div>

                {/* Chapter Outline List */}
                <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
                  {resource.outline.map((item) => {
                    const isCurrent = currentPage === item.pageNumber;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setCurrentPage(item.pageNumber)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all flex items-center justify-between ${
                          isCurrent
                            ? "bg-[#EEF4FF] text-[#1D64EC] font-bold shadow-2xs"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium"
                        }`}
                      >
                        <span className="truncate pr-2">{item.title}</span>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                            isCurrent
                              ? "bg-blue-100 text-[#1D64EC]"
                              : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          p.{item.pageNumber}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Related Notes Card */}
              {resource.relatedNotes && resource.relatedNotes.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Related Handbooks
                  </h4>
                  <div className="space-y-2">
                    {resource.relatedNotes.map((rel) => (
                      <Link
                        key={rel.id}
                        href={`/notes/${rel.domainSlug}/${rel.id}`}
                        className="block p-2.5 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200/60"
                      >
                        <p className="text-xs font-bold text-slate-800 line-clamp-1 hover:text-[#1D64EC] transition-colors">
                          {rel.title}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {rel.pages} pages &bull; Available
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          )}

          {/* ── REGION 2: Center PDF Canvas & Toolbar ── */}
          <main
            className={`${
              isFullscreen
                ? "col-span-1 h-full flex flex-col"
                : "lg:col-span-6 flex flex-col"
            }`}
          >
            {/* ── PDF Toolbar ── */}
            <div
              className={`rounded-2xl border p-2.5 mb-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs ${
                isFullscreen
                  ? "bg-slate-900 border-slate-800 text-white"
                  : "bg-white border-slate-200/80 text-slate-700"
              }`}
            >
              {/* Page navigation */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage <= 1}
                  className="p-1.5 rounded-lg border border-slate-200/60 hover:bg-slate-100 disabled:opacity-40 transition"
                  title="Previous page (Left arrow)"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1 px-2 text-xs font-bold font-mono">
                  <span>{currentPage}</span>
                  <span className="text-slate-400">/</span>
                  <span className="text-slate-400">{totalPages}</span>
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage >= totalPages}
                  className="p-1.5 rounded-lg border border-slate-200/60 hover:bg-slate-100 disabled:opacity-40 transition"
                  title="Next page (Right arrow)"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Zoom controls */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 75}
                  className="p-1.5 rounded-lg border border-slate-200/60 hover:bg-slate-100 disabled:opacity-40 transition"
                  title="Zoom Out"
                  aria-label="Zoom out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleResetZoom}
                  className="px-2 py-1 text-xs font-semibold rounded-lg hover:bg-slate-100 font-mono"
                  title="Reset Zoom to 100%"
                >
                  {zoomLevel}%
                </button>

                <button
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 175}
                  className="p-1.5 rounded-lg border border-slate-200/60 hover:bg-slate-100 disabled:opacity-40 transition"
                  title="Zoom In"
                  aria-label="Zoom in"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleRotate}
                  className="p-1.5 rounded-lg border border-slate-200/60 hover:bg-slate-100 transition hidden sm:inline-flex"
                  title="Rotate 90 degrees"
                  aria-label="Rotate"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* ── PDF Page Canvas ── */}
            <div
              className={`flex-1 overflow-auto rounded-3xl p-4 sm:p-8 flex justify-center items-start border transition-all ${
                isFullscreen
                  ? "bg-slate-900/60 border-slate-800"
                  : "bg-slate-200/60 border-slate-300/70"
              }`}
            >
              {/* White A4-proportioned Document Page */}
              <article
                className="bg-white text-slate-900 rounded-2xl shadow-xl border border-slate-200/90 w-full max-w-2xl min-h-[780px] p-8 sm:p-12 transition-all flex flex-col justify-between"
                style={{
                  transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                  transformOrigin: "top center",
                }}
              >
                {/* Document Page Header */}
                <div>
                  <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#1D64EC]" />
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Zenvora Notes &bull; {domain.shortName}
                      </span>
                    </div>

                    <span className="text-xs font-mono font-semibold text-slate-400">
                      Page {currentPage} of {totalPages}
                    </span>
                  </div>

                  {/* Chapter Heading */}
                  <div className="mb-6">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
                      {currentChapter.title}
                    </h2>
                    {currentChapter.subtitle && (
                      <p className="text-xs sm:text-sm font-semibold text-[#1D64EC] mt-1">
                        {currentChapter.subtitle}
                      </p>
                    )}
                  </div>

                  {/* Chapter Content Items */}
                  <div className="space-y-5 text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                    {currentChapter.content.map((item, idx) => {
                      if (item.type === "paragraph" && item.text) {
                        return (
                          <div key={idx}>
                            {item.heading && (
                              <h4 className="font-bold text-slate-900 text-sm mb-1.5">
                                {item.heading}
                              </h4>
                            )}
                            <p className="text-slate-700 leading-relaxed">
                              {item.text}
                            </p>
                          </div>
                        );
                      }

                      if (item.type === "points" && item.points) {
                        return (
                          <div
                            key={idx}
                            className="bg-[#F8FAFC] rounded-xl p-4 border border-slate-200/80 my-3"
                          >
                            {item.heading && (
                              <h4 className="font-bold text-slate-900 text-xs sm:text-sm mb-2.5 flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                {item.heading}
                              </h4>
                            )}
                            <ul className="space-y-1.5 text-xs text-slate-700">
                              {item.points.map((pt, pIdx) => (
                                <li key={pIdx} className="flex items-start gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#1D64EC] mt-1.5 shrink-0" />
                                  <span>{pt}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      }

                      if (item.type === "code" && item.code) {
                        const codeId = `code-${currentPage}-${idx}`;
                        const isCopied = copiedCodeId === codeId;
                        return (
                          <div
                            key={idx}
                            className="relative rounded-xl overflow-hidden bg-slate-900 text-slate-100 my-4 shadow-sm border border-slate-800"
                          >
                            <div className="flex items-center justify-between px-4 py-2 bg-slate-950/80 border-b border-slate-800 text-[11px] text-slate-400 font-mono">
                              <span>{item.code.language}</span>
                              <button
                                onClick={() => copyToClipboard(item.code!.snippet, codeId)}
                                className="flex items-center gap-1 text-slate-400 hover:text-white transition"
                              >
                                {isCopied ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    <span className="text-emerald-400">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <pre className="p-4 text-xs font-mono leading-relaxed overflow-x-auto text-emerald-300 selection:bg-blue-600 selection:text-white">
                              <code>{item.code.snippet}</code>
                            </pre>
                          </div>
                        );
                      }

                      if (item.type === "table" && item.table) {
                        return (
                          <div
                            key={idx}
                            className="rounded-xl overflow-hidden border border-slate-200 my-4"
                          >
                            {item.heading && (
                              <div className="bg-slate-50 px-4 py-2 font-bold text-xs text-slate-800 border-b border-slate-200">
                                {item.heading}
                              </div>
                            )}
                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                  <tr className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200">
                                    {item.table.headers.map((h, hIdx) => (
                                      <th key={hIdx} className="p-2.5">
                                        {h}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {item.table.rows.map((r, rIdx) => (
                                    <tr
                                      key={rIdx}
                                      className="border-b border-slate-100 hover:bg-slate-50/50"
                                    >
                                      {r.map((cell, cIdx) => (
                                        <td key={cIdx} className="p-2.5 font-mono text-[11px]">
                                          {cell}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        );
                      }

                      if (item.type === "note" && item.text) {
                        return (
                          <div
                            key={idx}
                            className="bg-amber-50/70 rounded-xl p-4 border border-amber-200/80 my-3 text-xs text-amber-900 leading-relaxed"
                          >
                            {item.heading && (
                              <h5 className="font-bold text-amber-950 mb-1 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                                {item.heading}
                              </h5>
                            )}
                            <p>{item.text}</p>
                          </div>
                        );
                      }

                      return null;
                    })}
                  </div>
                </div>

                {/* Document Page Footer */}
                <div className="pt-8 mt-12 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Zenvora Curriculum 2026</span>
                  <div className="flex items-center gap-2">
                    <span>{resource.downloadFileName}</span>
                    <span>&bull;</span>
                    <span className="font-mono">Page {currentPage}</span>
                  </div>
                </div>
              </article>
            </div>
          </main>

          {/* ── REGION 3: Right "Study with Music" Sidebar (Hidden in Fullscreen) ── */}
          {!isFullscreen && (
            <aside className="lg:col-span-3">
              <div className="sticky top-24">
                <StudyMusicPlayer />
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* ── Fullscreen Floating Mini Music Player ── */}
      {isFullscreen && (
        <div className="fixed bottom-6 right-6 z-50">
          <StudyMusicPlayer isMini />
        </div>
      )}
    </div>
  );
}
