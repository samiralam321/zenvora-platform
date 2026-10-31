import React from "react";
import { BookOpen } from "lucide-react";

export default function DomainNotesLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 text-slate-900 font-sans">
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

      <main className="flex-1 pb-24">
        {/* Top Header / Breadcrumbs Bar Skeleton */}
        <section className="bg-white border-b border-slate-200/80 pt-28 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 animate-pulse">
            <div className="flex items-center gap-2">
              <div className="h-3.5 w-16 bg-slate-200 rounded" />
              <div className="h-3.5 w-2 text-slate-300">/</div>
              <div className="h-3.5 w-28 bg-slate-200 rounded" />
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-2">
              <div className="space-y-2">
                <div className="h-8 sm:h-10 w-64 sm:w-80 bg-slate-200 rounded-xl" />
                <div className="h-4 w-80 sm:w-96 bg-slate-100 rounded" />
              </div>
              <div className="h-10 w-full sm:w-72 bg-slate-100 rounded-xl" />
            </div>
          </div>
        </section>

        {/* 2-Column Content Layout Skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Sidebar Skeleton */}
            <aside className="lg:col-span-3 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 animate-pulse">
                <div className="h-4 w-24 bg-slate-200 rounded mb-2" />
                <div className="h-9 w-full bg-blue-50 rounded-xl" />
                <div className="h-9 w-full bg-slate-100 rounded-xl" />
                <div className="h-9 w-full bg-slate-100 rounded-xl" />
                <div className="h-9 w-full bg-slate-100 rounded-xl" />
              </div>
            </aside>

            {/* Main Cards List Skeleton */}
            <main className="lg:col-span-9 space-y-4 animate-pulse">
              <div className="h-4 w-36 bg-slate-200 rounded" />

              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-24 bg-slate-100 rounded-full" />
                        <div className="h-4 w-16 bg-slate-100 rounded-full" />
                      </div>
                      <div className="h-5 w-3/4 bg-slate-200 rounded" />
                      <div className="h-3.5 w-5/6 bg-slate-100 rounded" />
                      <div className="h-3 w-40 bg-slate-100 rounded" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <div className="h-9 w-28 bg-blue-100 rounded-xl" />
                    <div className="h-9 w-24 bg-slate-100 rounded-xl" />
                  </div>
                </div>
              ))}
            </main>
          </div>
        </div>
      </main>
    </div>
  );
}
