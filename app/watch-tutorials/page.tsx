import React from "react";
import prisma from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import WatchTutorialsClient from "./WatchTutorialsClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function WatchTutorialsPage({
  searchParams,
}: {
  searchParams: { category?: string; playlist?: string };
}) {
  let settings: any = {};
  try {
    const s = await prisma.setting.findUnique({ where: { key: "site_settings" } });
    if (s?.value) settings = JSON.parse(s.value);
  } catch (e) {}

  const navItems = await prisma.navItem.findMany({
    where: { area: "header", visible: true },
    orderBy: { order: "asc" },
  });

  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
  });

  const playlists = await prisma.playlist.findMany({
    where: { visible: true },
    include: {
      category: true,
      videos: { where: { visible: true }, orderBy: { order: "asc" } },
    },
    orderBy: { order: "asc" },
  });

  const videos = await prisma.video.findMany({
    where: { visible: true },
    include: { category: true, playlist: true },
    orderBy: [{ featured: "desc" }, { order: "asc" }, { publishedAt: "desc" }],
  });

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
