import React from "react";
import prisma from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import Link from "next/link";
import Image from "next/image";
import {
  Cpu,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Download,
  Layers,
  PlaySquare,
} from "lucide-react";
import type { Metadata } from "next";
import { SYSTEM_DESIGN_RESOURCES } from "./systemDesignConfig";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "System Design Track | Zenvora",
    description:
      "Master scalable distributed systems, high-availability architecture, and FAANG interview problem-solving with curated roadmaps, video playlists, and reference books.",
  };
}

// ─── Inline YouTube Icon ───────────────────────────────────────────────────────
function YouTubeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export default async function SystemDesignPage() {
  let settings: any = {};
  try {
    const s = await prisma.setting.findUnique({
      where: { key: "site_settings" },
    });
    if (s?.value) settings = JSON.parse(s.value);
  } catch (e) {}

  const navItems = await prisma.navItem.findMany({
    where: { area: "header", visible: true },
    orderBy: { order: "asc" },
  });

  // ── Fetch ALL System Design playlists + videos from Admin Panel ──────────────
  const sdCategory = await prisma.category.findFirst({
    where: {
      OR: [{ slug: "system-design" }, { name: "System Design" }],
    },
  });

  let playlists: any[] = [];
  let standaloneVideos: any[] = [];

  if (sdCategory) {
    playlists = await prisma.playlist.findMany({
      where: { categoryId: sdCategory.id, visible: true },
      include: {
        videos: { where: { visible: true }, orderBy: { order: "asc" } },
      },
      orderBy: { order: "asc" },
    });

    standaloneVideos = await prisma.video.findMany({
      where: { categoryId: sdCategory.id, playlistId: null, visible: true },
      orderBy: [{ featured: "desc" }, { order: "asc" }],
    });
  }

  const totalVideos =
    playlists.reduce((acc, p) => acc + (p.videos?.length || 0), 0) +
    standaloneVideos.length;

  const bookPdfRes = SYSTEM_DESIGN_RESOURCES.find(
    (r) => r.id === "sd-book-pdf"
  )!;

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900 font-sans">
      <Header
        brandName={settings.brandName || "Zenvora"}
        avatarUrl={settings.avatarUrl || "/images/zenvora-logo.png"}
        navItems={navItems.length > 0 ? navItems : undefined}
      />

      <main className="flex-1 bg-white pt-[75px]">
        {/* ── Hero / Breadcrumb ─────────────────────────────────────────────── */}
        <section className="bg-gradient-to-b from-blue-50/60 via-slate-50/30 to-white border-b border-slate-100 py-10 sm:py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6 font-medium">
              <Link href="/" className="hover:text-slate-900 transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <Link href="/#domains" className="hover:text-slate-900 transition-colors">
                Explore Domains
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[#1D64EC] font-semibold">System Design</span>
            </nav>

            {/* Badge + Title */}
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EEF4FF] text-[#1D64EC] border border-blue-100 mb-4 shadow-2xs">
                <Cpu className="w-3.5 h-3.5 text-[#1D64EC]" />
                <span>Domain Track &bull; Distributed Systems &amp; Architecture</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
                System Design
              </h1>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Master high-scale distributed architectures, system trade-offs, and FAANG
                interview problem-solving with curated roadmaps, video playlists, and
                reference books. Follow the ordered components below to learn foundational
                concepts, dive into advanced system breakdowns, and download comprehensive
                study resources.
              </p>
            </div>

            {/* Quick nav strip */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-3">
              <a
                href="#component-1-videos"
                className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:border-blue-300 transition-all flex items-center gap-3 group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#EEF4FF] text-[#1D64EC] flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-[#1D64EC] group-hover:text-white transition-colors">
                  1
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    YouTube Video Lectures
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {totalVideos} curated video tutorials
                  </div>
                </div>
              </a>

              <a
                href="#component-2-pdf"
                className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:border-blue-300 transition-all flex items-center gap-3 group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#EEF4FF] text-[#1D64EC] flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-[#1D64EC] group-hover:text-white transition-colors">
                  2
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    Best Resource (Book PDF)
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    Free download &amp; interview primer
                  </div>
                </div>
              </a>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#EEF4FF] text-[#1D64EC] flex items-center justify-center font-bold text-xs shrink-0">
                  3
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    Practice &amp; Projects
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    Coming soon
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Main Content ──────────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">

          {/* ── SECTION 1: YouTube Video Lectures (100% Admin Panel driven) ── */}
          <section id="component-1-videos" className="scroll-mt-24">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-7 h-7 rounded-full bg-[#1D64EC] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                1
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#1D64EC]">
                First Step &bull; YouTube Video Resources
              </span>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                Curated Video Lectures &amp; YouTube Playlists
              </h2>
              <p className="text-slate-600 text-sm sm:text-base max-w-3xl leading-relaxed">
                Step-by-step video courses and concept deep-dives organized strictly by playlist
                to help you master large-scale distributed architectures and FAANG interview problems.
              </p>
            </div>

            {/* Playlists from Admin Panel */}
            {playlists.length > 0 ? (
              <div className="space-y-10">
                {playlists.map((playlist) => (
                  <div
                    key={playlist.id}
                    className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs"
                  >
                    {/* Playlist Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 mb-6 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#EEF4FF] text-[#1D64EC] flex items-center justify-center shrink-0">
                          <Layers className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                            {playlist.title}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                            {playlist.channelName && (
                              <span className="font-medium text-slate-700">
                                {playlist.channelName}
                              </span>
                            )}
                            <span>&bull;</span>
                            <span>{playlist.videos?.length || 0} sequential lectures</span>
                          </div>
                        </div>
                      </div>

                      {playlist.youtubeId && (
                        <a
                          href={`https://www.youtube.com/playlist?list=${playlist.youtubeId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#EEF4FF] text-[#1D64EC] border border-blue-200/80 hover:bg-[#1D64EC] hover:text-white transition-all shadow-2xs group/btn self-start sm:self-auto shrink-0"
                        >
                          <YouTubeIcon className="w-3.5 h-3.5 text-red-600 group-hover/btn:text-white transition-colors" />
                          <span>Watch Full Playlist on YouTube</span>
                          <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                        </a>
                      )}
                    </div>

                    {/* Videos Grid — 1 row of max 3 */}
                    {playlist.videos?.length > 0 ? (
                      <div className="flex overflow-x-auto pb-3 -mx-2 px-2 sm:mx-0 sm:px-0 sm:pb-0 lg:grid lg:grid-cols-3 gap-5 snap-x snap-mandatory scrollbar-hide">
                        {playlist.videos.slice(0, 3).map((video: any) => {
                          const ytUrl = `https://www.youtube.com/watch?v=${video.youtubeId}`;
                          return (
                            <div
                              key={video.id}
                              className="w-[82vw] max-w-[320px] sm:w-[calc(50%-10px)] sm:max-w-none lg:w-auto shrink-0 snap-start lg:shrink luxury-card clean-card bg-white rounded-xl border border-slate-100 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
                            >
                              <div>
                                <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
                                  <Image
                                    src={video.thumbnail}
                                    alt={video.title}
                                    fill
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    className="object-cover group-hover:scale-102 transition-transform duration-300"
                                  />
                                  {video.duration && (
                                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-mono font-semibold px-2 py-0.5 rounded-sm">
                                      {video.duration}
                                    </div>
                                  )}
                                </div>
                                <div className="p-4">
                                  <h4 className="font-semibold text-slate-900 text-sm line-clamp-2 leading-snug mb-2 group-hover:text-[#1D64EC] transition-colors">
                                    {video.title}
                                  </h4>
                                  {video.description && (
                                    <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">
                                      {video.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="px-4 pb-4 pt-2 flex items-center justify-between border-t border-slate-50 text-xs">
                                <span className="text-slate-400 text-[11px] truncate max-w-[140px]">
                                  {video.channelName || playlist.channelName}
                                </span>
                                <a
                                  href={ytUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-semibold text-[#1D64EC] hover:text-blue-700 inline-flex items-center gap-1 transition-colors"
                                >
                                  Watch <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-5 text-center">
                        <PlaySquare className="w-7 h-7 text-slate-300 mx-auto mb-2" />
                        <p className="text-slate-400 text-xs">
                          No videos in this playlist yet — add them via Admin Panel.
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              /* No playlists added yet */
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-8 text-center max-w-xl mx-auto">
                <PlaySquare className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <h3 className="font-bold text-slate-900 text-base mb-1">
                  Video Lectures Coming Soon
                </h3>
                <p className="text-slate-500 text-xs sm:text-sm mb-4 leading-relaxed">
                  Curated video lectures for System Design are currently being updated.
                  Explore our other technical domains in the meantime.
                </p>
                <Link
                  href="/watch-tutorials"
                  className="btn-primary inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold"
                >
                  <span>Browse All Lectures &rarr;</span>
                </Link>
              </div>
            )}
          </section>

          {/* ── SECTION 2: Free PDF Book ──────────────────────────────────── */}
          <section id="component-2-pdf" className="scroll-mt-24 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-7 h-7 rounded-full bg-[#1D64EC] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                2
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#1D64EC]">
                Second Step &bull; Free Comprehensive Book &amp; Primer
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
              Follow &amp; Download the Best System Design Resource Book
            </h2>
            <p className="text-slate-600 text-sm sm:text-base max-w-3xl mb-6">
              After watching the video lectures, download the official System Design Primer
              &amp; complete reference handbook to systematically study architectural diagrams,
              trade-off cheat sheets, and interview solutions:
            </p>

            {/* Luxury Feature Card */}
            <div className="rounded-2xl border-2 border-blue-100 bg-gradient-to-br from-[#F8FAFC] via-white to-[#EEF4FF]/50 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-4 max-w-3xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#1D64EC] text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EEF4FF] text-[#1D64EC] border border-blue-200/60 mb-1">
                        Free Download &bull; Complete Reference Handbook
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                        {bookPdfRes.title}
                      </h3>
                      <a
                        href={bookPdfRes.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs sm:text-sm font-semibold text-[#1D64EC] hover:underline inline-flex items-center gap-1"
                      >
                        {bookPdfRes.url}
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  <p className="text-slate-600 text-sm leading-relaxed">
                    {bookPdfRes.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                    {[
                      "Client-Server, Microservices & Event-Driven Patterns",
                      "SQL vs NoSQL, Sharding, Replication & CAP Theorem",
                      "Caching (Redis/Memcached), CDNs & Message Queues (Kafka)",
                      "Complete FAANG Mock Interview Blueprints & Anki Flashcards",
                    ].map((point) => (
                      <div key={point} className="flex items-center gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
                  <a
                    href={bookPdfRes.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-center rounded-xl shadow-md hover:shadow-lg transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>{bookPdfRes.buttonText}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <span className="text-[11px] text-center text-slate-400">
                    Free open-source guide &amp; direct download
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer settings={settings} />
      <ScrollToTop />
    </div>
  );
}
