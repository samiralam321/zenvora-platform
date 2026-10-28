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
  params: { domain: string };
}

export async function generateMetadata({ params }: DomainPageProps): Promise<Metadata> {
  const slug = params.domain;
  try {
    const dbDomain = await prisma.notesDomain.findUnique({ where: { slug } });
    if (dbDomain) {
      return { title: `${dbDomain.name} Notes | Zenvora`, description: dbDomain.description };
    }
  } catch {}
  const domain = NOTES_DOMAINS.find((d) => d.slug === slug);
  if (!domain) return { title: "Notes Not Found | Zenvora" };
  return { title: `${domain.name} Notes | Zenvora`, description: domain.description };
}

export default async function DomainNotesPage({ params }: DomainPageProps) {
  const slug = params.domain;
  let settings: any = {};
  let navItems: any[] = [];

  try {
    const s = await prisma.setting.findUnique({ where: { key: "site_settings" } });
    if (s?.value) settings = JSON.parse(s.value);
  } catch {}
  try {
    navItems = await prisma.navItem.findMany({
      where: { area: "header", visible: true },
      orderBy: { order: "asc" },
    });
  } catch {}

  // Try to load from DB first
  let dbDomain: any = null;
  let dbNotes: any[] = [];
  try {
    dbDomain = await prisma.notesDomain.findUnique({
      where: { slug, isPublished: true },
    });
    if (dbDomain) {
      dbNotes = await prisma.note.findMany({
        where: { domainId: dbDomain.id, status: "published" },
        orderBy: [{ displayOrder: "asc" }, { publishedAt: "desc" }],
      });
    }
  } catch {}

  // Fall back to static data if DB domain not found
  const staticDomain = NOTES_DOMAINS.find((d) => d.slug === slug);
  if (!dbDomain && !staticDomain) notFound();

  const domain = staticDomain || {
    id: dbDomain.id,
    slug: dbDomain.slug,
    number: "01",
    name: dbDomain.name,
    shortName: dbDomain.name,
    description: dbDomain.description,
    iconName: dbDomain.iconName || "FileText",
    pastelBg: dbDomain.pastelBg || "#EEF4FF",
    pastelBorder: dbDomain.pastelBorder || "#BFDBFE",
    accentColor: dbDomain.accentColor || "#1D64EC",
    badgeBg: dbDomain.badgeBg || "#DBEAFE",
    badgeText: dbDomain.badgeText || "#1E40AF",
    pinColor: "blue" as const,
    rotationDeg: -2,
    topics: [],
    resources: [],
  };

  // Merge DB notes into domain resources format for DomainNotesClient
  if (dbNotes.length > 0) {
    domain.resources = dbNotes.map((n: any) => ({
      id: n.id,
      title: n.title,
      description: n.description || "",
      topic: "General",
      difficulty: "Beginner" as const,
      pages: n.pageCount || 0,
      lastUpdated: new Date(n.updatedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      downloadFileName: n.originalFilename || `${n.slug}.pdf`,
      storagePath: n.storagePath || null,
      outline: [],
      chapters: [],
      relatedNotes: [],
    }));
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 text-slate-900 font-sans">
      <Header
        brandName={settings.brandName || "Zenvora"}
        avatarUrl={settings.avatarUrl || "/images/zenvora-logo.png"}
        navItems={navItems.length > 0 ? navItems : undefined}
      />
      <main className="flex-1">
        <DomainNotesClient domain={domain as any} />
      </main>
      <Footer settings={settings} />
      <ScrollToTop />
    </div>
  );
}
