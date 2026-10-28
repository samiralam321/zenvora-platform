"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Download,
  RotateCw,
  ArrowLeft,
  Loader2,
  FileText,
  AlertCircle,
  RefreshCw,
  Expand,
} from "lucide-react";

interface PdfViewerProps {
  url?: string | null;
  title: string;
  domainName: string;
  domainSlug: string;
  totalPages?: number;
  downloadFileName?: string;
  onBack?: () => void;
  backHref?: string;
}

export default function PdfViewer({
  url,
  title,
  domainName,
  domainSlug,
  totalPages: initialTotalPages = 1,
  downloadFileName,
  onBack,
  backHref,
}: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(initialTotalPages || 1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.2);
  const [rotation, setRotation] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [pageRendering, setPageRendering] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [pdfLibReady, setPdfLibReady] = useState<boolean>(false);

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
      if (!url) {
        setLoading(false);
      }
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
        setError("Unable to render this PDF in the canvas. You can read using the fallback viewer or download below.");
        setLoading(false);
      });

    return () => {
      isMounted = false;
      if (loadingTask && loadingTask.destroy) {
        loadingTask.destroy();
      }
    };
  }, [pdfLibReady, url]);

  // 3. Render active page to Canvas
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
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const viewport = page.getViewport({ scale, rotation });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

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

  // Navigation handlers
  const handlePrevPage = () => {
    setCurrentPage((p) => Math.max(p - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((p) => Math.min(p + 1, numPages));
  };

  const handlePageJump = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 1 && val <= numPages) {
      setCurrentPage(val);
    }
  };

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.2, 2.5));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.2, 0.6));
  const handleResetZoom = () => setScale(1.2);

  const handleFitWidth = () => {
    if (!containerRef.current || !pdfDocRef.current) return;
    pdfDocRef.current.getPage(currentPage).then((page: any) => {
      const unscaledViewport = page.getViewport({ scale: 1 });
      const containerWidth = containerRef.current?.clientWidth || 800;
      const availableWidth = containerWidth - 48; // padding
      const newScale = Math.max(0.6, Math.min(availableWidth / unscaledViewport.width, 2.2));
      setScale(parseFloat(newScale.toFixed(2)));
    });
  };

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

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div
      className={`flex flex-col bg-[#0F172A] text-slate-100 ${
        isFullscreen ? "fixed inset-0 z-50 h-screen w-screen" : "w-full min-h-[85vh] rounded-3xl overflow-hidden shadow-2xl border border-slate-800"
      }`}
    >
      {/* ── Top Bar / Header ── */}
      <div className="bg-[#1E293B] border-b border-slate-700/80 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
        {/* Left: Back button & Title */}
        <div className="flex items-center gap-3 min-w-0">
          {onBack ? (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title="Return to notes list"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : backHref ? (
            <a
              href={backHref}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title="Return to notes list"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </a>
          ) : null}

          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
            <h2 className="text-xs sm:text-sm font-bold text-white truncate max-w-xs sm:max-w-md lg:max-w-lg">
              {title}
            </h2>
            <span className="hidden md:inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {domainName}
            </span>
          </div>
        </div>

        {/* Center: Page Navigation Controls */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-700 px-2 py-1 rounded-xl">
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 1 || loading}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition"
            title="Previous Page"
            aria-label="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1 text-xs font-mono font-bold px-1.5">
            <input
              type="number"
              min={1}
              max={numPages}
              value={currentPage}
              onChange={handlePageJump}
              className="w-10 bg-slate-800 text-center rounded border border-slate-700 text-xs py-0.5 text-white focus:outline-none focus:border-blue-500"
            />
            <span className="text-slate-400">/</span>
            <span className="text-slate-400">{numPages}</span>
          </div>

          <button
            onClick={handleNextPage}
            disabled={currentPage >= numPages || loading}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition"
            title="Next Page"
            aria-label="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Zoom, Fit, Rotate, Download, Fullscreen */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Zoom controls */}
          <div className="flex items-center gap-0.5 bg-slate-900/80 border border-slate-700 rounded-xl p-0.5">
            <button
              onClick={handleZoomOut}
              disabled={scale <= 0.6 || loading}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition"
              title="Zoom Out"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="px-2 text-[11px] font-mono font-bold text-slate-300 hover:text-white"
              title="Reset Zoom (100%)"
            >
              {Math.round((scale / 1.2) * 100)}%
            </button>
            <button
              onClick={handleZoomIn}
              disabled={scale >= 2.5 || loading}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition"
              title="Zoom In"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleFitWidth}
            disabled={loading}
            className="p-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition hidden sm:inline-flex"
            title="Fit to Width"
          >
            <Expand className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleRotate}
            disabled={loading}
            className="p-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition hidden md:inline-flex"
            title="Rotate 90 degrees"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          {/* Download button */}
          {url && (
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#1D64EC] hover:bg-[#1a56d4] text-white transition shadow-sm"
              title="Download original PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>
          )}

          {/* Fullscreen toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ── Document Viewer Canvas Area ── */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center items-start bg-[#0B1120] relative min-h-[500px]"
        style={{
          backgroundImage: "radial-gradient(circle, #1E293B 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      >
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0B1120]/80 backdrop-blur-xs z-20">
            <Loader2 className="w-10 h-10 text-[#1D64EC] animate-spin mb-3" />
            <p className="text-sm font-semibold text-slate-300">Loading PDF document...</p>
            <p className="text-xs text-slate-500 mt-1">Preparing in-platform reading interface</p>
          </div>
        )}

        {pageRendering && !loading && (
          <div className="absolute top-4 right-4 z-20 bg-slate-900/90 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 shadow-lg">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1D64EC]" />
            <span>Rendering Page {currentPage}...</span>
          </div>
        )}

        {error ? (
          <div className="max-w-md my-auto text-center p-8 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl">
            <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-2">Notice</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">{error}</p>

            {url && (
              <div className="space-y-3">
                <a
                  href={url}
                  download={downloadFileName || "document.pdf"}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1D64EC] text-white text-xs font-bold hover:bg-[#1a56d4] transition"
                >
                  <Download className="w-4 h-4" />
                  Download PDF Directly
                </a>
              </div>
            )}
          </div>
        ) : !url ? (
          <div className="max-w-md my-auto text-center p-8 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl">
            <FileText className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">No PDF Attached</h3>
            <p className="text-xs text-slate-400">
              This note does not have an attached PDF file yet.
            </p>
          </div>
        ) : (
          <div className="relative shadow-2xl transition-all duration-200">
            <canvas
              ref={canvasRef}
              className="bg-white rounded-xl shadow-2xl max-w-full block"
            />
          </div>
        )}
      </div>

      {/* ── Bottom Status Bar ── */}
      <div className="bg-[#1E293B] border-t border-slate-800 px-4 py-2 flex items-center justify-between text-[11px] text-slate-400 font-medium">
        <span>
          ZenVora Reader &bull; Viewing directly in platform
        </span>
        <span>
          Page {currentPage} of {numPages}
        </span>
      </div>
    </div>
  );
}
