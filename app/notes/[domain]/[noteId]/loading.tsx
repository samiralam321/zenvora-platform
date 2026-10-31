import React from "react";
import { Loader2, ArrowLeft, Download, Share2 } from "lucide-react";

export default function NoteReaderLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50/70 text-slate-900 font-sans">
      {/* Header skeleton bar */}
      <div className="h-[68px] bg-white border-b border-slate-100 flex items-center px-6 sm:px-10 justify-between">
        <div className="h-7 w-28 bg-slate-200/80 rounded-lg animate-pulse" />
        <div className="hidden md:flex items-center gap-6">
          <div className="h-4 w-20 bg-slate-100 rounded animate-pulse" />
          <div className="h-4 w-20 bg-slate-100 rounded animate-pulse" />
          <div className="h-4 w-20 bg-slate-100 rounded animate-pulse" />
        </div>
        <div className="h-9 w-28 bg-slate-200/70 rounded-full animate-pulse" />
      </div>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        <div className="w-full space-y-6 animate-pulse">
          {/* Top Breadcrumb & Metadata Skeleton */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-4 w-24 bg-slate-200 rounded" />
              <div className="h-4 w-3 text-slate-300">/</div>
              <div className="h-4 w-32 bg-slate-200 rounded" />
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
              <div className="space-y-2">
                <div className="h-4 w-28 bg-blue-100 rounded-full" />
                <div className="h-8 sm:h-9 w-72 sm:w-96 bg-slate-200 rounded-xl" />
                <div className="flex items-center gap-3 pt-1">
                  <div className="h-3.5 w-20 bg-slate-200/80 rounded" />
                  <div className="h-3.5 w-16 bg-slate-200/80 rounded" />
                  <div className="h-3.5 w-24 bg-slate-200/80 rounded" />
                </div>
              </div>

              {/* Action Buttons Skeleton */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="h-10 w-24 bg-slate-200 rounded-xl" />
                <div className="h-10 w-36 bg-emerald-100 rounded-xl" />
              </div>
            </div>
          </div>

          {/* PDF Viewer Canvas Skeleton Container */}
          <div className="relative w-full rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl p-6 sm:p-12 min-h-[580px] flex flex-col items-center justify-center overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 via-transparent to-slate-950/40 pointer-events-none" />

            {/* Document sheet representation */}
            <div className="relative w-full max-w-[500px] h-[400px] bg-slate-800/80 rounded-xl border border-slate-700/60 p-8 flex flex-col justify-between shadow-2xl">
              <div className="space-y-4">
                <div className="h-6 w-3/4 bg-slate-700/70 rounded-md" />
                <div className="h-4 w-full bg-slate-700/50 rounded-md" />
                <div className="h-4 w-5/6 bg-slate-700/50 rounded-md" />
                <div className="h-4 w-2/3 bg-slate-700/50 rounded-md" />
              </div>

              {/* Center loading spinner badge */}
              <div className="my-auto py-6 flex flex-col items-center justify-center space-y-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-white tracking-wide">
                    Loading Study Handbook
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Preparing high-definition vector pages...
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="h-3 w-full bg-slate-700/40 rounded" />
                <div className="h-3 w-4/5 bg-slate-700/40 rounded" />
              </div>
            </div>

            {/* Floating Toolbar Skeleton */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-2.5 rounded-full bg-slate-800/90 border border-slate-700/80 shadow-2xl">
              <div className="h-4 w-12 bg-slate-700 rounded" />
              <div className="h-4 w-4 bg-slate-700 rounded-full" />
              <div className="h-4 w-16 bg-slate-700 rounded" />
              <div className="h-4 w-4 bg-slate-700 rounded-full" />
              <div className="h-4 w-8 bg-slate-700 rounded" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
