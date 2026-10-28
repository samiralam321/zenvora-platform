import React from "react";
import prisma from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import PdfViewer from "@/components/notes/PdfViewer";
import NotesReaderClient from "@/components/notes/NotesReaderClient";
import { NOTES_DOMAINS } from "@/lib/notesData";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

  // 1. Try loading from database first
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

    return (
      <div className="flex flex-col min-h-screen bg-[#0B1120] text-slate-100 font-sans">
        <Header
          brandName={settings.brandName || "Zenvora"}
          avatarUrl={settings.avatarUrl || "/images/zenvora-logo.png"}
          navItems={navItems.length > 0 ? navItems : undefined}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 pt-24">
          <PdfViewer
            url={dbNote.storagePath || null}
            title={dbNote.title}
            domainName={domainName}
            domainSlug={domainSlug}
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

  // 2. Fall back to static domains data
  const staticDomain = NOTES_DOMAINS.find((d) => d.slug === params.domain);
  if (!staticDomain) notFound();

  const staticResource = staticDomain.resources.find((r) => r.id === params.noteId);
  if (!staticResource) notFound();

  // If static note has a storagePath, use PdfViewer as well
  if ((staticResource as any).storagePath) {
    return (
      <div className="flex flex-col min-h-screen bg-[#0B1120] text-slate-100 font-sans">
        <Header
          brandName={settings.brandName || "Zenvora"}
          avatarUrl={settings.avatarUrl || "/images/zenvora-logo.png"}
          navItems={navItems.length > 0 ? navItems : undefined}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 pt-24">
          <PdfViewer
            url={(staticResource as any).storagePath}
            title={staticResource.title}
            domainName={staticDomain.name}
            domainSlug={staticDomain.slug}
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

  return (
    <div className="flex flex-col min-h-screen bg-[#F1F5F9] text-slate-900 font-sans">
      <Header
        brandName={settings.brandName || "Zenvora"}
        avatarUrl={settings.avatarUrl || "/images/zenvora-logo.png"}
        navItems={navItems.length > 0 ? navItems : undefined}
      />

      <main className="flex-1">
        <NotesReaderClient domain={staticDomain} resource={staticResource} />
      </main>

      <Footer settings={settings} />
      <ScrollToTop />
    </div>
  );
}
