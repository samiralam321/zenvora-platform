import React from "react";
import prisma from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const page = await prisma.page.findUnique({
      where: { slug: params.slug },
    });

    if (!page) return {};

    return {
      title: `${page.title} | Zenvora`,
      description: page.metaDescription || undefined,
    };
  } catch (e) {
    return { title: "Zenvora" };
  }
}

export default async function DynamicLegalPage({ params }: PageProps) {
  let page: any = null;
  try {
    page = await prisma.page.findUnique({
      where: { slug: params.slug },
    });
  } catch (e) {}

  if (!page) {
    notFound();
  }

  let settings: any = {};
  try {
    const s = await prisma.setting.findUnique({ where: { key: "site_settings" } });
    if (s?.value) settings = JSON.parse(s.value);
  } catch (e) {}

  let navItems: any[] = [];
  try {
    navItems = await prisma.navItem.findMany({
      where: { area: "header", visible: true },
      orderBy: { order: "asc" },
    });
  } catch (e) {}

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(page.updatedAt));

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900">
      <Header
        brandName={settings.brandName || "Zenvora"}
        avatarUrl={settings.avatarUrl || "/images/zenvora-logo.png"}
        navItems={navItems.length > 0 ? navItems : undefined}
      />

      <main className="flex-1 pt-28 pb-24">
        <article className="max-w-[720px] mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="border-b border-slate-100 pb-6 mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-2">
              {page.title}
            </h1>
            <p className="text-xs text-slate-500 font-mono">
              Last updated: {formattedDate}
            </p>
          </div>

          {/* Body Content */}
          <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed space-y-4">
            {page.content ? (
              page.content.split("\n\n").map((paragraph: string, i: number) => {
                if (paragraph.startsWith("## ")) {
                  return (
                    <h2
                      key={i}
                      className="text-xl font-bold text-slate-900 mt-8 mb-3"
                    >
                      {paragraph.replace("## ", "")}
                    </h2>
                  );
                }
                if (paragraph.startsWith("### ")) {
                  return (
                    <h3
                      key={i}
                      className="text-base font-bold text-slate-900 mt-6 mb-2"
                    >
                      {paragraph.replace("### ", "")}
                    </h3>
                  );
                }
                if (paragraph.startsWith("- ")) {
                  const items = paragraph.split("\n- ");
                  return (
                    <ul key={i} className="list-disc pl-5 space-y-1.5 my-3">
                      {items.map((item: string, j: number) => (
                        <li key={j} className="text-sm">
                          {item.replace("- ", "")}
                        </li>
                      ))}
                    </ul>
                  );
                }
                return (
                  <p key={i} className="text-sm sm:text-base leading-relaxed">
                    {paragraph}
                  </p>
                );
              })
            ) : (
              <p className="text-slate-500 italic">No content available.</p>
            )}
          </div>
        </article>
      </main>

      <Footer settings={settings} />
      <ScrollToTop />
    </div>
  );
}
