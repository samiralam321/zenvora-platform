import React from "react";
import prisma from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import Image from "next/image";
import { ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MyGearPage() {
  let settings: any = {};
  let navItems: any[] = [];
  let gearItems: any[] = [];

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
    gearItems = await prisma.gearItem.findMany({
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
            EQUIPMENT &amp; WORKSTATION
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mt-1">
            Developer Setup &amp; Gear
          </h1>
          <p className="text-slate-500 text-sm sm:text-base mt-1.5 max-w-2xl leading-relaxed">
            The hardware, peripherals, and workstation tools I use daily to engineer software and record courses.
          </p>
        </div>

        {gearItems.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-2xl border border-slate-100 p-8">
            <p className="text-slate-500 font-medium">No gear items listed yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gearItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition p-6 flex flex-col justify-between"
              >
                <div>
                  {(item.image || item.imageUrl) && (
                    <div className="w-full h-48 relative rounded-xl overflow-hidden mb-4 bg-slate-50 border border-slate-100">
                      <Image
                        src={item.image || item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-2">
                    {item.category && (
                      <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#EEF4FF] text-[#1D64EC]">
                        {item.category}
                      </span>
                    )}
                    {item.price && (
                      <span className="text-xs font-semibold text-slate-700">
                        {item.price}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    {item.name}
                  </h3>

                  {item.description && (
                    <p className="text-xs text-slate-500 leading-relaxed mb-6">
                      {item.description}
                    </p>
                  )}
                </div>

                {(item.url || item.buyUrl) && (
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <a
                      href={item.url || item.buyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-[#1D64EC] flex items-center gap-1.5 hover:underline"
                    >
                      <span>View Product</span>
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
