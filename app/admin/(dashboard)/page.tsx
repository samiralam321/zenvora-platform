import React from "react";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Users, Youtube, Wrench, BookOpen, Code2, Plus, ArrowUpRight, Sparkles } from "lucide-react";
import SyncButton from "@/components/admin/SyncButton";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [
    totalDomains,
    totalVideos,
    totalResources,
    totalTools,
    totalLeads,
    domains,
    recentLeads,
  ] = await Promise.all([
    prisma.category.count(),
    prisma.video.count(),
    prisma.resourceItem.count(),
    prisma.tool.count(),
    prisma.lead.count(),
    prisma.category.findMany({
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: { videos: true, resources: true },
        },
      },
    }),
    prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  return (
    <div className="space-y-8 font-sans max-w-6xl">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-[#1D64EC] font-bold">
            ZENVORA ADMIN PORTAL
          </span>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mt-1">
            Platform Overview
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Manage tech learning tracks, import lectures, curate student cheat sheets, and monitor learner engagement.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/domains"
            className="border border-slate-300 hover:border-slate-400 bg-white text-slate-800 text-xs font-semibold py-2 px-3.5 rounded-lg transition flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#1D64EC]" />
            <span>Add Domain</span>
          </Link>
          <Link
            href="/admin/tutorials"
            className="btn-primary text-xs font-semibold py-2 px-3.5 rounded-lg shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Import Lecture</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Learning Domains
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#EEF4FF] text-[#1D64EC] flex items-center justify-center">
              <Code2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900">{totalDomains}</div>
          <div className="text-[11px] text-[#1D64EC] font-semibold mt-1">
            Web Dev, Backend, Full Stack &amp; AI
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Imported Lectures
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#EEF4FF] text-[#1D64EC] flex items-center justify-center">
              <Youtube className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900">{totalVideos}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {totalVideos === 0 ? "Ready for import via Admin" : "Live in curriculum"}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Student Resources
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#EEF4FF] text-[#1D64EC] flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900">{totalResources}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Notes, cheat sheets &amp; starter kits
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Learner Signups
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#EEF4FF] text-[#1D64EC] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900">{totalLeads}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Students accessing roadmaps
          </div>
        </div>
      </div>

      {/* Curriculum Tracks / Domains Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Active Curriculum Tracks
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              The 5 core learning tracks configured for students.
            </p>
          </div>
          <Link
            href="/admin/domains"
            className="text-xs font-semibold text-[#1D64EC] hover:underline flex items-center gap-1"
          >
            <span>Manage Domains</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold text-xs border-b border-slate-200">
              <tr>
                <th className="py-3 px-5">Domain</th>
                <th className="py-3 px-5">Slug</th>
                <th className="py-3 px-5">Description</th>
                <th className="py-3 px-5">Lectures</th>
                <th className="py-3 px-5">Resources</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {domains.map((dom) => (
                <tr key={dom.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 px-5 font-bold text-slate-900">
                    {dom.name}
                  </td>
                  <td className="py-3.5 px-5 font-mono text-xs text-slate-500">
                    /{dom.slug}
                  </td>
                  <td className="py-3.5 px-5 text-xs text-slate-600 max-w-xs truncate">
                    {dom.description}
                  </td>
                  <td className="py-3.5 px-5 font-semibold text-slate-800">
                    {dom._count?.videos || 0}
                  </td>
                  <td className="py-3.5 px-5 font-semibold text-slate-800">
                    {dom._count?.resources || 0}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <Link
                      href={`/admin/tutorials`}
                      className="text-xs text-[#1D64EC] hover:underline font-semibold"
                    >
                      + Add Lecture
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#EEF4FF]/50 border border-blue-100 rounded-2xl p-6">
          <div className="w-10 h-10 rounded-xl bg-[#EEF4FF] text-[#1D64EC] flex items-center justify-center mb-4">
            <Youtube className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Import YouTube Lectures
          </h3>
          <p className="text-xs text-slate-600 mb-4 leading-relaxed">
            Paste any YouTube tutorial URL to auto-extract duration, thumbnail, and assign it to a student learning track.
          </p>
          <Link
            href="/admin/tutorials"
            className="btn-primary text-xs font-semibold py-2 px-3.5 rounded-lg inline-block"
          >
            Go to Lecture Importer &rarr;
          </Link>
        </div>

        <div className="bg-[#EEF4FF]/50 border border-blue-100 rounded-2xl p-6">
          <div className="w-10 h-10 rounded-xl bg-[#EEF4FF] text-[#1D64EC] flex items-center justify-center mb-4">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Curate Student Vault
          </h3>
          <p className="text-xs text-slate-600 mb-4 leading-relaxed">
            Upload notes, copy-paste code snippets, system design diagrams, and starter repos for learners.
          </p>
          <Link
            href="/admin/resources"
            className="btn-primary text-xs font-semibold py-2 px-3.5 rounded-lg inline-block"
          >
            Manage Resources &rarr;
          </Link>
        </div>

        <div className="bg-[#EEF4FF]/50 border border-blue-100 rounded-2xl p-6">
          <div className="w-10 h-10 rounded-xl bg-[#EEF4FF] text-[#1D64EC] flex items-center justify-center mb-4">
            <Wrench className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Developer Toolchain
          </h3>
          <p className="text-xs text-slate-600 mb-4 leading-relaxed">
            Recommend IDEs, API clients, databases, and AI coding assistants that every student developer needs.
          </p>
          <Link
            href="/admin/tools"
            className="btn-primary text-xs font-semibold py-2 px-3.5 rounded-lg inline-block"
          >
            Manage Dev Tools &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
