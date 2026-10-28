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
  let dbDomains: any[] = [];

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

  try {
    dbDomains = await prisma.notesDomain.findMany({
      where: { isPublished: true },
      orderBy: { displayOrder: "asc" },
      include: { _count: { select: { notes: { where: { status: "published" } } } } },
    });

    if (dbDomains.length === 0) {
      // Seed initial 9 domains so database is instantly ready
      const { NOTES_DOMAINS } = await import("@/lib/notesData");
      for (let i = 0; i < NOTES_DOMAINS.length; i++) {
        const d = NOTES_DOMAINS[i];
        await prisma.notesDomain.upsert({
          where: { slug: d.slug },
          update: {},
          create: {
            name: d.name,
            slug: d.slug,
            description: d.description,
            iconName: d.iconName,
            accentColor: d.accentColor,
            pastelBg: d.pastelBg,
            pastelBorder: d.pastelBorder,
            badgeBg: d.badgeBg,
            badgeText: d.badgeText,
            displayOrder: i,
            isPublished: true,
          },
        });
      }
      dbDomains = await prisma.notesDomain.findMany({
        where: { isPublished: true },
        orderBy: { displayOrder: "asc" },
        include: { _count: { select: { notes: { where: { status: "published" } } } } },
      });
    }
  } catch (e) {
    // If DB query fails, fall back to static data (handled in client)
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFCFB] text-slate-900 font-sans">
      <Header
        brandName={settings.brandName || "Zenvora"}
        avatarUrl={settings.avatarUrl || "/images/zenvora-logo.png"}
        navItems={navItems.length > 0 ? navItems : undefined}
      />

      <main className="flex-1 pt-16">
        <NotesLandingClient dbDomains={dbDomains.length > 0 ? dbDomains : undefined} />
      </main>

      <Footer settings={settings} />
      <ScrollToTop />
    </div>
  );
}
