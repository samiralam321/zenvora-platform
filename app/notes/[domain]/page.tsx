import React from "react";
import prisma from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import DomainNotesClient from "@/components/notes/DomainNotesClient";
import { NOTES_DOMAINS } from "@/lib/notesData";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface DomainPageProps {
  params: {
    domain: string;
  };
}

export async function generateMetadata({
  params,
}: DomainPageProps): Promise<Metadata> {
  const domain = NOTES_DOMAINS.find((d) => d.slug === params.domain);
  if (!domain) return { title: "Notes Not Found | Zenvora" };

  return {
    title: `${domain.name} Notes & Handbooks | Zenvora`,
    description: domain.description,
  };
}

export default async function DomainNotesPage({ params }: DomainPageProps) {
  const domain = NOTES_DOMAINS.find((d) => d.slug === params.domain);
  if (!domain) notFound();

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
    <div className="flex flex-col min-h-screen bg-slate-50/50 text-slate-900 font-sans">
      <Header
        brandName={settings.brandName || "Zenvora"}
        avatarUrl={settings.avatarUrl || "/images/zenvora-logo.png"}
        navItems={navItems.length > 0 ? navItems : undefined}
      />

      <main className="flex-1">
        <DomainNotesClient domain={domain} />
      </main>

      <Footer settings={settings} />
      <ScrollToTop />
    </div>
  );
}
