import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import WatchTutorialsClient from "./WatchTutorialsClient";
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
  const [settings, navItems, { categories, playlists }, videos] = await Promise.all([
    getCachedSiteSettings(),
    getCachedNavItems("header"),
    getCachedCategoriesWithPlaylists(),
    getCachedVideos(),
  ]);

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
