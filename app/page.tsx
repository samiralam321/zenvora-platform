import React from "react";
import prisma from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import HeroSection from "@/components/home/HeroSection";
import CategorySection from "@/components/home/CategorySection";
import TutorialsSection from "@/components/home/TutorialsSection";
import ToolsSection from "@/components/home/ToolsSection";
import BannerSection from "@/components/home/BannerSection";
import ReelsSection from "@/components/home/ReelsSection";
import AboutSection from "@/components/home/AboutSection";
import CtaSection from "@/components/home/CtaSection";

// Always serve dynamic fresh data from DB
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  // Fetch Site Settings
  let settings: any = {};
  try {
    const s = await prisma.setting.findUnique({ where: { key: "site_settings" } });
    if (s?.value) settings = JSON.parse(s.value);
  } catch (e) {}

  // Fetch Nav Items
  const navItems = await prisma.navItem.findMany({
    where: { area: "header", visible: true },
    orderBy: { order: "asc" },
  });

  // Fetch Sections for Home Page
  const sections = await prisma.section.findMany({
    where: { page: "home", visible: true },
    orderBy: { order: "asc" },
  });

  // Fetch Categories & Playlists
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

  // Fetch Videos (Featured first, then by order/date)
  const videos = await prisma.video.findMany({
    where: { visible: true },
    include: { category: true, playlist: true },
    orderBy: [{ featured: "desc" }, { order: "asc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
  });

  // Fetch Tools
  const tools = await prisma.tool.findMany({
    where: { showOnHome: true },
    orderBy: { order: "asc" },
    take: 5,
  });

  // Fetch Reels
  const reels = await prisma.reel.findMany({
    orderBy: { order: "asc" },
    take: 2,
  });

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900">
      {/* 1. Sticky Translucent Blur Header */}
      <Header
        brandName={settings.brandName || "Zenvora"}
        avatarUrl={settings.avatarUrl || "/images/zenvora-logo.png"}
        navItems={navItems.length > 0 ? navItems : undefined}
      />

      <main id="main-content" className="flex-1">
        {sections.map((section) => {
          let sectionData: any = {};
          try {
            sectionData = JSON.parse(section.data);
          } catch (e) {}

          switch (section.type) {
            case "hero":
              return (
                <HeroSection
                  key={section.id}
                  data={sectionData}
                  latestVideos={videos}
                  categories={categories}
                />
              );

            case "categories":
              return (
                <CategorySection
                  key={section.id}
                  data={sectionData}
                  categories={categories}
                />
              );

            case "tutorials":
              return (
                <TutorialsSection
                  key={section.id}
                  data={sectionData}
                  videos={videos}
                  playlists={playlists}
                  categories={categories}
                />
              );

            case "tools":
              return (
                <ToolsSection
                  key={section.id}
                  data={sectionData}
                  tools={tools}
                />
              );

            case "banner":
              return <BannerSection key={section.id} data={sectionData} />;

            case "reels":
              return (
                <ReelsSection
                  key={section.id}
                  data={sectionData}
                  reels={reels}
                />
              );

            case "about":
              return (
                <AboutSection
                  key={section.id}
                  data={{
                    ...sectionData,
                    photoUrl: settings.aboutPhotoUrl || sectionData.photoUrl,
                    email: settings.businessEmail || sectionData.email,
                  }}
                />
              );

            case "cta":
              return <CtaSection key={section.id} data={sectionData} />;

            default:
              return null;
          }
        })}
      </main>

      {/* 10. Footer with columns and legal links */}
      <Footer settings={settings} />

      {/* Floating Scroll-to-Top Button */}
      {settings.scrollToTopEnabled !== false && <ScrollToTop />}
    </div>
  );
}
