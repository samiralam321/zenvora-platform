import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import NotesLandingClient from "@/components/notes/NotesLandingClient";
import {
  getCachedSiteSettings,
  getCachedNavItems,
  getCachedNotesDomains,
} from "@/lib/cachedData";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Student Notes & Handbooks | Zenvora",
    description:
      "Explore carefully organized tech notes, handwritten PDFs, cheat sheets, and study resources across DSA, Web Dev, Backend, AI/ML, and System Design.",
  };
}

export default async function NotesPage() {
  const [settings, navItems, dbDomains] = await Promise.all([
    getCachedSiteSettings(),
    getCachedNavItems("header"),
    getCachedNotesDomains(),
  ]);

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFCFB] text-slate-900 font-sans">
      <Header
        brandName={settings.brandName || "Zenvora"}
        avatarUrl={settings.avatarUrl || "/images/zenvora-logo.png"}
        navItems={navItems.length > 0 ? navItems : undefined}
      />

      <main className="flex-1">
        <NotesLandingClient dbDomains={dbDomains.length > 0 ? dbDomains : undefined} />
      </main>

      <Footer settings={settings} />
      <ScrollToTop />
    </div>
  );
}
