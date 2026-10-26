"use client";

import React from "react";
import Image from "next/image";
import { ArrowUpRight, Instagram, Play } from "lucide-react";

interface ReelItem {
  id: string;
  title: string;
  description?: string | null;
  url: string;
  cover: string;
}

interface ReelsSectionProps {
  data?: {
    heading?: string;
    blurb?: string;
    buttonText?: string;
    buttonUrl?: string;
  };
  reels?: ReelItem[];
}

export default function ReelsSection({
  data = {},
  reels = [],
}: ReelsSectionProps) {
  const heading = data.heading || "Instagram";
  const blurb =
    data.blurb ||
    "Quick ad breakdowns, Andromeda bidding insights, and behind-the-scenes tests at Growth Sahayta.";
  const buttonText = data.buttonText || "Follow on Instagram";
  const buttonUrl =
    data.buttonUrl || "https://www.instagram.com/growth_sahayta";

  const displayReels = reels.slice(0, 2);

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-2">
              {heading}
            </h2>
            <p className="text-slate-500 text-base max-w-xl">
              {blurb}
            </p>
          </div>

          <a
            href={buttonUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-slate-200 hover:border-slate-300 bg-white text-slate-800 text-sm font-medium px-4 py-2 rounded-lg inline-flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <Instagram className="w-4 h-4 text-[#1D64EC]" />
            <span>{buttonText}</span>
          </a>
        </div>

        {/* 2 Reel Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
          {displayReels.map((reel) => (
            <div
              key={reel.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow group"
            >
              <a
                href={reel.url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-[16/10] w-full overflow-hidden block bg-slate-100"
              >
                <Image
                  src={reel.cover}
                  alt={reel.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-102"
                />
                <div className="absolute top-4 left-4 z-10">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-slate-900 text-xs font-semibold shadow-sm">
                    <Instagram className="w-3.5 h-3.5 text-[#1D64EC]" />
                    <span>Instagram Reel</span>
                  </span>
                </div>
              </a>

              <div className="p-6 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg mb-2 group-hover:text-[#1D64EC] transition-colors">
                    {reel.title}
                  </h3>
                  <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed mb-4">
                    {reel.description || "Watch full short-form breakdown on Instagram."}
                  </p>
                </div>

                <div className="pt-2">
                  <a
                    href={reel.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#1D64EC] font-medium text-sm hover:underline inline-flex items-center gap-1"
                  >
                    <span>Watch reel</span>
                    <span>&rarr;</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
