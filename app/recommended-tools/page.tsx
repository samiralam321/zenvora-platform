import React from "react";
import prisma from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import Image from "next/image";
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
          <span className="text-xs uppercase tracking-wider text-[#1D64EC] font-bold">
            Curated Developer Stack
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mt-2">
            Recommended Tools
          </h1>
          <p className="text-slate-500 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
            Essential software, developer tools, libraries, and resources recommended to speed up your engineering workflow.
          </p>
        </div>

        {tools.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-2xl border border-slate-100 p-8">
            <p className="text-slate-500 font-medium">No tools listed yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <div
                key={tool.id}
                className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    {tool.iconUrl ? (
                      <div className="w-10 h-10 rounded-xl relative overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0 flex items-center justify-center">
                        <Image
                          src={tool.iconUrl}
                          alt={tool.name}
                          width={28}
                          height={28}
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100/60 flex items-center justify-center flex-shrink-0">
                        <Wrench className="w-5 h-5 text-[#1D64EC]" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{tool.name}</h3>
                      {tool.category && (
                        <span className="text-[11px] font-semibold text-[#1D64EC]">
                          {tool.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {tool.description && (
                    <p className="text-slate-500 text-xs leading-relaxed mb-4">
                      {tool.description}
                    </p>
                  )}
                </div>

                {tool.affiliateUrl && (
                  <div className="pt-3 border-t border-slate-100 mt-2">
                    <a
                      href={tool.affiliateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-[#1D64EC] hover:underline inline-flex items-center gap-1.5"
                    >
                      <span>Visit Tool</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
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
