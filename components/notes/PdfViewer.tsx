"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Maximize2,
  Minimize2,
  Download,
  RotateCw,
  Share2,
  Check,
  Loader2,
  FileText,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

interface PdfViewerProps {
  url?: string | null;
  title: string;
  domainName: string;
  domainSlug: string;
  category?: string | null;
  difficulty?: string | null;
  fileSize?: number | null;
  updatedAt?: string | null;
  totalPages?: number;
  downloadFileName?: string;
  onBack?: () => void;
  backHref?: string;
}

function fmtBytes(b?: number | null) {
  if (!b) return "";
  if (b < 1024 * 1024) return Math.round(b / 1024) + " KB";
  return (b / (1024 * 1024)).toFixed(1) + " MB";
}

export default function PdfViewer({
  url,
  title,
  domainName,
  domainSlug,
  category,
  difficulty,
  fileSize,
  updatedAt,
  totalPages: initialTotalPages = 1,
  downloadFileName,
  onBack,
  backHref = `/notes/${domainSlug}`,
}: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(initialTotalPages || 1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.1);
  const [rotation, setRotation] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [pageRendering, setPageRendering] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [pdfLibReady, setPdfLibReady] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfDocRef = useRef<any>(null);
  const renderTaskRef = useRef<any>(null);

  // 1. Load PDF.js library from Mozilla CDN once
  useEffect(() => {
    if (typeof window === "undefined") return;

    if ((window as any).pdfjsLib) {
      setPdfLibReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.async = true;
    script.onload = () => {
      const pdfjsLib = (window as any).pdfjsLib;
      if (pdfjsLib) {
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        setPdfLibReady(true);
      }
    };
    script.onerror = () => {
      setError("Failed to load PDF viewer engine. You can still download the document below.");
      setLoading(false);
    };
    document.head.appendChild(script);
  }, []);

  // 2. Load PDF document once URL and pdfjsLib are ready
  useEffect(() => {
    if (!pdfLibReady || !url) {
      if (!url) setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    const pdfjsLib = (window as any).pdfjsLib;
    const loadingTask = pdfjsLib.getDocument({
      url,
      withCredentials: true,
      cMapUrl: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/",
      cMapPacked: true,
    });

    loadingTask.promise
      .then((pdf: any) => {
        if (!isMounted) return;
        pdfDocRef.current = pdf;
        setNumPages(pdf.numPages);
        setCurrentPage(1);
        setLoading(false);
      })
      .catch((err: any) => {
        if (!isMounted) return;
        console.error("PDF loading error:", err);
        setError("Unable to render this PDF directly in the browser canvas. You can download or view it externally.");
        setLoading(false);
      });

    return () => {
      isMounted = false;
      if (loadingTask && loadingTask.destroy) {
        loadingTask.destroy();
      }
    };
  }, [pdfLibReady, url]);

  // 3. Render active page to Canvas with HiDPI support
  const renderPage = useCallback(
    async (pageNum: number) => {
      const pdfDoc = pdfDocRef.current;
      const canvas = canvasRef.current;
      if (!pdfDoc || !canvas) return;

      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch (e) {}
      }

      setPageRendering(true);

      try {
        const page = await pdfDoc.getPage(pageNum);
        const pixelRatio = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
        const viewport = page.getViewport({ scale, rotation });

        canvas.width = Math.floor(viewport.width * pixelRatio);
        canvas.height = Math.floor(viewport.height * pixelRatio);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

        const renderContext = {
          canvasContext: ctx,
          viewport,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;
        await renderTask.promise;
      } catch (err: any) {
        if (err?.name !== "RenderingCancelledException") {
          console.error("Page render error:", err);
        }
      } finally {
        setPageRendering(false);
      }
    },
    [scale, rotation]
  );

  useEffect(() => {
    if (pdfDocRef.current && !loading && !error) {
      renderPage(currentPage);
    }
  }, [currentPage, scale, rotation, loading, error, renderPage]);

  // Handlers
  const handlePrevPage = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const handleNextPage = () => setCurrentPage((p) => Math.min(p + 1, numPages));

  const handleZoomIn = () => setScale((s) => Math.min(parseFloat((s + 0.15).toFixed(2)), 2.5));
  const handleZoomOut = () => setScale((s) => Math.max(parseFloat((s - 0.15).toFixed(2)), 0.6));
  const handleResetZoom = () => setScale(1.1);

  const handleRotate = () => setRotation((r) => (r + 90) % 360);

  const handleDownload = () => {
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = downloadFileName || `${title.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShare = () => {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${
        isFullscreen
          ? "fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-md overflow-y-auto p-4 sm:p-8 flex flex-col items-center justify-start min-h-screen"
          : "w-full space-y-6"
      }`}
    >
      {/* ── Top Header Section (PTU PYQ Reference Style) ── */}
      {!isFullscreen && (
        <div className="space-y-4">
          {/* Breadcrumb back link */}
          <div>
            {onBack ? (
              <button
                onClick={onBack}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-900 transition group"
              >
                <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
                <span>{domainName}</span>
              </button>
            ) : (
              <Link
                href={backHref}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-900 transition group"
              >
                <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
                <span>{domainName}</span>
              </Link>
            )}
          </div>

          {/* Title and Action Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
            {/* Title & metadata */}
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {category && (
                  <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                    {category}
                  </span>
                )}
                {difficulty && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      difficulty === "Beginner"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : difficulty === "Intermediate"
                        ? "bg-blue-50 text-[#1D64EC] border border-blue-200"
                        : "bg-purple-50 text-purple-700 border border-purple-200"
                    }`}
                  >
                    {difficulty}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {title}
              </h1>

              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                {updatedAt && <span>Updated {updatedAt}</span>}
                {updatedAt && <span>·</span>}
                <span>
                  {numPages} {numPages === 1 ? "page" : "pages"}
                </span>
                <span>·</span>
                <span>PDF Format</span>
              </div>
            </div>

            {/* Right Action buttons: Share & Download */}
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
                title="Share note link"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Share</span>
                  </>
                )}
              </button>

              {url && (
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#bef264] hover:bg-[#a3e635] text-slate-900 border border-[#a3e635] shadow-xs transition hover:shadow-sm"
                  title="Download PDF"
                >
                  <Download className="w-4 h-4 text-slate-900" />
                  <span>Download {fmtBytes(fileSize)}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Document Display Canvas (White Paper Card on Light Slate) ── */}
      <div
        className={`relative flex items-center justify-center transition-all ${
          isFullscreen ? "w-full max-w-5xl py-8" : "w-full min-h-[600px] sm:min-h-[780px]"
        }`}
      >
        {/* Loading Spinner */}
        {loading && (
          <div className="flex flex-col items-center justify-center p-12 text-slate-500 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#1D64EC]" />
            <p className="text-xs font-semibold text-slate-600">
              Loading PDF document...
            </p>
          </div>
        )}

        {/* Error Fallback */}
        {!loading && error && (
          <div className="max-w-md w-full bg-white rounded-2xl border border-rose-200 p-6 text-center shadow-lg space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Document Reader Notice</h3>
              <p className="text-xs text-slate-500 mt-1">{error}</p>
            </div>
            {url && (
              <div className="flex gap-2 justify-center pt-2">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#1D64EC] text-white hover:bg-[#1a56d4] transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open in New Tab
                </a>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#bef264] text-slate-900 hover:bg-[#a3e635] transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download PDF
                </button>
              </div>
            )}
          </div>
        )}

        {/* Paper Container */}
        <div
          className={`relative bg-white rounded-xl shadow-xl border border-slate-200/90 overflow-hidden flex items-center justify-center transition-opacity ${
            loading || error ? "hidden" : "block"
          }`}
          style={{ minWidth: 280 }}
        >
          {pageRendering && (
            <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-[#1D64EC]" />
            </div>
          )}
          <canvas ref={canvasRef} className="block select-none" />
        </div>
      </div>

      {/* ── Floating Bottom Toolbar (Screenshot 5 Style) ── */}
      {!loading && !error && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <div className="flex items-center gap-2 sm:gap-3 bg-white/95 backdrop-blur-md border border-slate-200/90 px-3.5 sm:px-4 py-2 rounded-full shadow-2xl text-slate-700">
            {/* Zoom Out */}
            <button
              onClick={handleZoomOut}
              className="p-1 sm:p-1.5 rounded-full hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition"
              title="Zoom out"
              aria-label="Zoom out"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            {/* Zoom Percentage */}
            <button
              onClick={handleResetZoom}
              className="text-xs font-bold text-slate-700 hover:text-[#1D64EC] px-1 transition"
              title="Reset Zoom to 100%"
            >
              {Math.round((scale / 1.1) * 100)}%
            </button>

            {/* Zoom In */}
            <button
              onClick={handleZoomIn}
              className="p-1 sm:p-1.5 rounded-full hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition"
              title="Zoom in"
              aria-label="Zoom in"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>

            <div className="w-[1px] h-4 bg-slate-200 mx-0.5" />

            {/* Prev Page */}
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="p-1 sm:p-1.5 rounded-full hover:bg-slate-100 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent transition"
              title="Previous Page"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page Count */}
            <span className="text-xs font-semibold text-slate-700 whitespace-nowrap px-1">
              {currentPage} / {numPages}
            </span>

            {/* Next Page */}
            <button
              onClick={handleNextPage}
              disabled={currentPage >= numPages}
              className="p-1 sm:p-1.5 rounded-full hover:bg-slate-100 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent transition"
              title="Next Page"
              aria-label="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="w-[1px] h-4 bg-slate-200 mx-0.5" />

            {/* Rotate */}
            <button
              onClick={handleRotate}
              className="p-1 sm:p-1.5 rounded-full hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition"
              title="Rotate 90 degrees"
              aria-label="Rotate"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-1 sm:p-1.5 rounded-full hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              aria-label="Fullscreen"
            >
              {isFullscreen ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
