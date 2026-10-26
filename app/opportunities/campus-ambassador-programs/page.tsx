import React from "react";
import prisma from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import AmbassadorClient from "./AmbassadorClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Campus Ambassador Programs | Zenvora Opportunities",
  description:
    "Discover official campus ambassador and student leadership programs. Lead your campus, build technical communities, connect with industry leaders, and grow your developer profile.",
};

export default async function CampusAmbassadorPage() {
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
    where: { published: true, category: "Campus Ambassador Programs" },
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
        <AmbassadorClient opportunities={opportunities as any} />
      </main>

      <Footer settings={settings} />
      {settings.scrollToTopEnabled !== false && <ScrollToTop />}
    </div>
  );
}
