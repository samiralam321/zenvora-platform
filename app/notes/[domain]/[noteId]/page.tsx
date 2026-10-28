import React from "react";
import prisma from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
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
  const domain = NOTES_DOMAINS.find((d) => d.slug === params.domain);
  const resource = domain?.resources.find((r) => r.id === params.noteId);
  if (!domain || !resource) return { title: "Note Not Found | Zenvora" };

  return {
    title: `${resource.title} | ${domain.shortName} | Zenvora`,
    description: resource.description,
  };
}

export default async function NoteReaderPage({ params }: NoteReaderPageProps) {
  const domain = NOTES_DOMAINS.find((d) => d.slug === params.domain);
  if (!domain) notFound();

  const resource = domain.resources.find((r) => r.id === params.noteId);
  if (!resource) notFound();

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
    <div className="flex flex-col min-h-screen bg-[#F1F5F9] text-slate-900 font-sans">
      <Header
        brandName={settings.brandName || "Zenvora"}
        avatarUrl={settings.avatarUrl || "/images/zenvora-logo.png"}
        navItems={navItems.length > 0 ? navItems : undefined}
      />

      <main className="flex-1">
        <NotesReaderClient domain={domain} resource={resource} />
      </main>

      <Footer settings={settings} />
      <ScrollToTop />
    </div>
  );
}
