import React from "react";
import prisma from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import Image from "next/image";

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
    <div className="flex flex-col min-h-screen bg-white text-slate-900">
      <Header
        brandName={settings.brandName || "Zenvora"}
        avatarUrl={settings.avatarUrl || "/images/zenvora-logo.png"}
        navItems={navItems.length > 0 ? navItems : undefined}
      />

      <main className="flex-1 pt-28 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-left">
          <span className="text-xs uppercase tracking-wider text-[#1D64EC] font-bold">
            Equipment & Tools
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mt-2">
            My Gear & Setup
          </h1>
          <p className="text-slate-500 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
            The hardware, studio equipment, and productivity gear I use daily to record lectures, write code, and build projects.
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
                className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  {item.imageUrl && (
                    <div className="w-full h-48 relative rounded-xl overflow-hidden mb-4 bg-slate-50">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  {item.category && (
                    <span className="text-[11px] font-bold text-[#1D64EC] uppercase tracking-wider block mb-1">
                      {item.category}
                    </span>
                  )}
                  <h3 className="font-bold text-slate-900 text-lg mb-1">{item.name}</h3>
                  {item.description && (
                    <p className="text-slate-500 text-xs leading-relaxed mb-4">
                      {item.description}
                    </p>
                  )}
                </div>

                {item.buyUrl && (
                  <div className="pt-3 border-t border-slate-100 mt-2">
                    <a
                      href={item.buyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-[#1D64EC] hover:underline inline-flex items-center gap-1"
                    >
                      <span>View Product</span>
                      <span>&rarr;</span>
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
