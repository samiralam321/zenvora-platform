import React from "react";
import prisma from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import OpportunitiesClient from "./OpportunitiesClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Opportunities & Programs | Zenvora Student Sanctuary",
  description:
    "Explore open-source programs, hackathons, coding contests, internships, scholarships, and student communities that help you learn, build, and grow.",
};

export default async function OpportunitiesPage() {
  let settings: any = {};
  try {
    const s = await prisma.setting.findUnique({ where: { key: "site_settings" } });
    if (s?.value) settings = JSON.parse(s.value);
  } catch (e) {}

  const navItems = await prisma.navItem.findMany({
    where: { area: "header", visible: true },
    orderBy: { order: "asc" },
  });

  const opportunities = await prisma.opportunity.findMany({
    where: { published: true },
    orderBy: [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
  });

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
