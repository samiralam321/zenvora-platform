"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink, Wrench } from "lucide-react";

interface ToolItem {
  id: string;
  name: string;
  logo: string;
  oneLiner: string;
  url: string;
  tag?: string | null;
}

interface ToolsSectionProps {
  data?: {
    heading?: string;
    subheading?: string;
    bottomLinkText?: string;
    bottomLinkUrl?: string;
  };
  tools?: ToolItem[];
}

export default function ToolsSection({
  data = {},
  tools = [],
}: ToolsSectionProps) {
  const heading = data.heading || "Essential Developer Tools";
  const subheading =
    data.subheading || "The battle-tested toolchain every modern engineer uses.";
  const bottomLinkText =
    data.bottomLinkText || "See all recommended tools";
  const bottomLinkUrl = data.bottomLinkUrl || "/recommended-tools";

  const displayTools = tools.slice(0, 6);

  const renderToolCard = (tool: ToolItem) => (
    <div
      key={tool.id}
      className="bg-[#EEF4FF]/70 rounded-2xl p-6 border border-blue-100/60 hover:border-blue-200 hover:shadow-xs transition-all flex flex-col justify-between"
    >
      <div>
        {/* White rounded logo container */}
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-white shadow-xs flex items-center justify-center p-2 overflow-hidden border border-slate-100">
            <Image
              src={tool.logo || "https://icons.duckduckgo.com/ip3/github.com.ico"}
              alt={tool.name}
              width={32}
              height={32}
              className="w-full h-full object-contain"
            />
          </div>

          {tool.tag && (
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-white text-[#1D64EC] border border-blue-100">
              {tool.tag}
            </span>
          )}
        </div>

        {/* Tool Name */}
        <h3 className="font-bold text-slate-900 text-lg sm:text-xl mb-1.5">
          {tool.name}
        </h3>

        {/* Description */}
        <p className="text-slate-500 text-sm leading-relaxed mb-4">
          {tool.oneLiner}
        </p>
      </div>

      {/* View Link */}
      <div>
        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#1D64EC] font-semibold text-sm hover:underline inline-flex items-center gap-1"
        >
          <span>Explore Tool</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-left">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-2">
            {heading}
          </h2>
          <p className="text-slate-500 text-base">
            {subheading}
          </p>
        </div>

        {/* Tools Grid: 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {displayTools.map((tool) => renderToolCard(tool))}
        </div>

        {/* Bottom Link Button */}
        <div className="text-left">
          <Link
            href={bottomLinkUrl}
            className="border border-slate-200 hover:border-slate-300 bg-white text-slate-800 text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors inline-block"
          >
            {bottomLinkText}
          </Link>
        </div>
      </div>
    </section>
  );
}
