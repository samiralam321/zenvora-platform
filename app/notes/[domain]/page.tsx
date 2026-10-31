import React from "react";
import prisma from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import DomainNotesClient from "@/components/notes/DomainNotesClient";
import { NOTES_DOMAINS } from "@/lib/notesData";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCachedSiteSettings, getCachedNavItems } from "@/lib/cachedData";

export const dynamic = "force-dynamic";

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

  const [settings, navItems] = await Promise.all([
    getCachedSiteSettings(),
    getCachedNavItems("header"),
  ]);

  // Load domain from DB — use findFirst so we can filter by both slug AND isPublished
  let dbDomain: any = null;
  let dbNotes: any[] = [];
  try {
    dbDomain = await prisma.notesDomain.findFirst({
      where: {
        slug,
        isPublished: true,
      },
    });
    if (dbDomain) {
      dbNotes = await prisma.note.findMany({
        where: { domainId: dbDomain.id, status: "published" },
        orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
      });
    }
  } catch {}

  // Fall back to static data if DB domain not found (support slug aliases)
  const SLUG_ALIASES: Record<string, string> = {
    "gen-ai": "genai",
    "backend-dev": "backend",
    "ai-ml": "machine-learning",
  };
  const targetSlug = SLUG_ALIASES[slug] || slug;
  const staticDomain = NOTES_DOMAINS.find(
    (d) =>
      d.slug === targetSlug ||
      d.slug === slug ||
      d.slug.replace(/[^a-z0-9]/g, "") === slug.replace(/[^a-z0-9]/g, "")
  );
  if (!dbDomain && !staticDomain) notFound();

  // Build the domain object — prefer DB metadata, fall back to static
  const domain: any = staticDomain
    ? {
        ...staticDomain,
        ...(dbDomain
          ? {
              name: dbDomain.name,
              shortName: dbDomain.name,
              description: dbDomain.description,
            }
          : {}),
      }
    : {
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
        topics: ["All Notes"],
        resources: [],
      };

  // Build 100% dynamic, database-driven specializations and resources
  // Extract all unique categories that actually have published notes in the database
  const dbCategories = Array.from(
    new Set(
      dbNotes
        .map((n: any) => n.category?.trim())
        .filter((c: any) => Boolean(c) && c.toLowerCase() !== "general")
    )
  ) as string[];

  // If the database has notes with categories, the sidebar topics are strictly driven by the database!
  // If no published notes exist yet in the database, fall back to curated domain topics as a placeholder
  if (dbCategories.length > 0) {
    domain.topics = ["All Notes", ...dbCategories];
  } else if (staticDomain && staticDomain.topics && staticDomain.topics.length > 0) {
    domain.topics = staticDomain.topics;
  } else {
    domain.topics = ["All Notes"];
  }

  domain.resources = dbNotes.map((n: any) => ({
    id: n.id,
    title: n.title,
    description:
      n.description || `Comprehensive study notes and reference handbook for ${n.title}.`,
    topic: n.category || "General",
    difficulty: (n.difficulty || "Beginner") as any,
    pages: n.pageCount || 0,
    fileSize: n.fileSize || null,
    lastUpdated: new Date(n.updatedAt).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    }),
    downloadFileName: n.originalFilename || `${n.slug}.pdf`,
    storagePath: n.storagePath || null,
    outline: [],
    chapters: [],
    relatedNotes: [],
  }));

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
