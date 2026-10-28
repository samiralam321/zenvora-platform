import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import AdminNotesDashboard from "@/components/admin/notes/AdminNotesDashboard";
import { NOTES_DOMAINS } from "@/lib/notesData";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Notes Management | Zenvora Admin",
};

export default async function AdminNotesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  let domains = await prisma.notesDomain.findMany({
    orderBy: { displayOrder: "asc" },
    include: { _count: { select: { notes: true } } },
  });

  // If database has fewer than 10 domains, automatically seed
  if (domains.length < 10) {
    try {
      for (let i = 0; i < NOTES_DOMAINS.length; i++) {
        const d = NOTES_DOMAINS[i];
        await prisma.notesDomain.upsert({
          where: { slug: d.slug },
          update: { displayOrder: i },
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
      domains = await prisma.notesDomain.findMany({
        orderBy: { displayOrder: "asc" },
        include: { _count: { select: { notes: true } } },
      });
    } catch (e) {
      console.error("Auto-seeding domains error:", e);
    }
  }

  const [totalNotes, publishedNotes, draftNotes] = await Promise.all([
    prisma.note.count(),
    prisma.note.count({ where: { status: "published" } }),
    prisma.note.count({ where: { status: "draft" } }),
  ]);

  const stats = {
    totalDomains: domains.length,
    totalNotes,
    publishedNotes,
    draftNotes,
  };

  return (
    <AdminNotesDashboard
      initialDomains={domains as any}
      stats={stats}
    />
  );
}
