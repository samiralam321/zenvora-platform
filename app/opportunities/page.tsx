import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import OpportunitiesClient from "./OpportunitiesClient";
import {
  getCachedSiteSettings,
  getCachedNavItems,
  getCachedOpportunities,
} from "@/lib/cachedData";

export const revalidate = 60;

export const metadata = {
  title: "Opportunities & Programs | Zenvora Student Sanctuary",
  description:
    "Explore open-source programs, hackathons, coding contests, internships, scholarships, and student communities that help you learn, build, and grow.",
};

export default async function OpportunitiesPage() {
  const [settings, navItems, opportunities] = await Promise.all([
    getCachedSiteSettings(),
    getCachedNavItems("header"),
    getCachedOpportunities(),
  ]);

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900 font-sans">
      <Header
        brandName={settings.brandName || "Zenvora"}
        avatarUrl={settings.avatarUrl || "/images/zenvora-logo.png"}
        navItems={navItems.length > 0 ? navItems : undefined}
      />

      <main className="flex-1 pt-[75px]">
        <OpportunitiesClient opportunities={opportunities as any} />
      </main>

      <Footer settings={settings} />
      {settings.scrollToTopEnabled !== false && <ScrollToTop />}
    </div>
  );
}
