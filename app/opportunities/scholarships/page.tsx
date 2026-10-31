import React from "react";
import prisma from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import ScholarshipsClient from "./ScholarshipsClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Scholarships & Financial Aid for Engineering Students | Zenvora",
  description:
    "Discover verified government, corporate, and international scholarships for Indian B.Tech and engineering students. Find financial aid for girls, boys, and all students.",
};

export default async function ScholarshipsPage() {
  let settings: any = {};
  try {
    const s = await prisma.setting.findUnique({ where: { key: "site_settings" } });
    if (s?.value) settings = JSON.parse(s.value);
  } catch (e) {}

  const [navItems, scholarships] = await Promise.all([
    prisma.navItem.findMany({
      where: { area: "header", visible: true },
      orderBy: { order: "asc" },
    }),
    prisma.scholarship.findMany({
      where: { isPublished: true },
      orderBy: [{ isFeatured: "desc" }, { displayOrder: "asc" }, { createdAt: "desc" }],
    }),
  ]);

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900 font-sans">
      <Header
        brandName={settings.brandName || "Zenvora"}
        avatarUrl={settings.avatarUrl || "/images/zenvora-logo.png"}
        navItems={navItems.length > 0 ? navItems : undefined}
      />

      <main className="flex-1 pt-[75px]">
        <ScholarshipsClient initialScholarships={scholarships as any} />
      </main>

      <Footer settings={settings} />
      {settings.scrollToTopEnabled !== false && <ScrollToTop />}
    </div>
  );
}
