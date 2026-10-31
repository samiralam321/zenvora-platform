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
  BookOpen,
  LayoutGrid,
  List,
  Scan,
  Maximize,
  ArrowLeft,
  X,
  Bookmark,
  RefreshCw,
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
  const [inputPage, setInputPage] = useState<string>("1");
  const [scale, setScale] = useState<number>(1.15);
  const [zoomMode, setZoomMode] = useState<"custom" | "fit-width" | "fit-page">("custom");
  const [rotation, setRotation] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [pageRendering, setPageRendering] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [pdfLibReady, setPdfLibReady] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [outline, setOutline] = useState<any[]>([]);
  const [sidebarMode, setSidebarMode] = useState<"none" | "outline" | "thumbnails">("none");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const annotationLayerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pdfDocRef = useRef<any>(null);
  const renderTaskRef = useRef<any>(null);
  const pageAnnotationsRef = useRef<any[]>([]);

  // Sync input box with active page
  useEffect(() => {
    setInputPage(currentPage.toString());
  }, [currentPage]);

  // 1. Load PDF.js library, companion viewer helper & annotation stylesheet from Mozilla CDN once
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!document.getElementById("pdfjs-viewer-css")) {
      const link = document.createElement("link");
      link.id = "pdfjs-viewer-css";
      link.rel = "stylesheet";
      link.href = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf_viewer.min.css";
      document.head.appendChild(link);
    }

    const loadViewerHelperScript = () => {
      if (!document.getElementById("pdfjs-viewer-js")) {
        const vScript = document.createElement("script");
        vScript.id = "pdfjs-viewer-js";
        vScript.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf_viewer.min.js";
        vScript.async = true;
        document.head.appendChild(vScript);
      }
    };

    if ((window as any).pdfjsLib) {
      loadViewerHelperScript();
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
        loadViewerHelperScript();
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
  const loadDocument = useCallback(() => {
    if (!pdfLibReady || !url) {
      if (!url) setLoading(false);
      return;
    }

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
        pdfDocRef.current = pdf;
        setNumPages(pdf.numPages);
        setLoading(false);

        // Fetch document outline / bookmarks
        pdf
          .getOutline()
          .then((out: any) => {
            if (out && Array.isArray(out) && out.length > 0) {
              setOutline(out);
            }
          })
          .catch(() => {});
      })
      .catch((err: any) => {
        console.error("PDF loading error:", err);
        setError("Unable to render this PDF directly in the browser canvas. You can download or view it externally.");
        setLoading(false);
      });
  }, [pdfLibReady, url]);

  useEffect(() => {
    loadDocument();
  }, [loadDocument]);

  // Robust destination navigation resolver (handles strings, refs, arrays, direct page numbers)
  const navigateToDestination = useCallback(
    async (dest: any) => {
      try {
        const pdf = pdfDocRef.current;
        if (!pdf || !dest) return;

        let explicitDest = dest;
        // 1. Resolve if dest is a thenable/promise
        if (explicitDest && typeof explicitDest.then === "function") {
          explicitDest = await explicitDest;
        }

        // 2. Resolve named destination string (e.g., "page.4" or "section-2")
        if (typeof explicitDest === "string") {
          explicitDest = await pdf.getDestination(explicitDest);
        }
        if (explicitDest && typeof explicitDest.then === "function") {
          explicitDest = await explicitDest;
        }
        if (typeof explicitDest === "string") {
          explicitDest = await pdf.getDestination(explicitDest);
        }

        // 3. Resolve explicit destination array [ pageRefOrNum, { name: "XYZ" }, ... ]
        if (Array.isArray(explicitDest) && explicitDest.length > 0) {
          const destRef = explicitDest[0];
          // PDF object ref e.g. { num: 15, gen: 0 }
          if (destRef && typeof destRef === "object") {
            const pageIndex = await pdf.getPageIndex(destRef);
            if (typeof pageIndex === "number" && !isNaN(pageIndex) && pageIndex >= 0) {
              const targetPage = pageIndex + 1;
              if (targetPage >= 1 && targetPage <= numPages) {
                setCurrentPage(targetPage);
                scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                return;
              }
            }
          } else if (Number.isInteger(destRef)) {
            // In PDF explicit dest arrays, an integer pageRef is 0-based page index
            const targetPage = destRef + 1;
            if (targetPage >= 1 && targetPage <= numPages) {
              setCurrentPage(targetPage);
              scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
              return;
            }
          }
        }

        // 4. Resolve direct number
        if (typeof dest === "number" && dest >= 1 && dest <= numPages) {
          setCurrentPage(dest);
          scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }

        // 5. Resolve object with pageNumber property
        if (dest && typeof dest === "object" && typeof dest.pageNumber === "number") {
          const p = dest.pageNumber;
          if (p >= 1 && p <= numPages) {
            setCurrentPage(p);
            scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
            return;
          }
        }
      } catch (err) {
        console.warn("PDF link navigation failed:", err);
      }
    },
    [numPages]
  );

  // 3. Render active page to Canvas with HiDPI and AnnotationLayer
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

        // Render interactive annotations (links, buttons, bookmarks, TOC jumps)
        const annotDiv = annotationLayerRef.current;
        if (annotDiv) {
          annotDiv.innerHTML = "";
          annotDiv.style.width = `${Math.floor(viewport.width)}px`;
          annotDiv.style.height = `${Math.floor(viewport.height)}px`;
          annotDiv.style.setProperty("--scale-factor", viewport.scale.toString());
          annotDiv.style.setProperty("--scale-round-x", "1px");
          annotDiv.style.setProperty("--scale-round-y", "1px");

          const wrapper = annotDiv.parentElement;
          if (wrapper) {
            wrapper.style.width = `${Math.floor(viewport.width)}px`;
            wrapper.style.height = `${Math.floor(viewport.height)}px`;
            wrapper.style.setProperty("--scale-factor", viewport.scale.toString());
          }

          try {
            const annotations = await page.getAnnotations({ intent: "display" });
            pageAnnotationsRef.current = annotations || [];
            const pdfjs = (window as any).pdfjsLib;

            if (annotations && annotations.length > 0 && pdfjs?.AnnotationLayer) {
              // Full-featured custom PDF link service
              const linkService: any = {
                get pagesCount() {
                  return numPages;
                },
                get page() {
                  return currentPage;
                },
                set page(val: number) {
                  if (typeof val === "number" && val >= 1 && val <= numPages) {
                    setCurrentPage(val);
                    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                  }
                },
                get rotation() {
                  return rotation;
                },
                getDestinationHash: (dest: any) => "#",
                getAnchorUrl: (hash: string) => hash || "#",
                setHash: (hash: string) => {},
                executeNamedAction: (action: string) => {
                  if (action === "NextPage") {
                    setCurrentPage((p) => Math.min(p + 1, numPages));
                    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                  } else if (action === "PrevPage") {
                    setCurrentPage((p) => Math.max(p - 1, 1));
                    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                  } else if (action === "FirstPage") {
                    setCurrentPage(1);
                    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                  } else if (action === "LastPage") {
                    setCurrentPage(numPages);
                    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                  }
                },
                goToDestination: async (dest: any) => {
                  await navigateToDestination(dest);
                },
                navigateTo: async (dest: any) => {
                  await navigateToDestination(dest);
                },
                goToPage: (val: any) => {
                  const p = parseInt(val);
                  if (!isNaN(p) && p >= 1 && p <= numPages) {
                    setCurrentPage(p);
                    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                  }
                },
                addLinkAttributes: (
                  element: HTMLAnchorElement,
                  linkUrl: string,
                  newWindow?: boolean
                ) => {
                  if (linkUrl) {
                    element.href = linkUrl;
                    element.target = newWindow !== false ? "_blank" : "_self";
                    element.rel = "noopener noreferrer nofollow";
                  }
                },
              };

              // If official PDFLinkService from pdf_viewer is ready, enhance it
              const pdfjsViewer = (window as any).pdfjsViewer;
              let effectiveLinkService: any = linkService;
              if (pdfjsViewer && typeof pdfjsViewer.PDFLinkService === "function") {
                try {
                  const official = new pdfjsViewer.PDFLinkService();
                  official.setDocument(pdfDocRef.current);
                  official.setViewer({
                    currentPageNumber: currentPage,
                    pagesRotation: rotation,
                    scrollPageIntoView: (params: any) => {
                      if (params && typeof params.pageNumber === "number") {
                        setCurrentPage(params.pageNumber);
                        scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                      }
                    },
                    nextPage: () => {
                      setCurrentPage((p) => Math.min(p + 1, numPages));
                      scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                    },
                    previousPage: () => {
                      setCurrentPage((p) => Math.max(p - 1, 1));
                      scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                    },
                  });
                  official.goToDestination = async (dest: any) => {
                    await navigateToDestination(dest);
                  };
                  effectiveLinkService = official;
                } catch (e) {
                  // Fall back cleanly to linkService
                }
              }

              const annotLayer = new pdfjs.AnnotationLayer({
                div: annotDiv,
                page: page,
                viewport: viewport.clone({ dontFlip: true }),
              });

              await annotLayer.render({
                annotations,
                linkService: effectiveLinkService,
                renderForms: true,
                imageResourcesPath: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/images/",
              });

              // Guarantee dimensions and position post-render
              annotDiv.style.width = `${Math.floor(viewport.width)}px`;
              annotDiv.style.height = `${Math.floor(viewport.height)}px`;
            }
          } catch (annotErr) {
            console.warn("Annotation layer render warning:", annotErr);
          }
        }
      } catch (err: any) {
        if (err?.name !== "RenderingCancelledException") {
          console.error("Page render error:", err);
        }
      } finally {
        setPageRendering(false);
      }
    },
    [scale, rotation, numPages, currentPage, navigateToDestination]
  );

  useEffect(() => {
    if (pdfDocRef.current && !loading && !error) {
      renderPage(currentPage);
    }
  }, [currentPage, scale, rotation, loading, error, renderPage]);

  // Fit Width Calculation
  const calculateFitWidth = useCallback(() => {
    const pdfDoc = pdfDocRef.current;
    if (!pdfDoc) return;
    pdfDoc.getPage(currentPage).then((page: any) => {
      const unscaledViewport = page.getViewport({ scale: 1, rotation });
      const containerWidth = scrollContainerRef.current?.clientWidth || window.innerWidth;
      const drawerWidth = sidebarMode !== "none" ? 280 : 0;
      const availableWidth = Math.max(containerWidth - drawerWidth - 48, 280);
      const newScale = parseFloat((availableWidth / unscaledViewport.width).toFixed(2));
      setScale(Math.max(0.4, Math.min(newScale, 3.5)));
      setZoomMode("fit-width");
    });
  }, [currentPage, rotation, sidebarMode]);

  // Fit Page Calculation
  const calculateFitPage = useCallback(() => {
    const pdfDoc = pdfDocRef.current;
    if (!pdfDoc) return;
    pdfDoc.getPage(currentPage).then((page: any) => {
      const unscaledViewport = page.getViewport({ scale: 1, rotation });
      const containerHeight = scrollContainerRef.current?.clientHeight || window.innerHeight;
      const availableHeight = Math.max(containerHeight - 48, 280);
      const newScale = parseFloat((availableHeight / unscaledViewport.height).toFixed(2));
      setScale(Math.max(0.4, Math.min(newScale, 3.5)));
      setZoomMode("fit-page");
    });
  }, [currentPage, rotation]);

  // Auto re-calculate fit modes on window resize
  useEffect(() => {
    const handleResize = () => {
      if (zoomMode === "fit-width") calculateFitWidth();
      else if (zoomMode === "fit-page") calculateFitPage();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [zoomMode, calculateFitWidth, calculateFitPage]);

  // Handlers
  const handlePrevPage = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const handleNextPage = () => setCurrentPage((p) => Math.min(p + 1, numPages));

  const handleZoomIn = () => {
    setZoomMode("custom");
    setScale((s) => Math.min(parseFloat((s + 0.15).toFixed(2)), 3.0));
  };
  const handleZoomOut = () => {
    setZoomMode("custom");
    setScale((s) => Math.max(parseFloat((s - 0.15).toFixed(2)), 0.5));
  };
  const handleResetZoom = () => {
    setZoomMode("custom");
    setScale(1.15);
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

  const handleShare = () => {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 4. Robust Fullscreen Handling & Body Scroll Lock
  const enterFullscreen = async () => {
    try {
      if (containerRef.current?.requestFullscreen) {
        await containerRef.current.requestFullscreen();
      } else if ((containerRef.current as any)?.webkitRequestFullscreen) {
        await (containerRef.current as any).webkitRequestFullscreen();
      }
    } catch (e) {
      // Fallback fixed-overlay still applies
    }
    setIsFullscreen(true);
  };

  const exitFullscreen = async () => {
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (
        (document as any).webkitFullscreenElement &&
        (document as any).webkitExitFullscreen
      ) {
        await (document as any).webkitExitFullscreen();
      }
    } catch (e) {}
    setIsFullscreen(false);
  };

  const toggleFullscreen = () => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  };

  // Sync native browser fullscreen events
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNativeFs = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement
      );
      setIsFullscreen(isNativeFs);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Lock background body scroll when in fullscreen
  useEffect(() => {
    if (isFullscreen) {
      const prevBodyOverflow = document.body.style.overflow;
      const prevDocOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = prevBodyOverflow;
        document.documentElement.style.overflow = prevDocOverflow;
      };
    }
  }, [isFullscreen]);

  // Keyboard navigation & Esc key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && ["input", "textarea"].includes(target.tagName.toLowerCase())) {
        return;
      }

      if (e.key === "Escape") {
        if (sidebarMode !== "none") {
          setSidebarMode("none");
        } else if (isFullscreen) {
          exitFullscreen();
        }
      } else if (e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        handleNextPage();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        handlePrevPage();
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === "-") {
        e.preventDefault();
        handleZoomOut();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, sidebarMode, currentPage, numPages]);

  // Delegated click handler on the annotation layer container to capture internal link clicks
  const handleAnnotationLayerClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (!target) return;

    // Check if target is an anchor or inside an anchor
    const anchor = target.closest("a");
    const section = target.closest("section");

    // If external link with http(s), allow normal browser navigation
    if (
      anchor &&
      anchor.href &&
      !anchor.href.endsWith("#") &&
      !anchor.href.startsWith("javascript:") &&
      (anchor.href.startsWith("http://") ||
        anchor.href.startsWith("https://") ||
        anchor.href.startsWith("mailto:"))
    ) {
      return;
    }

    // Prevent default '#' page jumping
    e.preventDefault();

    const annotId =
      target.getAttribute("data-element-id") ||
      anchor?.getAttribute("data-element-id") ||
      section?.getAttribute("data-annotation-id");

    if (annotId && pageAnnotationsRef.current && pageAnnotationsRef.current.length > 0) {
      const annot = pageAnnotationsRef.current.find((a: any) => a.id === annotId);
      if (annot) {
        if (annot.dest) {
          await navigateToDestination(annot.dest);
          return;
        }
        if (annot.action) {
          if (annot.action === "NextPage") {
            setCurrentPage((p) => Math.min(p + 1, numPages));
            scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
          } else if (annot.action === "PrevPage") {
            setCurrentPage((p) => Math.max(p - 1, 1));
            scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
          } else if (annot.action === "FirstPage") {
            setCurrentPage(1);
            scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
          } else if (annot.action === "LastPage") {
            setCurrentPage(numPages);
            scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
          }
          return;
        }
      }
    }

    // Check anchor href hash
    const href = anchor?.getAttribute("href");
    if (href && href !== "#") {
      const hash = href.replace(/^#/, "");
      if (hash.startsWith("page=")) {
        const p = parseInt(hash.replace("page=", ""));
        if (!isNaN(p) && p >= 1 && p <= numPages) {
          setCurrentPage(p);
          scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }
      } else {
        await navigateToDestination(hash);
        return;
      }
    }
  };

  // Bookmark / TOC jump handler
  const handleJumpToDest = async (dest: any) => {
    if (!dest) return;
    await navigateToDestination(dest);
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${
        isFullscreen
          ? "fixed inset-0 z-[99999] w-screen h-[100dvh] bg-slate-950 text-slate-100 flex flex-col overflow-hidden select-none"
          : "w-full space-y-6"
      }`}
    >
      {/* ── Normal Mode Top Header (Hidden in Fullscreen) ── */}
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

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {title}
              </h1>

              <div className="flex items-center gap-2.5 text-xs text-slate-500 flex-wrap">
                {updatedAt && <span>Updated {updatedAt}</span>}
                {numPages > 0 && (
                  <>
                    <span>&bull;</span>
                    <span>{numPages} pages</span>
                  </>
                )}
                <span>&bull;</span>
                <span>PDF Format</span>
                {fileSize && (
                  <>
                    <span>&bull;</span>
                    <span>{fmtBytes(fileSize)}</span>
                  </>
                )}
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition shadow-2xs"
                title="Copy share link"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#bef264] text-slate-900 hover:bg-[#a3e635] transition shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download {fileSize ? fmtBytes(fileSize) : "PDF"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Fullscreen Dedicated Fixed Top Bar ── */}
      {isFullscreen && (
        <header className="shrink-0 h-14 bg-slate-900/95 border-b border-slate-800 px-3 sm:px-5 flex items-center justify-between text-xs text-slate-300 z-30 select-none">
          {/* Left: Exit button & Title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={exitFullscreen}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition"
              title="Exit Fullscreen (Esc)"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exit Fullscreen</span>
            </button>

            <div className="h-4 w-[1px] bg-slate-700 hidden sm:block" />

            <div className="flex items-center gap-2 min-w-0">
              <span className="font-bold text-white truncate max-w-[160px] sm:max-w-xs md:max-w-md">
                {title}
              </span>
              {domainName && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800/60 hidden md:inline">
                  {domainName}
                </span>
              )}
            </div>
          </div>

          {/* Center: Page Controls */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/60 rounded-xl px-2 py-1">
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="p-1 rounded hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:hover:bg-transparent transition"
              title="Previous Page (Left Arrow)"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-1 font-mono text-xs text-slate-200">
              <input
                type="number"
                min={1}
                max={numPages}
                value={inputPage}
                onChange={(e) => setInputPage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const p = parseInt(inputPage);
                    if (!isNaN(p) && p >= 1 && p <= numPages) {
                      setCurrentPage(p);
                    } else {
                      setInputPage(currentPage.toString());
                    }
                  }
                }}
                onBlur={() => {
                  const p = parseInt(inputPage);
                  if (!isNaN(p) && p >= 1 && p <= numPages) {
                    setCurrentPage(p);
                  } else {
                    setInputPage(currentPage.toString());
                  }
                }}
                className="w-10 text-center font-bold bg-slate-900 text-white rounded border border-slate-700 px-1 py-0.5 focus:outline-none focus:border-[#1D64EC]"
              />
              <span className="text-slate-400">/ {numPages}</span>
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage >= numPages}
              className="p-1 rounded hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:hover:bg-transparent transition"
              title="Next Page (Right Arrow)"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right: Drawer toggles & View Tools */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Outline / Contents toggle */}
            <button
              onClick={() =>
                setSidebarMode((m) => (m === "outline" ? "none" : "outline"))
              }
              className={`p-1.5 rounded-lg transition flex items-center gap-1 text-xs font-medium ${
                sidebarMode === "outline"
                  ? "bg-[#1D64EC] text-white"
                  : "hover:bg-slate-800 text-slate-300"
              }`}
              title="Table of Contents"
            >
              <List className="w-4 h-4" />
              <span className="hidden lg:inline">Contents</span>
            </button>

            {/* Thumbnails toggle */}
            <button
              onClick={() =>
                setSidebarMode((m) => (m === "thumbnails" ? "none" : "thumbnails"))
              }
              className={`p-1.5 rounded-lg transition flex items-center gap-1 text-xs font-medium ${
                sidebarMode === "thumbnails"
                  ? "bg-[#1D64EC] text-white"
                  : "hover:bg-slate-800 text-slate-300"
              }`}
              title="Page Thumbnails"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden lg:inline">Pages</span>
            </button>

            <div className="h-4 w-[1px] bg-slate-800 mx-1 hidden sm:block" />

            {/* Fit Width */}
            <button
              onClick={calculateFitWidth}
              className={`p-1.5 rounded-lg transition hidden sm:inline-flex ${
                zoomMode === "fit-width"
                  ? "bg-[#1D64EC] text-white"
                  : "hover:bg-slate-800 text-slate-300"
              }`}
              title="Fit to Width"
            >
              <Scan className="w-4 h-4" />
            </button>

            {/* Fit Page */}
            <button
              onClick={calculateFitPage}
              className={`p-1.5 rounded-lg transition hidden sm:inline-flex ${
                zoomMode === "fit-page"
                  ? "bg-[#1D64EC] text-white"
                  : "hover:bg-slate-800 text-slate-300"
              }`}
              title="Fit Entire Page"
            >
              <Maximize className="w-4 h-4" />
            </button>

            {/* Download */}
            <button
              onClick={handleDownload}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 transition"
              title="Download PDF"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Exit Fullscreen Toggle */}
            <button
              onClick={exitFullscreen}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 transition"
              title="Exit Fullscreen (Esc)"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>
        </header>
      )}

      {/* ── Main Reader Area (Canvas, Sidebar & Scroll Container) ── */}
      <div
        className={`relative flex ${
          isFullscreen ? "flex-1 w-full h-[calc(100dvh-56px)] overflow-hidden bg-slate-950" : "w-full"
        }`}
      >
        {/* ── Slide-over Sidebar Drawer (TOC / Thumbnails) ── */}
        {sidebarMode !== "none" && (
          <aside className="w-72 sm:w-80 h-full bg-slate-900 border-r border-slate-800 flex flex-col z-20 shrink-0 text-slate-200 shadow-2xl animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {sidebarMode === "outline" ? (
                  <>
                    <List className="w-4 h-4 text-[#1D64EC]" />
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-200">
                      Table of Contents
                    </span>
                  </>
                ) : (
                  <>
                    <LayoutGrid className="w-4 h-4 text-[#1D64EC]" />
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-200">
                      Page Thumbnails
                    </span>
                  </>
                )}
              </div>
              <button
                onClick={() => setSidebarMode("none")}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scroll">
              {sidebarMode === "outline" ? (
                outline.length > 0 ? (
                  <div className="space-y-1">
                    {outline.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleJumpToDest(item.dest)}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-slate-800 hover:text-[#1D64EC] transition flex items-center justify-between group"
                      >
                        <span className="truncate">{item.title}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-[#1D64EC] group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-[11px] text-slate-400 px-3 py-1">
                      Quick page index ({numPages} pages)
                    </p>
                    {Array.from({ length: numPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs transition flex items-center justify-between ${
                          currentPage === p
                            ? "bg-[#1D64EC] text-white font-bold"
                            : "hover:bg-slate-800 text-slate-300"
                        }`}
                      >
                        <span>
                          {p === 1 ? "1. Cover & Overview" : `Page ${p}`}
                        </span>
                        {currentPage === p && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-700">
                            Active
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )
              ) : (
                /* Thumbnails Grid */
                <div className="grid grid-cols-2 gap-2.5 p-1">
                  {Array.from({ length: numPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`flex flex-col items-center p-2 rounded-xl border transition-all text-center ${
                        currentPage === p
                          ? "bg-blue-950/60 border-[#1D64EC] ring-2 ring-[#1D64EC]/40"
                          : "bg-slate-800/60 border-slate-700/80 hover:border-slate-500 hover:bg-slate-800"
                      }`}
                    >
                      <div className="w-full h-24 bg-slate-900 rounded-md border border-slate-700/60 flex items-center justify-center text-slate-500 text-xs font-mono mb-1.5">
                        <FileText className="w-6 h-6 text-slate-600" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-300">
                        Page {p}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </aside>
        )}

        {/* ── Scrollable Document Container (ONLY this scrolls!) ── */}
        <div
          ref={scrollContainerRef}
          className={`flex-1 w-full h-full overflow-y-auto overflow-x-auto overscroll-contain flex items-start justify-center p-3 sm:p-6 pb-28 sm:pb-32 transition-all ${
            isFullscreen ? "bg-slate-950" : "bg-transparent"
          }`}
        >
          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#1D64EC]" />
              <p className="text-xs font-semibold text-slate-400">
                Loading interactive study notes...
              </p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-4 my-12">
              <div className="w-12 h-12 rounded-full bg-rose-950/80 border border-rose-800/60 flex items-center justify-center mx-auto text-rose-400">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-1">
                  Unable to display PDF directly
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {error}
                </p>
              </div>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={loadDocument}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry</span>
                </button>
                {url && (
                  <button
                    onClick={handleDownload}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#1D64EC] hover:bg-[#1a56d4] text-white transition flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* PDF Page Canvas & Interactive Annotation Layer */}
          {!loading && !error && (
            <div
              className={`relative bg-white rounded-lg shadow-2xl border border-slate-200/80 overflow-hidden flex items-center justify-center transition-all ${
                pageRendering ? "opacity-95" : "opacity-100"
              }`}
              style={{ minWidth: 280 }}
            >
              {pageRendering && (
                <div className="absolute inset-0 z-20 bg-white/40 backdrop-blur-[0.5px] flex items-center justify-center pointer-events-none">
                  <Loader2 className="w-6 h-6 animate-spin text-[#1D64EC]" />
                </div>
              )}
              <div className="relative inline-block overflow-hidden">
                <canvas ref={canvasRef} className="block select-none" />
                <div
                  ref={annotationLayerRef}
                  onClick={handleAnnotationLayerClick}
                  className="annotationLayer absolute inset-0 pointer-events-auto"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Sleek Floating Bottom Toolbar ── */}
      {!loading && !error && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40">
          <div
            className={`flex items-center gap-2 sm:gap-3 px-3.5 sm:px-4 py-2 rounded-full shadow-2xl backdrop-blur-md transition-all ${
              isFullscreen
                ? "bg-slate-900/90 text-slate-200 border border-slate-700/80 shadow-black/60"
                : "bg-white/95 text-slate-700 border border-slate-200/90 shadow-slate-900/10"
            }`}
          >
            {/* Zoom Out */}
            <button
              onClick={handleZoomOut}
              className={`p-1.5 rounded-full transition ${
                isFullscreen ? "hover:bg-slate-800 text-slate-300" : "hover:bg-slate-100 text-slate-600"
              }`}
              title="Zoom Out (-)"
              aria-label="Zoom out"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            {/* Zoom Level Indicator */}
            <button
              onClick={handleResetZoom}
              className={`text-xs font-bold px-1 transition ${
                isFullscreen
                  ? "text-white hover:text-blue-400"
                  : "text-slate-800 hover:text-[#1D64EC]"
              }`}
              title="Reset Zoom to 100%"
            >
              {Math.round((scale / 1.15) * 100)}%
            </button>

            {/* Zoom In */}
            <button
              onClick={handleZoomIn}
              className={`p-1.5 rounded-full transition ${
                isFullscreen ? "hover:bg-slate-800 text-slate-300" : "hover:bg-slate-100 text-slate-600"
              }`}
              title="Zoom In (+)"
              aria-label="Zoom in"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>

            <div
              className={`w-[1px] h-4 mx-0.5 ${
                isFullscreen ? "bg-slate-700" : "bg-slate-200"
              }`}
            />

            {/* Fit Width shortcut */}
            <button
              onClick={calculateFitWidth}
              className={`p-1.5 rounded-full transition ${
                zoomMode === "fit-width"
                  ? "bg-[#1D64EC] text-white"
                  : isFullscreen
                  ? "hover:bg-slate-800 text-slate-300"
                  : "hover:bg-slate-100 text-slate-600"
              }`}
              title="Fit to Width"
            >
              <Scan className="w-3.5 h-3.5" />
            </button>

            {/* Prev Page */}
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className={`p-1.5 rounded-full transition disabled:opacity-30 disabled:hover:bg-transparent ${
                isFullscreen ? "hover:bg-slate-800 text-slate-300" : "hover:bg-slate-100 text-slate-600"
              }`}
              title="Previous Page (Left Arrow)"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Page Counter */}
            <span
              className={`text-xs font-semibold whitespace-nowrap px-1 font-mono ${
                isFullscreen ? "text-slate-200" : "text-slate-800"
              }`}
            >
              {currentPage} / {numPages}
            </span>

            {/* Next Page */}
            <button
              onClick={handleNextPage}
              disabled={currentPage >= numPages}
              className={`p-1.5 rounded-full transition disabled:opacity-30 disabled:hover:bg-transparent ${
                isFullscreen ? "hover:bg-slate-800 text-slate-300" : "hover:bg-slate-100 text-slate-600"
              }`}
              title="Next Page (Right Arrow)"
              aria-label="Next Page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <div
              className={`w-[1px] h-4 mx-0.5 ${
                isFullscreen ? "bg-slate-700" : "bg-slate-200"
              }`}
            />

            {/* Contents / Outline Drawer Toggle */}
            <button
              onClick={() =>
                setSidebarMode((m) => (m === "outline" ? "none" : "outline"))
              }
              className={`p-1.5 rounded-full transition ${
                sidebarMode === "outline"
                  ? "bg-[#1D64EC] text-white"
                  : isFullscreen
                  ? "hover:bg-slate-800 text-slate-300"
                  : "hover:bg-slate-100 text-slate-600"
              }`}
              title="Table of Contents"
            >
              <List className="w-3.5 h-3.5" />
            </button>

            {/* Rotate */}
            <button
              onClick={handleRotate}
              className={`p-1.5 rounded-full transition ${
                isFullscreen ? "hover:bg-slate-800 text-slate-300" : "hover:bg-slate-100 text-slate-600"
              }`}
              title="Rotate 90 degrees"
              aria-label="Rotate"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className={`p-1.5 rounded-full transition ${
                isFullscreen
                  ? "bg-[#1D64EC] text-white hover:bg-[#1a56d4]"
                  : "hover:bg-slate-100 text-slate-600 hover:text-slate-900"
              }`}
              title={isFullscreen ? "Exit Fullscreen (Esc)" : "Enter Fullscreen (F)"}
              aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
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

      {/* Interactive PDF Annotation Layer Styling */}
      <style jsx global>{`
        .annotationLayer {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          transform-origin: 0 0;
          z-index: 10;
        }
        .annotationLayer section,
        .annotationLayer [data-internal-link],
        .annotationLayer .linkAnnotation,
        .annotationLayer .buttonWidgetAnnotation {
          position: absolute;
          text-align: initial;
          pointer-events: auto !important;
          box-sizing: border-box;
          transform-origin: 0 0;
          cursor: pointer !important;
        }
        .annotationLayer a,
        .annotationLayer button,
        .annotationLayer input {
          pointer-events: auto !important;
          cursor: pointer !important;
        }
        .annotationLayer .linkAnnotation > a,
        .annotationLayer .buttonWidgetAnnotation > a,
        .annotationLayer .buttonWidgetAnnotation > button,
        .annotationLayer .buttonWidgetAnnotation > input,
        .annotationLayer [data-internal-link] > a {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          cursor: pointer !important;
          pointer-events: auto !important;
          background-color: transparent;
          border-radius: 4px;
          display: block !important;
          transition: background-color 0.15s ease, outline 0.15s ease;
        }
        .annotationLayer .linkAnnotation > a:hover,
        .annotationLayer .buttonWidgetAnnotation > a:hover,
        .annotationLayer .buttonWidgetAnnotation > button:hover,
        .annotationLayer [data-internal-link] > a:hover {
          background-color: rgba(29, 100, 236, 0.18) !important;
          outline: 2px solid rgba(29, 100, 236, 0.6) !important;
        }
        .custom-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.6);
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: rgba(100, 116, 139, 0.5);
          border-radius: 4px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 116, 139, 0.8);
        }
      `}</style>
    </div>
  );
}
