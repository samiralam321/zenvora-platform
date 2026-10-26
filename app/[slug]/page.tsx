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

// Clean inline text parser: converts **bold** to <strong>, `code` to <code>, and [text](url) to <a>
function renderInline(text: string): React.ReactNode {
  // First split by markdown links: [label](url)
  const linkRegex = /\[(.*?)\]\((.*?)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = linkRegex.exec(text)) !== null) {
    const preText = text.slice(lastIndex, match.index);
    if (preText) parts.push(parseBoldAndCode(preText, `pre-${match.index}`));
    
    const label = match[1];
    const url = match[2];
    parts.push(
      <a
        key={`link-${match.index}`}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#1D64EC] font-semibold hover:underline"
      >
        {label}
      </a>
    );
    lastIndex = linkRegex.lastIndex;
  }

  const remainder = text.slice(lastIndex);
  if (remainder) parts.push(parseBoldAndCode(remainder, `rem-${lastIndex}`));

  return parts;
}

function parseBoldAndCode(text: string, keyPrefix: string): React.ReactNode {
  // Split on **bold**
  const boldParts = text.split(/\*\*/);
  return (
    <React.Fragment key={keyPrefix}>
      {boldParts.map((part, idx) => {
        // Even indices are regular text, odd indices are bold
        if (idx % 2 === 1) {
          return (
            <strong key={`${keyPrefix}-b-${idx}`} className="font-semibold text-slate-900">
              {parseCode(part, `${keyPrefix}-b-${idx}`)}
            </strong>
          );
        }
        return parseCode(part, `${keyPrefix}-t-${idx}`);
      })}
    </React.Fragment>
  );
}

function parseCode(text: string, keyPrefix: string): React.ReactNode {
  if (!text.includes("`")) return text;
  const parts = text.split(/`/);
  return (
    <React.Fragment key={keyPrefix}>
      {parts.map((p, idx) => {
        if (idx % 2 === 1) {
          return (
            <code
              key={`${keyPrefix}-c-${idx}`}
              className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 text-xs font-mono font-medium"
            >
              {p}
            </code>
          );
        }
        return p;
      })}
    </React.Fragment>
  );
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
  }).format(new Date(page.updatedAt || Date.now()));

  // Filter out redundant initial markdown title or last updated line from body if already in header
  const rawParagraphs: string[] = (page.content || "").split("\n\n");
  const cleanedParagraphs = rawParagraphs.filter((p) => {
    const trimmed = p.trim();
    if (trimmed.startsWith("## ") && trimmed.toLowerCase().includes(page.title.toLowerCase())) return false;
    if (trimmed.toLowerCase().startsWith("**last updated") || trimmed.toLowerCase().startsWith("last updated")) return false;
    return true;
  });

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900 font-sans">
      <Header
        brandName={settings.brandName || "Zenvora"}
        avatarUrl={settings.avatarUrl || "/images/zenvora-logo.png"}
        navItems={navItems.length > 0 ? navItems : undefined}
      />

      <main className="flex-1 pt-32 pb-24">
        <article className="max-w-[760px] mx-auto px-4 sm:px-6">
          {/* Document Header */}
          <div className="border-b border-slate-200 pb-6 mb-10 text-left">
            <span className="text-[11px] uppercase tracking-wider text-[#1D64EC] font-bold">
              Zenvora Legal &amp; Compliance
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mt-2 mb-3">
              {page.title}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Effective Date: {formattedDate}
            </p>
          </div>

          {/* Formatted Content */}
          <div className="text-slate-600 text-sm sm:text-base leading-relaxed space-y-6 text-left">
            {cleanedParagraphs.length > 0 ? (
              cleanedParagraphs.map((paragraph: string, i: number) => {
                const trimmed = paragraph.trim();

                if (trimmed.startsWith("### ")) {
                  return (
                    <h3
                      key={i}
                      className="text-lg sm:text-xl font-bold text-slate-900 pt-4 pb-1 border-b border-slate-100"
                    >
                      {trimmed.replace("### ", "")}
                    </h3>
                  );
                }

                if (trimmed.startsWith("## ")) {
                  return (
                    <h2
                      key={i}
                      className="text-xl sm:text-2xl font-bold text-slate-900 pt-6 pb-2"
                    >
                      {trimmed.replace("## ", "")}
                    </h2>
                  );
                }

                if (trimmed.startsWith("- ")) {
                  const items = trimmed.split("\n- ").map((item) => item.replace(/^- /, "").trim());
                  return (
                    <ul key={i} className="list-disc pl-5 space-y-2 my-3">
                      {items.map((item: string, j: number) => (
                        <li key={j} className="text-slate-700 leading-relaxed">
                          {renderInline(item)}
                        </li>
                      ))}
                    </ul>
                  );
                }

                return (
                  <p key={i} className="leading-relaxed">
                    {renderInline(trimmed)}
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
