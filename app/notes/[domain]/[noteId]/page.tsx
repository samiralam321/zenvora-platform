import React from "react";
import prisma from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import PdfViewer from "@/components/notes/PdfViewer";
import { NOTES_DOMAINS } from "@/lib/notesData";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCachedSiteSettings, getCachedNavItems } from "@/lib/cachedData";

export const revalidate = 60;

interface NoteReaderPageProps {
  params: {
    domain: string;
    noteId: string;
  };
}

export async function generateMetadata({
  params,
}: NoteReaderPageProps): Promise<Metadata> {
  try {
    const dbNote = await prisma.note.findFirst({
      where: {
        OR: [{ id: params.noteId }, { slug: params.noteId }],
        status: "published",
      },
      include: { domain: true },
    });
    if (dbNote) {
      return {
        title: `${dbNote.title} | ${dbNote.domain.name} | Zenvora`,
        description: dbNote.description || `Read ${dbNote.title} online on Zenvora`,
      };
    }
  } catch {}

  const domain = NOTES_DOMAINS.find((d) => d.slug === params.domain);
  const resource = domain?.resources.find((r) => r.id === params.noteId);
  if (!domain || !resource) return { title: "Note Not Found | Zenvora" };

  return {
    title: `${resource.title} | ${domain.shortName} | Zenvora`,
    description: resource.description,
  };
}

export default async function NoteReaderPage({ params }: NoteReaderPageProps) {
  const [settings, navItems] = await Promise.all([
    getCachedSiteSettings(),
    getCachedNavItems("header"),
  ]);

  // 1. Try loading published note from database
  let dbNote: any = null;
  try {
    dbNote = await prisma.note.findFirst({
      where: {
        OR: [{ id: params.noteId }, { slug: params.noteId }],
        status: "published",
      },
      include: { domain: true },
    });
  } catch (e) {}

  if (dbNote) {
    const domainName = dbNote.domain?.name || "Notes";
    const domainSlug = dbNote.domain?.slug || params.domain;
    const formattedDate = dbNote.updatedAt
      ? new Date(dbNote.updatedAt).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        })
      : undefined;

    return (
      <div className="flex flex-col min-h-screen bg-slate-50/70 text-slate-900 font-sans">
        <Header
          brandName={settings.brandName || "Zenvora"}
          avatarUrl={settings.avatarUrl || "/images/zenvora-logo.png"}
          navItems={navItems.length > 0 ? navItems : undefined}
        />

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
          <PdfViewer
            url={dbNote.storagePath || null}
            title={dbNote.title}
            domainName={domainName}
            domainSlug={domainSlug}
            category={dbNote.category}
            difficulty={dbNote.difficulty}
            fileSize={dbNote.fileSize}
            updatedAt={formattedDate}
            totalPages={dbNote.pageCount || 1}
            downloadFileName={dbNote.originalFilename || `${dbNote.slug}.pdf`}
            backHref={`/notes/${domainSlug}`}
          />
        </main>

        <Footer settings={settings} />
        <ScrollToTop />
      </div>
    );
  }

  // 2. Fall back to static domains data if note exists with storagePath
  const staticDomain = NOTES_DOMAINS.find((d) => d.slug === params.domain);
  const staticResource = staticDomain?.resources.find((r) => r.id === params.noteId);

  if (!staticDomain || !staticResource) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/70 text-slate-900 font-sans">
      <Header
        brandName={settings.brandName || "Zenvora"}
        avatarUrl={settings.avatarUrl || "/images/zenvora-logo.png"}
        navItems={navItems.length > 0 ? navItems : undefined}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        <PdfViewer
          url={(staticResource as any).storagePath || null}
          title={staticResource.title}
          domainName={staticDomain.name}
          domainSlug={staticDomain.slug}
          category={staticResource.topic}
          difficulty={staticResource.difficulty}
          updatedAt={staticResource.lastUpdated}
          totalPages={staticResource.pages || 1}
          downloadFileName={staticResource.downloadFileName}
          backHref={`/notes/${staticDomain.slug}`}
        />
      </main>

      <Footer settings={settings} />
      <ScrollToTop />
    </div>
  );
}
