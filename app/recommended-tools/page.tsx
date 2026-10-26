import React from "react";
import prisma from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { ExternalLink, Wrench } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RecommendedToolsPage() {
  let settings: any = {};
  let navItems: any[] = [];
  let tools: any[] = [];

  try {
    const s = await prisma.setting.findUnique({ where: { key: "site_settings" } });
    if (s?.value) settings = JSON.parse(s.value);
  } catch (e) {}

  try {
    navItems = await prisma.navItem.findMany({
      where: { area: "header", visible: true },
      orderBy: { order: "asc" },
    });
  } catch (e) {}

  try {
    tools = await prisma.tool.findMany({
      orderBy: { order: "asc" },
    });
  } catch (e) {}

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900 font-sans">
      <Header
        brandName={settings.brandName || "Zenvora"}
        avatarUrl={settings.avatarUrl || "/images/zenvora-logo.png"}
        navItems={navItems.length > 0 ? navItems : undefined}
      />

      <main className="flex-1 pt-28 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-left">
          <span className="text-[11px] uppercase tracking-wider text-[#1D64EC] font-bold">
            STUDENT TOOLCHAIN &amp; IDES
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mt-1">
            Recommended Tools
          </h1>
          <p className="text-slate-500 text-sm sm:text-base mt-1.5 max-w-2xl leading-relaxed">
            Essential software, developer tools, libraries, and resources recommended to speed up your engineering workflow.
          </p>
        </div>

        {tools.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-2xl border border-slate-100 p-8">
            <p className="text-slate-500 font-medium">No tools listed yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <div
                key={tool.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden relative">
                      {tool.logo ? (
                        <img
                          src={tool.logo}
                          alt={tool.name}
                          width={28}
                          height={28}
                          className="w-7 h-7 object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <Wrench className="w-5 h-5 text-slate-400" />
                      )}
                    </div>

                    {tool.tag && (
                      <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#EEF4FF] text-[#1D64EC]">
                        {tool.tag}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-1">
                    {tool.name}
                  </h3>

                  {tool.oneLiner && (
                    <p className="text-xs font-semibold text-slate-700 mb-2">
                      {tool.oneLiner}
                    </p>
                  )}

                  {tool.description && (
                    <p className="text-xs text-slate-500 leading-relaxed mb-6 line-clamp-3">
                      {tool.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-[#1D64EC] flex items-center gap-1.5 hover:underline"
                  >
                    <span>Visit Tool</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer settings={settings} />
      <ScrollToTop />
    </div>
  );
}
