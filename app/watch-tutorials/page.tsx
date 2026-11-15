import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import WatchTutorialsClient from "./WatchTutorialsClient";
import prisma from "@/lib/prisma";
import {
  getCachedSiteSettings,
  getCachedNavItems,
  getCachedCategoriesWithPlaylists,
  getCachedVideos,
} from "@/lib/cachedData";

export const revalidate = 60;

export default async function WatchTutorialsPage({
  searchParams,
}: {
  searchParams: { category?: string; playlist?: string };
}) {
  let settings: any = {};
  let navItems: any[] = [];
  let categories: any[] = [];
  let playlists: any[] = [];
  let videos: any[] = [];

  try {
    const [s, n, catData, vids] = await Promise.all([
      getCachedSiteSettings().catch(() => ({})),
      getCachedNavItems("header").catch(() => []),
      getCachedCategoriesWithPlaylists().catch(() => ({ categories: [], playlists: [] })),
      getCachedVideos().catch(() => []),
    ]);
    settings = s || {};
    navItems = n || [];
    categories = catData?.categories || [];
    playlists = catData?.playlists || [];
    videos = vids || [];
  } catch (err) {
    console.warn("Cached data load had errors, checking direct DB fallback:", err);
  }

  // ─── Bulletproof Fallback ────────────────────────────────────────────────
  // If cache was ever empty (e.g. from serverless cold start), fetch directly from DB
  if (!categories || categories.length === 0 || !videos || videos.length === 0) {
    try {
      const [freshCats, freshPls, freshVids] = await Promise.all([
        categories.length === 0 ? prisma.category.findMany({ orderBy: { order: "asc" } }) : Promise.resolve(categories),
        playlists.length === 0 ? prisma.playlist.findMany({ where: { visible: true }, include: { category: true }, orderBy: { order: "asc" } }) : Promise.resolve(playlists),
        videos.length === 0 ? prisma.video.findMany({ where: { visible: true }, include: { category: true, playlist: true }, orderBy: [{ featured: "desc" }, { order: "asc" }, { publishedAt: "desc" }] }) : Promise.resolve(videos),
      ]);
      if (freshCats && freshCats.length > 0) categories = freshCats;
      if (freshPls && freshPls.length > 0) playlists = freshPls;
      if (freshVids && freshVids.length > 0) videos = freshVids;
    } catch (dbErr) {
      console.error("Direct fallback query failed:", dbErr);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900 font-sans">
      <Header
        brandName={settings.brandName || "Zenvora"}
        avatarUrl={settings.avatarUrl || "/images/zenvora-logo.png"}
        navItems={navItems.length > 0 ? navItems : undefined}
      />

      <main className="flex-1">
        <WatchTutorialsClient
          initialVideos={videos}
          categories={categories}
          playlists={playlists}
          initialCategory={searchParams.category || "all"}
          initialPlaylist={searchParams.playlist || "all"}
          watchModalEnabled={settings.watchModalEnabled === true}
        />
      </main>

      <Footer settings={settings} />
      {settings.scrollToTopEnabled !== false && <ScrollToTop />}
    </div>
  );
}
