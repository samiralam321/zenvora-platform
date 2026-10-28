import React from "react";
import prisma from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import NotesLandingClient from "@/components/notes/NotesLandingClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Student Notes & Handbooks | Zenvora",
    description:
      "Explore carefully organized tech notes, handwritten PDFs, cheat sheets, and study resources across DSA, Web Dev, Backend, AI/ML, and System Design.",
  };
}

export default async function NotesPage() {
  let settings: any = {};
  let navItems: any[] = [];

  try {
    const s = await prisma.setting.findUnique({
      where: { key: "site_settings" },
    });
    if (s?.value) settings = JSON.parse(s.value);
  } catch (e) {}

  try {
    navItems = await prisma.navItem.findMany({
      where: { area: "header", visible: true },
      orderBy: { order: "asc" },
    });
  } catch (e) {}

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFCFB] text-slate-900 font-sans">
      <Header
        brandName={settings.brandName || "Zenvora"}
        avatarUrl={settings.avatarUrl || "/images/zenvora-logo.png"}
        navItems={navItems.length > 0 ? navItems : undefined}
      />

      <main className="flex-1">
        <NotesLandingClient />
      </main>

      <Footer settings={settings} />
      <ScrollToTop />
    </div>
  );
}
